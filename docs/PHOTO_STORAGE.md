# Photo Storage Setup - Journal Safe MVP

This document explains how photo storage works in Journal Safe MVP using Supabase Storage.

## Overview

Journal entries can include optional photos that are:
- Stored securely in Supabase Storage (not locally only)
- Compressed before upload to save bandwidth and storage
- Protected by Row Level Security (RLS) policies
- Uploaded with automatic retry logic for reliability

## Architecture

### Folder Structure

Photos are organized in a hierarchical folder structure:

```
journal-photos/                          (bucket)
  {user_id}/                             (user folder)
    {entry_id}_1699564800000.jpg         (photo file)
    {entry_id}_1699564820000.png         (another photo)
```

**Example:**
```
journal-photos/
  550e8400-e29b-41d4-a716-446655440000/
    a1b2c3d4-e5f6-7890-abcd-ef1234567890_1699564800000.jpg
```

### Upload Flow

1. **User selects photo** in `app/(tabs)/journal/new.tsx`
2. **Photo saved to local cache** (photoUri stored in entry)
3. **Journal entry created** with `photo_url = null`
4. **Text content synced** to Supabase database
5. **Background photo upload**:
   - Image validated (size, type)
   - Image compressed (max 2MB, 1920px width)
   - Upload to Supabase Storage with retry
   - Get public URL
   - Update journal entry with `photo_url`
6. **Entry marked as synced** when complete

## Files Overview

### 1. Storage Migration (`supabase/migrations/002_storage_setup.sql`)

Creates the storage bucket and RLS policies:
- **Bucket**: `journal-photos` (private, 5MB limit)
- **RLS Policies**:
  - Users can upload to their own folder
  - Users can view their own photos
  - Users can update their own photos
  - Users can delete their own photos

**Run migration:**
```bash
# Using Supabase CLI
supabase db push

# Or manually apply in Supabase Dashboard
```

### 2. Storage Types (`types/storage.ts`)

Defines TypeScript types and constants:
- `STORAGE_CONFIG` - Bucket configuration constants
- `UploadStatus` - Photo upload status enum
- `PhotoUploadResult` - Upload result interface
- `PhotoCompressionResult` - Compression result interface
- `StorageError` - Error types and messages
- `RetryConfig` - Retry configuration

### 3. Image Compression (`utils/imageCompression.ts`)

Handles image compression before upload:
- `compressImage()` - Compress image to target size
- `validateImage()` - Validate file size and type
- `getFileExtension()` - Extract file extension
- `generateStorageFilename()` - Generate unique filename

**Compression settings:**
- Max original size: 5MB
- Target compressed size: 2MB
- Max width: 1920px (maintains aspect ratio)
- Quality: 0.8 (80%)
- Format: JPEG
- Allowed types: jpg, jpeg, png, heic

### 4. Storage Helpers (`utils/storageHelpers.ts`)

Provides storage operations with retry logic:
- `uploadPhotoWithRetry()` - Upload with exponential backoff
- `uploadPhoto()` - Single upload attempt
- `getPhotoUrl()` - Get public URL from storage path
- `deletePhoto()` - Delete photo from storage
- `downloadPhoto()` - Download photo to local cache
- `checkStorageAccess()` - Verify bucket accessibility
- `getUserStorageUsage()` - Get user's total storage usage

**Retry configuration:**
- Max retries: 3
- Initial delay: 1 second
- Max delay: 30 seconds
- Backoff multiplier: 2x (exponential)

### 5. Journal Storage (`utils/journalStorage.ts`)

Integrated photo upload into sync system:
- `uploadPhoto()` - Upload photo for entry
- `syncPhoto()` - Handle photo sync queue item
- `syncSingleEntry()` - Modified to queue photo uploads

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

Required packages:
- `expo-image-manipulator` - Image compression
- `expo-file-system` - File operations
- `base64-arraybuffer` - Base64 to ArrayBuffer conversion

### 2. Run Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of supabase/migrations/002_storage_setup.sql
# 3. Run the SQL
```

### 3. Verify Storage Bucket

In Supabase Dashboard:
1. Go to **Storage**
2. Verify `journal-photos` bucket exists
3. Check bucket settings:
   - Public: **No**
   - File size limit: **5 MB**
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/heic`

### 4. Test Photo Upload

1. Run the app: `npm start`
2. Create a new journal entry
3. Add a photo
4. Save the entry
5. Verify in Supabase Dashboard:
   - Check `journal_entries` table for `photo_url`
   - Check `Storage > journal-photos` for the uploaded file

## Security

### Row Level Security (RLS)

All storage operations are protected by RLS policies:

```sql
-- Users can only upload to their own folder
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only view their own photos
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'journal-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### File Validation

Before upload, files are validated:
- Maximum size: 5MB (before compression)
- Allowed types: jpg, jpeg, png, heic
- Files are compressed to 2MB max
- Invalid files are rejected with user-friendly errors

## Error Handling

### Retryable Errors

These errors trigger automatic retry with exponential backoff:
- Network errors
- Timeout errors
- Connection errors

### Non-Retryable Errors

These errors fail immediately:
- File too large (after compression)
- Invalid file type
- Permission denied
- Storage quota exceeded

### Error Messages

User-friendly error messages are shown for:
- File too large
- Invalid file type
- Upload failed
- Network errors
- Storage quota exceeded

## Offline Support

Photo uploads work seamlessly offline:

1. **Offline creation**: Photo saved locally with `photoUri`
2. **Text sync first**: When online, text content syncs first
3. **Photo queued**: Photo upload added to sync queue
4. **Background upload**: Photo uploads in background
5. **Retry on failure**: Automatic retry if upload fails
6. **Status tracking**: UI shows sync status (`PHOTO_PENDING`, `SYNCED`, `FAILED`)

## Monitoring

### Check Upload Status

```typescript
import { getSyncStatusMessage, getSyncStatusIcon } from '~/utils/journalStorage';

