-- ============================================================================
-- Journal Safe MVP - Supabase Storage Setup
-- Migration: 002_storage_setup.sql
-- ============================================================================
-- Sets up Supabase Storage bucket for journal entry photos with RLS policies
--
-- Key features:
--   - Private storage bucket (photos not publicly accessible)
--   - User-specific folders: {user_id}/{entry_id}_{timestamp}.{ext}
--   - RLS policies ensure users can only access their own photos
--   - File size limits and type restrictions for security
-- ============================================================================

-- ============================================================================
-- CREATE STORAGE BUCKET
-- ============================================================================

-- Create the journal-photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'journal-photos',
  'journal-photos',
  false, -- Private bucket (not publicly accessible without auth)
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Add helpful comment
COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads';

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================

-- Enable RLS on storage.objects (should already be enabled, but ensure it)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- POLICY: Users can upload photos to their own folder
-- ----------------------------------------------------------------------------
-- Users can INSERT objects into storage.objects table
-- Only allowed in their own folder: {user_id}/*
-- This prevents users from uploading to other users' folders

CREATE POLICY "Users can upload own photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Users can upload own photos" ON storage.objects IS
  'Allows authenticated users to upload photos only to their own folder in journal-photos bucket';

-- ----------------------------------------------------------------------------
-- POLICY: Users can view their own photos
-- ----------------------------------------------------------------------------
-- Users can SELECT objects from storage.objects table
-- Only allowed for their own folder: {user_id}/*
-- This prevents users from viewing other users' photos

CREATE POLICY "Users can view own photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Users can view own photos" ON storage.objects IS
  'Allows authenticated users to view photos only from their own folder in journal-photos bucket';

-- ----------------------------------------------------------------------------
-- POLICY: Users can update their own photos (for replacing)
-- ----------------------------------------------------------------------------
-- Users can UPDATE objects in storage.objects table (metadata updates)
-- Only allowed for their own folder: {user_id}/*
-- This allows users to update photo metadata if needed

CREATE POLICY "Users can update own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Users can update own photos" ON storage.objects IS
  'Allows authenticated users to update photo metadata only in their own folder';

-- ----------------------------------------------------------------------------
-- POLICY: Users can delete their own photos
-- ----------------------------------------------------------------------------
-- Users can DELETE objects from storage.objects table
-- Only allowed for their own folder: {user_id}/*
-- This allows users to clean up their old photos

CREATE POLICY "Users can delete own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Users can delete own photos" ON storage.objects IS
  'Allows authenticated users to delete photos only from their own folder in journal-photos bucket';

-- ============================================================================
-- HELPER FUNCTION: Clean up orphaned photos
-- ============================================================================
-- Function to delete photos that belong to deleted journal entries
-- This can be run periodically to clean up storage

CREATE OR REPLACE FUNCTION cleanup_orphaned_photos()
RETURNS TABLE (deleted_count INTEGER) AS $$
DECLARE
  photo_record RECORD;
  entry_id_from_path TEXT;
  total_deleted INTEGER := 0;
BEGIN
  -- Loop through all photos in storage
  FOR photo_record IN
    SELECT name, bucket_id
    FROM storage.objects
    WHERE bucket_id = 'journal-photos'
  LOOP
    -- Extract entry ID from filename (format: {user_id}/{entry_id}_{timestamp}.{ext})
    entry_id_from_path := split_part(split_part(photo_record.name, '/', 2), '_', 1);

    -- Check if journal entry exists
    IF NOT EXISTS (
      SELECT 1 FROM journal_entries WHERE id::text = entry_id_from_path
    ) THEN
      -- Delete orphaned photo
      DELETE FROM storage.objects
      WHERE name = photo_record.name
        AND bucket_id = photo_record.bucket_id;

      total_deleted := total_deleted + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT total_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_orphaned_photos() IS
  'Deletes photos from storage that no longer have corresponding journal entries';

-- ============================================================================
-- TRIGGER: Auto-delete photos when journal entry is deleted
-- ============================================================================
-- Automatically delete associated photos when a journal entry is hard deleted
-- Note: This only applies to hard deletes, not soft deletes (deleted_at)

CREATE OR REPLACE FUNCTION delete_journal_entry_photos()
RETURNS TRIGGER AS $$
DECLARE
  user_id_text TEXT;
  entry_id_text TEXT;
  photo_pattern TEXT;
BEGIN
  -- Only proceed if the entry has a photo_url
  IF OLD.photo_url IS NOT NULL THEN
    user_id_text := OLD.user_id::text;
    entry_id_text := OLD.id::text;

    -- Pattern to match photos for this entry: {user_id}/{entry_id}_*.*
    photo_pattern := user_id_text || '/' || entry_id_text || '_%';

    -- Delete all photos matching this pattern
    DELETE FROM storage.objects
    WHERE bucket_id = 'journal-photos'
      AND name LIKE photo_pattern;

    RAISE NOTICE 'Deleted photos for journal entry %', entry_id_text;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_journal_entry_deleted
  BEFORE DELETE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION delete_journal_entry_photos();

COMMENT ON FUNCTION delete_journal_entry_photos() IS
  'Automatically deletes photos from storage when journal entry is hard deleted';

-- ============================================================================
-- INDEXES FOR STORAGE PERFORMANCE
-- ============================================================================

-- Index on storage.objects for faster folder-based queries
CREATE INDEX IF NOT EXISTS idx_storage_objects_user_folder
ON storage.objects(bucket_id, (storage.foldername(name))[1])
WHERE bucket_id = 'journal-photos';

COMMENT ON INDEX idx_storage_objects_user_folder IS
  'Improves performance when querying photos by user folder in journal-photos bucket';

-- ============================================================================
-- STORAGE FOLDER STRUCTURE
-- ============================================================================
--
-- Photos are organized as follows:
--
-- journal-photos/
--   {user_id}/                     <- User folder (UUID)
--     {entry_id}_1234567890.jpg    <- Photo filename (entry UUID + timestamp)
--     {entry_id}_1234567891.png    <- Multiple photos per entry supported
--     ...
--
-- Example:
--   journal-photos/
--     550e8400-e29b-41d4-a716-446655440000/
--       a1b2c3d4-e5f6-7890-abcd-ef1234567890_1699564800000.jpg
--       a1b2c3d4-e5f6-7890-abcd-ef1234567890_1699564820000.png
--
-- Benefits:
--   - Easy to query all photos for a user
--   - Easy to delete all photos for a user
--   - Unique filenames prevent collisions
--   - Timestamp allows tracking upload time
--
-- ============================================================================

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================
--
-- 1. AUTHENTICATION REQUIRED:
--    - All storage policies require authentication (TO authenticated)
--    - Anonymous users cannot access journal photos
--
-- 2. USER ISOLATION:
--    - RLS policies enforce folder-level isolation
--    - Users can only access their own folder: {user_id}/*
--    - storage.foldername(name)[1] extracts the first folder segment
--
-- 3. BUCKET PRIVACY:
--    - Bucket is private (public = false)
--    - Photos require authentication to access
--    - Even with public URL, auth is required
--
-- 4. FILE SIZE LIMITS:
--    - 5MB maximum file size enforced at bucket level
--    - Client should compress images before upload (target: 2MB)
--
-- 5. FILE TYPE RESTRICTIONS:
--    - Only image types allowed: jpeg, jpg, png, heic
--    - Enforced at bucket level via allowed_mime_types
--
-- ============================================================================

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================
--
-- 1. UPLOAD PHOTO (via Supabase JS client):
--
--    const { data, error } = await supabase.storage
--      .from('journal-photos')
--      .upload('{userId}/{entryId}_{timestamp}.jpg', file);
--
-- 2. GET PHOTO URL:
--
--    const { data } = supabase.storage
--      .from('journal-photos')
--      .getPublicUrl('{userId}/{entryId}_{timestamp}.jpg');
--
-- 3. DELETE PHOTO:
--
--    const { error } = await supabase.storage
--      .from('journal-photos')
--      .remove(['{userId}/{entryId}_{timestamp}.jpg']);
--
-- 4. LIST USER'S PHOTOS:
--
--    const { data, error } = await supabase.storage
--      .from('journal-photos')
--      .list('{userId}');
--
-- ============================================================================

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
--   1. Run this migration: supabase db push
--   2. Test photo upload from mobile app
--   3. Verify RLS policies with different users
--   4. Monitor storage usage via Supabase dashboard
--   5. Set up periodic cleanup job for orphaned photos (optional)
-- ============================================================================
