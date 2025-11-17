-- ============================================================================
-- Auto-create Profile on User Signup
-- ============================================================================
-- This migration fixes the profile creation flow by automatically creating
-- a profile row when a user signs up via Supabase Auth.
--
-- PROBLEM:
--   - When users sign up via supabase.auth.signUp(), a row is created in auth.users
--   - But NO row is created in profiles table
--   - The trigger on_profile_created expects a profile to exist to create user_settings
--   - Result: Users have no profile or settings, app breaks
--
-- SOLUTION:
--   - Create a trigger on auth.users table
--   - When a new user is inserted, automatically create their profile
--   - This ensures profile exists before user_settings trigger fires
--   - Works for ALL signup methods (not just client-side signups)
-- ============================================================================

-- ============================================================================
-- FUNCTION: Auto-create profile when auth user is created
-- ============================================================================
-- This function runs automatically when a new user signs up
-- It creates a profile with:
--   - Same UUID as auth.users (one-to-one relationship)
--   - Display name extracted from email (username before @)
--   - Default values for other fields (avatar_url, bio = NULL)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new profile for the user
  INSERT INTO public.profiles (id, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    -- Try to get display_name from user metadata, fallback to email username
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION public.handle_new_user() IS
  'Automatically creates a profile when a new user signs up via Supabase Auth';

-- ============================================================================
-- TRIGGER: Fire on auth.users INSERT
-- ============================================================================
-- This trigger fires AFTER a new user is created in auth.users
-- It calls handle_new_user() to create the profile
-- Note: We use DROP TRIGGER IF EXISTS to make this migration idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comment
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
  'Automatically creates profile and settings when user signs up';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- How it works:
--   1. User signs up via supabase.auth.signUp()
--   2. Row inserted into auth.users
--   3. Trigger on_auth_user_created fires → calls handle_new_user()
--   4. Profile created in profiles table
--   5. Trigger on_profile_created fires → calls create_default_user_settings()
--   6. User settings created in user_settings table
--   7. User now has: auth.users row + profiles row + user_settings row ✓
--
-- Benefits:
--   - Automatic (no client code changes needed)
--   - Works for all signup methods (email, OAuth, magic link, etc.)
--   - Guaranteed to run (database-level enforcement)
--   - No race conditions
--   - Idempotent (safe to run multiple times)
--
-- Testing:
--   1. Run migration: supabase db push
--   2. Sign up new user via app
--   3. Check profiles table for new row
--   4. Check user_settings table for new row
--   5. Verify display_name is set to email username
-- ============================================================================
