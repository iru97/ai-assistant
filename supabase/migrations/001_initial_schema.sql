-- ============================================================================
-- Journal Safe MVP - Initial Database Schema
-- ============================================================================
-- This schema supports an eating disorder-safe wellness journaling app
-- Key principles:
--   - Offline-first architecture with sync support
--   - Anonymous/pseudonym users (NO real names required)
--   - Focus on feelings/emotions (NO quantitative tracking)
--   - Simple, secure, and focused on user privacy
-- ============================================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

-- Mood enum: 5 simple emotions for tracking emotional state
-- Deliberately limited to avoid over-analysis or obsessive tracking
CREATE TYPE mood_type AS ENUM (
  'calm',
  'happy',
  'anxious',
  'sad',
  'overwhelmed'
);

-- Language preference enum
CREATE TYPE language_type AS ENUM (
  'en',
  'es',
  'fr',
  'de',
  'pt'
);

-- ============================================================================
-- TABLE: profiles
-- ============================================================================
-- Extends Supabase auth.users with app-specific user data
-- Design decisions:
--   - Allows pseudonyms (display_name) instead of real names
--   - References auth.users(id) for authentication
--   - Keeps minimal personal information for privacy
--   - One-to-one relationship with auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT, -- Optional pseudonym, NOT required to be real name
  avatar_url TEXT, -- Optional avatar photo URL (stored in Supabase Storage)
  bio TEXT, -- Optional short bio/note about self
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add helpful comment
COMMENT ON TABLE profiles IS 'User profiles with pseudonym support for anonymous journaling';
COMMENT ON COLUMN profiles.display_name IS 'Optional pseudonym - NOT required to be real name';

-- ============================================================================
-- TABLE: user_settings
-- ============================================================================
-- Stores user preferences and app settings
-- Design decisions:
--   - Separate from profiles for cleaner data model
--   - All settings have sensible defaults
--   - Supports notification preferences (future feature)
--   - Language preference for internationalization
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification preferences
  daily_prompt_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  daily_prompt_time TIME DEFAULT '09:00:00', -- Default: 9 AM local time
  daily_affirmation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  daily_affirmation_time TIME DEFAULT '08:00:00', -- Default: 8 AM local time

  -- App preferences
  language language_type NOT NULL DEFAULT 'en',
  theme TEXT DEFAULT 'light', -- 'light', 'dark', 'auto'

  -- Privacy settings
  require_auth_on_app_open BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one settings record per user
  UNIQUE(user_id)
);

COMMENT ON TABLE user_settings IS 'User preferences and app settings';
COMMENT ON COLUMN user_settings.daily_prompt_time IS 'Local time for daily journaling prompt notification';
COMMENT ON COLUMN user_settings.require_auth_on_app_open IS 'Extra privacy: require authentication when app opens';

-- ============================================================================
-- TABLE: journal_entries
-- ============================================================================
-- Core table for journaling functionality
-- Design decisions:
--   - Supports offline-first with is_synced flag
--   - client_created_at preserves offline entry timestamp
--   - mood is optional (not every entry needs a mood)
--   - photo_url is optional (stored in Supabase Storage)
--   - NO quantitative metrics (no numbers, weights, calories, etc.)
--   - Focuses on feelings and emotions only
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Entry content
  title TEXT, -- Optional title for the entry
  content TEXT NOT NULL, -- Main journal text (required)
  mood mood_type, -- Optional mood selection
  photo_url TEXT, -- Optional photo URL from Supabase Storage

  -- Offline sync support
  is_synced BOOLEAN NOT NULL DEFAULT FALSE, -- Tracks if entry is synced to server
  client_created_at TIMESTAMPTZ NOT NULL, -- Timestamp from client (preserves offline entry time)

  -- Server timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When record was created on server
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When record was last updated

  -- Soft delete support (for future recovery feature)
  deleted_at TIMESTAMPTZ -- NULL = active, timestamp = soft deleted
);

COMMENT ON TABLE journal_entries IS 'User journal entries with offline sync support';
COMMENT ON COLUMN journal_entries.is_synced IS 'FALSE when created offline, TRUE once synced to server';
COMMENT ON COLUMN journal_entries.client_created_at IS 'Preserves exact time entry was created on device (even if synced later)';
COMMENT ON COLUMN journal_entries.deleted_at IS 'Soft delete timestamp for potential recovery feature';

-- ============================================================================
-- TABLE: prompts
-- ============================================================================
-- Static journaling prompts for self-reflection
-- Design decisions:
--   - Pre-populated by admin/migration (not user-generated)
--   - Simple structure: just text and category
--   - is_active allows disabling prompts without deleting
--   - category allows filtering (e.g., "self-compassion", "gratitude")
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Prompt content
  prompt_text TEXT NOT NULL, -- The actual prompt question/statement
  category TEXT, -- Optional category (e.g., "self-compassion", "gratitude", "reflection")

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE, -- Allows disabling prompts

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE prompts IS 'Static journaling prompts for daily self-reflection';
COMMENT ON COLUMN prompts.is_active IS 'Allows disabling prompts without deleting them';