const statusMessage = getSyncStatusMessage(entry);
const statusIcon = getSyncStatusIcon(entry);

// Status messages:
// - "Saved on this device" (LOCAL_ONLY)
// - "Waiting to sync..." (PENDING)
// - "Syncing..." (SYNCING)
// - "Text synced, photo uploading..." (PHOTO_PENDING)
// - "Synced" (SYNCED)
// - "Sync failed - will retry" (FAILED)
```

### Check Storage Usage

```typescript
import { getUserStorageUsage } from '~/utils/storageHelpers';

const totalBytes = await getUserStorageUsage(userId);
const totalMB = totalBytes ? (totalBytes / (1024 * 1024)).toFixed(2) : '0';
console.log(`Storage used: ${totalMB} MB`);
```

### Check Bucket Access

```typescript
import { checkStorageAccess } from '~/utils/storageHelpers';

const hasAccess = await checkStorageAccess();
if (!hasAccess) {
  console.error('Storage bucket not accessible');
}
```

## Maintenance

### Cleanup Orphaned Photos

Run this SQL function periodically to delete photos without journal entries:

```sql
SELECT * FROM cleanup_orphaned_photos();
```

### Auto-Delete on Entry Deletion

Photos are automatically deleted when journal entries are hard deleted (not soft deleted):

```typescript
// Hard delete (triggers auto-delete of photos)
await supabase
  .from('journal_entries')
  .delete()
  .eq('id', entryId);

// Soft delete (photos remain)
await supabase
  .from('journal_entries')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', entryId);
```

## Troubleshooting

### Issue: "Permission denied" error

**Cause**: RLS policies not set up correctly

**Solution**:
1. Verify migration ran successfully
2. Check RLS policies in Supabase Dashboard
3. Ensure user is authenticated

### Issue: "File too large" error

**Cause**: Original file exceeds 5MB

**Solution**:
1. Check file size before selection
2. Image picker should compress (quality: 0.7)
3. Validation will reject files > 5MB

### Issue: Photo upload stuck in "PHOTO_PENDING"

**Cause**: Upload failed and retry limit exceeded

**Solution**:
1. Check network connectivity
2. Check Supabase logs for errors
3. Manually retry: call `syncPendingEntries()`

### Issue: "Bucket not found" error

**Cause**: Storage bucket not created

**Solution**:
1. Run migration: `supabase db push`
2. Or manually create bucket in Dashboard
3. Verify bucket name is `journal-photos`

## API Reference

### Upload Photo

```typescript
import { uploadPhotoWithRetry } from '~/utils/storageHelpers';

const result = await uploadPhotoWithRetry(
  uri,        // Local file URI
  entryId,    // Journal entry ID
  userId,     // User ID
  {           // Optional retry config
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  }
);

if (result.success) {
  console.log('Photo URL:', result.publicUrl);
  console.log('Storage path:', result.storagePath);
} else {
  console.error('Upload failed:', result.error);
}
```

### Delete Photo

```typescript
import { deletePhoto } from '~/utils/storageHelpers';

const success = await deletePhoto(storagePath);
```

### Get Photo URL

```typescript
import { getPhotoUrl } from '~/utils/storageHelpers';

const publicUrl = getPhotoUrl(storagePath);
```

### Compress Image

```typescript
import { compressImage } from '~/utils/imageCompression';

const result = await compressImage(
  uri,          // Local file URI
  2097152,      // Target size (2MB)
  1920          // Max width (1920px)
);

if (result.success) {
  console.log('Compressed URI:', result.uri);
  console.log('Final size:', result.size, 'bytes');
}
```

## Performance Considerations

### Image Compression

- Images compressed before upload to reduce bandwidth
- Progressive quality reduction if target size not met
- Dimension reduction as last resort
- Typical compression: 4-5MB → 1-2MB

### Upload Speed

- Compressed images upload faster
- Retry logic handles network issues
- Background upload doesn't block UI
- User can continue using app during upload

### Storage Limits

- 5MB per file (before compression)
- 2MB target after compression
- Total storage depends on Supabase plan
- Monitor usage with `getUserStorageUsage()`

## Best Practices

1. **Always compress images** before upload
2. **Handle errors gracefully** with user-friendly messages
3. **Use retry logic** for network reliability
4. **Monitor storage usage** to avoid quota issues
5. **Clean up orphaned photos** periodically
6. **Test offline scenarios** thoroughly
7. **Validate files** before processing
8. **Use async/await** for all storage operations

## Next Steps

1. **Implement photo deletion** when user deletes entry
2. **Add photo edit/replace** functionality
3. **Show upload progress** in UI
4. **Add storage quota warning** when near limit
5. **Implement photo thumbnail** generation
6. **Add photo gallery** view for entries
7. **Support multiple photos** per entry

## Support

For issues or questions:
1. Check Supabase Storage logs
2. Review RLS policies in Dashboard
3. Check network connectivity
4. Verify bucket configuration
5. Test with different image types/sizes
