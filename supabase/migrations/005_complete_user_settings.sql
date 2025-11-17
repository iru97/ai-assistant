-- ============================================================================
-- Journal Safe MVP - Complete User Settings Schema
-- Migration: 005_complete_user_settings.sql
-- ============================================================================
-- Adds missing columns to user_settings table to match UserSettings TypeScript interface
-- This ensures all 16 settings fields sync properly between AsyncStorage and Supabase
--
-- Missing fields being added:
--   1. start_screen - Default screen on app open
--   2. default_mood - Default mood selection behavior
--   3. auto_save_interval - Interval for auto-saving journal entries
--   4. photo_quality - Photo compression quality setting
--   5. prompt_category_filter - Filter for journal prompt categories
--   6. affirmation_theme_filter - Filter for affirmation themes
--   7. mood_reminders_enabled - Enable mood tracking reminders
--   8. sync_notifications_enabled - Enable sync status notifications
--   9. sync_data_to_cloud - Master switch for cloud synchronization
-- ============================================================================

-- Add new columns to user_settings table
ALTER TABLE user_settings
  -- Preferences
  ADD COLUMN IF NOT EXISTS start_screen TEXT DEFAULT 'journal'
    CHECK (start_screen IN ('journal', 'mood', 'affirmations')),

  -- Journaling settings
  ADD COLUMN IF NOT EXISTS default_mood TEXT DEFAULT 'none'
    CHECK (default_mood IN ('none', 'last_used')),
  ADD COLUMN IF NOT EXISTS auto_save_interval INTEGER DEFAULT 60
    CHECK (auto_save_interval IN (30, 60, 120)),
  ADD COLUMN IF NOT EXISTS photo_quality TEXT DEFAULT 'medium'
    CHECK (photo_quality IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS prompt_category_filter JSONB DEFAULT '[]'::jsonb,

  -- Affirmations settings
  ADD COLUMN IF NOT EXISTS affirmation_theme_filter JSONB DEFAULT '[]'::jsonb,

  -- Notification settings
  ADD COLUMN IF NOT EXISTS mood_reminders_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sync_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- Privacy & Sync settings
  ADD COLUMN IF NOT EXISTS sync_data_to_cloud BOOLEAN NOT NULL DEFAULT TRUE;

-- Add helpful comments
COMMENT ON COLUMN user_settings.start_screen IS 'Default screen to show when app opens: journal, mood, or affirmations';
COMMENT ON COLUMN user_settings.default_mood IS 'Default mood selection behavior: none or last_used';
COMMENT ON COLUMN user_settings.auto_save_interval IS 'Auto-save interval in seconds: 30, 60, or 120';
COMMENT ON COLUMN user_settings.photo_quality IS 'Photo compression quality: high, medium, or low';
COMMENT ON COLUMN user_settings.prompt_category_filter IS 'Array of prompt categories to filter (empty array = show all)';
COMMENT ON COLUMN user_settings.affirmation_theme_filter IS 'Array of affirmation themes to filter (empty array = show all)';
COMMENT ON COLUMN user_settings.mood_reminders_enabled IS 'Enable notifications to remind users to track their mood';
COMMENT ON COLUMN user_settings.sync_notifications_enabled IS 'Show notifications when data syncs to/from cloud';
COMMENT ON COLUMN user_settings.sync_data_to_cloud IS 'Master switch for cloud synchronization (when disabled, app is fully offline)';

-- ============================================================================
-- FIELD MAPPING: TypeScript ↔ Database
-- ============================================================================
--
-- TypeScript (camelCase)           →  Database (snake_case)
-- -------------------------------------------------------------------------
-- language                         →  language
-- theme                            →  theme
-- startScreen                      →  start_screen
-- defaultMood                      →  default_mood
-- autoSaveInterval                 →  auto_save_interval
-- photoQuality                     →  photo_quality
-- promptCategoryFilter             →  prompt_category_filter (JSONB array)
-- dailyAffirmationEnabled          →  daily_affirmation_enabled
-- dailyAffirmationTime             →  daily_affirmation_time
-- affirmationThemeFilter           →  affirmation_theme_filter (JSONB array)
-- dailyPromptEnabled               →  daily_prompt_enabled
-- dailyPromptTime                  →  daily_prompt_time
-- moodRemindersEnabled             →  mood_reminders_enabled
-- syncNotificationsEnabled         →  sync_notifications_enabled
-- requireAuthOnAppOpen             →  require_auth_on_app_open
-- syncDataToCloud                  →  sync_data_to_cloud
--
-- NOTE: displayName, email, avatarUrl are stored in profiles table, not user_settings
-- ============================================================================

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
--   1. Run migration: supabase db push
--   2. Update utils/settingsManager.ts to sync all fields
--   3. Test settings sync with multiple devices
--   4. Verify filter arrays serialize/deserialize correctly
-- ============================================================================