-- ============================================================================
-- TABLE: affirmations
-- ============================================================================
-- Static affirmations for ED recovery support
-- Design decisions:
--   - Pre-populated by admin/migration (not user-generated)
--   - Simple structure focused on positive messaging
--   - is_active allows content moderation
--   - category allows themed affirmations
CREATE TABLE affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Affirmation content
  affirmation_text TEXT NOT NULL, -- The actual affirmation statement
  category TEXT, -- Optional category (e.g., "body-positive", "self-worth", "recovery")

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE, -- Allows disabling affirmations

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE affirmations IS 'Static affirmations for eating disorder recovery support';
COMMENT ON COLUMN affirmations.is_active IS 'Allows content moderation without deletion';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX idx_profiles_updated_at ON profiles(updated_at);

-- User settings indexes
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Journal entries indexes
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_client_created_at ON journal_entries(client_created_at DESC);
CREATE INDEX idx_journal_entries_is_synced ON journal_entries(is_synced) WHERE is_synced = FALSE;
CREATE INDEX idx_journal_entries_deleted_at ON journal_entries(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_journal_entries_user_active ON journal_entries(user_id, client_created_at DESC)
  WHERE deleted_at IS NULL; -- Composite index for fetching user's active entries

-- Prompts indexes
CREATE INDEX idx_prompts_is_active ON prompts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_prompts_category ON prompts(category) WHERE is_active = TRUE;

-- Affirmations indexes
CREATE INDEX idx_affirmations_is_active ON affirmations(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_affirmations_category ON affirmations(category) WHERE is_active = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- USER_SETTINGS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own settings (during signup)
CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own settings
CREATE POLICY "Users can delete own settings"
  ON user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- JOURNAL_ENTRIES POLICIES
-- ----------------------------------------------------------------------------

-- Users can view their own journal entries
CREATE POLICY "Users can view own journal entries"
  ON journal_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own journal entries
CREATE POLICY "Users can insert own journal entries"
  ON journal_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own journal entries
CREATE POLICY "Users can update own journal entries"
  ON journal_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own journal entries
CREATE POLICY "Users can delete own journal entries"
  ON journal_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- PROMPTS POLICIES
-- ----------------------------------------------------------------------------

-- All authenticated users can view active prompts
-- (Prompts are not user-specific, they're shared content)
CREATE POLICY "Authenticated users can view active prompts"
  ON prompts
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- Only admins can modify prompts (handled via service role, not RLS)
-- No INSERT/UPDATE/DELETE policies for regular users

-- ----------------------------------------------------------------------------
-- AFFIRMATIONS POLICIES
-- ----------------------------------------------------------------------------

-- All authenticated users can view active affirmations
-- (Affirmations are not user-specific, they're shared content)
CREATE POLICY "Authenticated users can view active affirmations"
  ON affirmations
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- Only admins can modify affirmations (handled via service role, not RLS)
-- No INSERT/UPDATE/DELETE policies for regular users

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affirmations_updated_at
  BEFORE UPDATE ON affirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTION: Create default user settings on profile creation
-- ============================================================================
-- Automatically creates user_settings record when a new profile is created
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

-- ============================================================================
-- STORAGE BUCKET SETUP (for journal entry photos)
-- ============================================================================
-- Note: This is for documentation - actual bucket creation should be done
-- via Supabase Dashboard or CLI
--
-- Bucket name: journal-photos
-- Configuration:
--   - Public: FALSE (photos are private to users)
--   - File size limit: 5MB (reasonable for photos)
--   - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- RLS Policies for storage bucket:
--   1. Users can upload to their own folder: user_id/*
--   2. Users can view their own photos
--   3. Users can delete their own photos
--
-- Folder structure: {user_id}/{entry_id}_{timestamp}.{ext}
-- ============================================================================

-- ============================================================================
-- NOTES FOR OFFLINE-FIRST SYNC LOGIC
-- ============================================================================
--
-- Sync strategy for journal_entries:
--
-- 1. CREATING OFFLINE ENTRY:
--    - Client generates UUID for entry ID
--    - Sets is_synced = FALSE
--    - Sets client_created_at to current device time
--    - Stores in local AsyncStorage
--
-- 2. SYNCING TO SERVER:
--    - Query local entries WHERE is_synced = FALSE
--    - Upsert to Supabase with same UUID
--    - On success, mark is_synced = TRUE locally
--
-- 3. FETCHING FROM SERVER:
--    - Fetch entries WHERE user_id = current_user
--    - Merge with local entries (UUID-based)
--    - Server created_at shows sync time, client_created_at shows actual entry time
--
-- 4. CONFLICT RESOLUTION:
--    - Use updated_at timestamp for last-write-wins
--    - Or implement version numbers if needed
--
-- ============================================================================

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
--   1. Run this migration: supabase db push
--   2. Create storage bucket for journal-photos
--   3. Populate prompts table with journaling prompts
--   4. Populate affirmations table with ED recovery affirmations
--   5. Test RLS policies with different user accounts
-- ============================================================================
