# Profile Creation Flow - Fixed

## Problem Statement

When users signed up for Journal Safe, the following sequence occurred:

1. User submits signup form in `app/(auth)/login.tsx`
2. App calls `supabase.auth.signUp({ email, password })`
3. Supabase creates a row in `auth.users` table
4. **PROBLEM**: No profile is created in `profiles` table
5. **PROBLEM**: The trigger `on_profile_created` never fires
6. **PROBLEM**: No `user_settings` row is created
7. **RESULT**: User has auth credentials but no profile or settings → app breaks

## Root Cause

The initial database schema (`001_initial_schema.sql`) included:
- A `profiles` table that references `auth.users(id)`
- A trigger `on_profile_created` that creates `user_settings` AFTER a profile is inserted
- **BUT NO trigger to create the profile itself when a user signs up**

This meant the profile creation was expected to happen in client code, but it was never implemented.

## Solution: Database Trigger

We implemented a database-level trigger that automatically creates profiles when users sign up.

### Migration: `003_auto_create_profile.sql`

This migration adds:

1. **Function `handle_new_user()`**:
   - Runs when a new user is created in `auth.users`
   - Automatically inserts a row into `profiles` table
   - Sets `display_name` to the username part of the email (before @)
   - Can also use `raw_user_meta_data` if provided during signup

2. **Trigger `on_auth_user_created`**:
   - Fires AFTER INSERT on `auth.users`
   - Calls `handle_new_user()` function
   - Ensures profile is created immediately

### Flow After Fix

1. User submits signup form in `app/(auth)/login.tsx`
2. App calls `supabase.auth.signUp({ email, password })`
3. Supabase creates row in `auth.users` table
4. **NEW**: Trigger `on_auth_user_created` fires → `handle_new_user()` runs
5. **NEW**: Profile created in `profiles` table with default display_name
6. Trigger `on_profile_created` fires → `create_default_user_settings()` runs
7. User settings created in `user_settings` table
8. **RESULT**: User has auth + profile + settings → app works correctly

## Benefits of Database Trigger Approach

1. **Automatic**: No client code changes needed
2. **Universal**: Works for ALL signup methods:
   - Email/password signup
   - OAuth (Google, GitHub, etc.)
   - Magic link authentication
   - Phone authentication
3. **Guaranteed**: Database enforces the logic
4. **No Race Conditions**: Atomic transaction ensures consistency
5. **Centralized**: All signup logic in one place
6. **Idempotent**: Safe to run migration multiple times

## Alternative Approach (NOT Used)

We considered adding manual profile creation in `app/(auth)/login.tsx`:

```typescript
async function signUpWithEmail() {
  setLoading(true);
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    Alert.alert('Sign Up Error', error.message);
    setLoading(false);
    return;
  }

  // Manual profile creation (NOT RECOMMENDED)
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        display_name: email.split('@')[0],
      });

    if (profileError) {
      console.error('Failed to create profile:', profileError);
    }
  }

  setLoading(false);
}
```

**Why we didn't use this approach**:
- Requires client code changes in multiple places
- Only works for email/password signup
- Doesn't handle OAuth or other signup methods
- Potential race conditions
- Easy to forget when adding new signup methods
- Not DRY (Don't Repeat Yourself)

## Testing the Fix

### 1. Apply the Migration

```bash
cd /home/user/ai-assistant
supabase db push
```

### 2. Test New User Signup

```bash
# Sign up a new user via the app
# OR test via Supabase SQL editor:

-- Insert test user (simulates signup)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{}',
  NOW(),
  NOW()
);

-- Check if profile was created automatically
SELECT * FROM profiles WHERE id = (
  SELECT id FROM auth.users WHERE email = 'test@example.com'
);

-- Check if settings were created automatically
SELECT * FROM user_settings WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'test@example.com'
);
```

### 3. Expected Results

After signup, the database should have:

```sql
-- auth.users table
id: 123e4567-e89b-12d3-a456-426614174000
email: john@example.com
...

-- profiles table (auto-created by trigger)
id: 123e4567-e89b-12d3-a456-426614174000  -- Same as auth.users.id
display_name: john  -- Extracted from email
avatar_url: NULL
bio: NULL
created_at: 2025-11-17 18:30:00
updated_at: 2025-11-17 18:30:00

-- user_settings table (auto-created by on_profile_created trigger)
id: 789e4567-e89b-12d3-a456-426614174999
user_id: 123e4567-e89b-12d3-a456-426614174000  -- References auth.users.id
daily_prompt_enabled: TRUE  -- Default
daily_prompt_time: 09:00:00  -- Default
language: en  -- Default
theme: light  -- Default
...
```

## Verification Checklist

- [ ] Migration file created: `supabase/migrations/003_auto_create_profile.sql`
- [ ] Migration applied: `supabase db push`
- [ ] New user signup creates auth.users row
- [ ] Trigger automatically creates profiles row
- [ ] Trigger automatically creates user_settings row
- [ ] Display name is set to email username
- [ ] No errors in signup flow
- [ ] User can access app features after signup

## Related Files

- **Migration**: `/home/user/ai-assistant/supabase/migrations/003_auto_create_profile.sql`
- **Signup UI**: `/home/user/ai-assistant/app/(auth)/login.tsx`
- **Auth Provider**: `/home/user/ai-assistant/providers/AuthProvider.tsx`
- **Initial Schema**: `/home/user/ai-assistant/supabase/migrations/001_initial_schema.sql`
- **Problem Analysis**: `/home/user/ai-assistant/docs/MISSING_CODE_ANALYSIS.md`

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Remove trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove function
DROP FUNCTION IF EXISTS public.handle_new_user();
```

Note: This won't delete profiles that were already created by the trigger.

## Future Improvements

1. **Custom Display Names**: Allow users to set `display_name` during signup:
   ```typescript
   const { data } = await supabase.auth.signUp({
     email,
     password,
     options: {
       data: {
         display_name: 'My Cool Nickname'
       }
     }
   });
   ```
   The trigger already supports this via `raw_user_meta_data->>'display_name'`

2. **Profile Completion**: Add UI to let users update their profile after signup

3. **Avatar Upload**: Implement avatar photo upload during or after signup

4. **Validation**: Add validation to ensure display_name is appropriate (no profanity, length limits, etc.)

## Summary

The profile creation flow is now fully automated at the database level. When a user signs up through ANY method, they automatically get:
1. An auth.users record (authentication)
2. A profiles record (user data)
3. A user_settings record (preferences)

No client code changes were needed, and the fix works universally across all signup methods.
