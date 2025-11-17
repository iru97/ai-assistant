# Settings System Documentation

## Overview

The Journal Safe MVP Settings system provides a comprehensive interface for managing user preferences, privacy settings, data management, and app configuration. The system follows an offline-first architecture with cloud backup synchronization.

## Architecture

### File Structure

```
types/
  settings.ts                    # TypeScript type definitions

utils/
  settingsManager.ts            # Settings CRUD operations
  dataManagement.ts             # Data deletion and storage utilities
  exportData.ts                 # Export journal entries (JSON/PDF)

contexts/
  SettingsContext.tsx           # React Context for global settings state

components/settings/
  SettingsSection.tsx           # Section header component
  SettingRow.tsx                # Base row component
  SettingToggle.tsx             # Toggle switch row
  SettingButton.tsx             # Action button row
  SettingPicker.tsx             # Picker/selector row
  index.ts                      # Component exports

app/(tabs)/
  settings.tsx                  # Main settings screen
```

## Data Flow

### Storage Strategy

Settings are stored in **two places**:

1. **AsyncStorage** (Primary, Offline-first)
   - Immediate reads/writes
   - Always available offline
   - Fast local access

2. **Supabase user_settings table** (Cloud Backup)
   - Synced in background
   - Enables multi-device sync
   - Survives app reinstalls

### Sync Flow

```
1. App Start:
   └─> Load from AsyncStorage (instant)
   └─> Background sync from Supabase (non-blocking)
   └─> If cloud is newer, update local

2. User Updates Setting:
   └─> Save to AsyncStorage (immediate)
   └─> Update React Context (re-render UI)
   └─> Background sync to Supabase (non-blocking)

3. Conflict Resolution:
   └─> Last-write-wins based on updated_at timestamp
```

## Settings Categories

### 1. Profile

- **Display Name**: Optional pseudonym (not required to be real name)
- **Email**: Read-only, from auth.users
- **Avatar**: Optional photo upload (future feature)

### 2. Preferences

- **Language**: English / Español
- **Theme**: Light / Dark / Auto
- **Start Screen**: Journal / Mood / Affirmations

### 3. Journaling (Not in DB yet)

- **Default Mood**: None / Last used
- **Auto-save Interval**: 30s / 1min / 2min
- **Photo Quality**: High / Medium / Low
- **Prompt Category Filter**: All / Specific categories

### 4. Affirmations

- **Daily Affirmations**: Toggle (default: ON)
- **Notification Time**: Time picker (default: 08:00)
- **Theme Filter**: All / Specific themes (not in DB yet)

### 5. Notifications

- **Daily Prompts**: Toggle (default: ON)
- **Prompt Time**: Time picker (default: 09:00)
- **Mood Reminders**: Toggle (future feature)
- **Sync Notifications**: Toggle (show when synced)

### 6. Privacy & Security

- **Require Auth on App Open**: Toggle (default: OFF)
- **Sync Data to Cloud**: Toggle (default: ON)
- **Privacy Policy**: External link
- **Terms of Service**: External link

### 7. Data Management

- **Export Journal Entries**: JSON or Text/PDF format
- **Storage Usage**: Display entry count, photo count, size
- **Clear Local Data**: Delete device data, keep cloud
- **Delete All Data**: Permanently delete all data (requires confirmation)

### 8. Support & Help

- **Crisis Resources**: Link to Help tab
- **Send Feedback**: Email link
- **Rate the App**: App store link
- **Version**: Display app version

### 9. Account

- **Logged in as**: Display email
- **Sign Out**: Sign out (keep local data)
- **Delete Account**: Permanently delete account and all data

## Components

### SettingsSection

Renders a section with header and children.

```tsx
<SettingsSection title="Preferences">
  {/* Settings rows */}
</SettingsSection>
```

### SettingToggle

Toggle switch for boolean settings.

```tsx
<SettingToggle
  label="Dark Mode"
  value={darkMode}
  onChange={setDarkMode}
  icon="moon"
  iconBackgroundColor="#007AFF"
  isFirst
/>
```

### SettingPicker

Opens action sheet (iOS) or alert (Android) to select from options.

```tsx
<SettingPicker
  label="Language"
  value={language}
  options={[
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' }
  ]}
  onChange={setLanguage}
  icon="globe"
  iconBackgroundColor="#fe9400"
/>
```

### SettingButton

Action button that triggers a function.

```tsx
<SettingButton
  label="Export Data"
  onPress={handleExport}
  icon="download"
  iconBackgroundColor="#10A37F"
  value="JSON / PDF"
/>
```

## API Reference

### SettingsManager

#### `getSettings(): Promise<UserSettings>`

Gets all settings (from AsyncStorage, syncs from Supabase in background).

```typescript
const settings = await getSettings();
console.log(settings.language); // 'en' | 'es'
```

#### `updateSetting(key, value): Promise<void>`

Updates a single setting.

```typescript
await updateSetting('language', 'es');
```

#### `updateSettings(updates): Promise<void>`

Updates multiple settings at once.

```typescript
await updateSettings({
  language: 'es',
  theme: 'dark',
  dailyAffirmationEnabled: false
});
```

#### `resetSettings(): Promise<void>`

Resets all settings to defaults.

```typescript
await resetSettings();
```

### DataManagement

#### `getStorageUsage(): Promise<StorageUsage>`

Calculates storage usage statistics.

```typescript
const usage = await getStorageUsage();
console.log(usage.entryCount); // 42
console.log(usage.formattedSize); // "2.4 MB"
```

#### `clearLocalData(): Promise<void>`

Deletes all local data (AsyncStorage + SecureStore). Cloud data remains.

```typescript
await clearLocalData();
```

#### `deleteAllData(): Promise<void>`

Deletes ALL data (local + cloud). Irreversible.

```typescript
await deleteAllData();
```

#### `deleteAccount(): Promise<void>`

Deletes account, all data, and signs out. Irreversible.

```typescript
await deleteAccount();
```

### ExportData

#### `exportEntries(format): Promise<void>`

Exports journal entries and opens share sheet.

```typescript
await exportEntries('json'); // Export as JSON
await exportEntries('pdf');  // Export as text/PDF
```

## Context Usage

### SettingsProvider

Wrap your app with SettingsProvider to enable settings context.

```tsx
import { SettingsProvider } from '~/contexts/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      {/* Your app */}
    </SettingsProvider>
  );
}
```

### useSettings Hook

Access settings from any component.

```tsx
import { useSettings } from '~/contexts/SettingsContext';

function MyComponent() {
  const { settings, updateSetting, isLoading } = useSettings();

  return (
    <Switch
      value={settings.dailyAffirmationEnabled}
      onValueChange={(value) => updateSetting('dailyAffirmationEnabled', value)}
    />
  );
}
```

## Confirmation Dialogs

### Destructive Actions

All destructive actions require confirmation dialogs:

1. **Sign Out**: Single confirmation
2. **Clear Local Data**: Single confirmation with explanation
3. **Delete All Data**: Double confirmation (alert + typed "DELETE")
4. **Delete Account**: Double confirmation (alert + typed "DELETE")

### iOS vs Android

- **iOS**: Uses `Alert.prompt()` for text input confirmation
- **Android**: Uses fallback double-alert (no text input)

## Database Schema

### user_settings Table

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),

  -- Notifications
  daily_prompt_enabled BOOLEAN DEFAULT TRUE,
  daily_prompt_time TIME DEFAULT '09:00:00',
  daily_affirmation_enabled BOOLEAN DEFAULT TRUE,
  daily_affirmation_time TIME DEFAULT '08:00:00',

  -- Preferences
  language language_type DEFAULT 'en',
  theme TEXT DEFAULT 'light',

  -- Privacy
  require_auth_on_app_open BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);
```

### Missing Fields

These fields are planned but not yet in database:

- `start_screen`
- `default_mood`
- `auto_save_interval`
- `photo_quality`
- `prompt_category_filter`
- `affirmation_theme_filter`
- `mood_reminders_enabled`
- `sync_notifications_enabled`
- `sync_data_to_cloud`

**TODO**: Add migration to add these fields.

## Security Considerations

### Data Deletion

1. **Clear Local Data**: Safe, cloud data remains
2. **Delete All Data**: Dangerous, irreversible
3. **Delete Account**: Very dangerous, irreversible

### Confirmation Requirements

- **Type "DELETE" confirmation**: iOS only (uses Alert.prompt)
- **Double confirmation**: Both iOS and Android
- **Clear warnings**: "This action CANNOT be undone"

### Privacy Features

- **Require Auth on App Open**: Extra security layer
- **Sync Data to Cloud**: User can disable cloud sync
- **Local-first**: App works fully offline

## Testing

### Test Scenarios

1. **Settings Persistence**
   - Change setting
   - Close app
   - Reopen app
   - Verify setting persisted

2. **Cloud Sync**
   - Change setting on Device A
   - Wait for sync
   - Open app on Device B
   - Verify setting synced

3. **Offline Mode**
   - Turn off internet
   - Change settings
   - Verify changes saved locally
   - Turn on internet
   - Verify changes sync to cloud

4. **Data Deletion**
   - Create entries
   - Clear local data
   - Verify cloud data remains
   - Re-sync from cloud

5. **Export**
   - Create entries
   - Export as JSON
   - Verify file content
   - Export as PDF
   - Verify file content

## Future Enhancements

### Planned Features

1. **Profile Photo Upload**: Avatar upload to Supabase Storage
2. **Time Picker**: Native time picker for notification times
3. **Category Filters**: Filter prompts and affirmations by category
4. **Auto-save Settings**: Configurable auto-save interval
5. **Photo Quality**: Configurable photo compression
6. **Mood Reminders**: Scheduled mood check-in notifications
7. **Multi-language Support**: Full i18n integration
8. **Theme Switching**: Actual light/dark mode implementation
9. **PDF Export**: Proper PDF generation (vs text file)
10. **Data Import**: Import from JSON backup

### Database Migrations Needed

```sql
-- Add missing columns to user_settings
ALTER TABLE user_settings
  ADD COLUMN start_screen TEXT DEFAULT 'journal',
  ADD COLUMN default_mood TEXT DEFAULT 'none',
  ADD COLUMN auto_save_interval INTEGER DEFAULT 60,
  ADD COLUMN photo_quality TEXT DEFAULT 'medium',
  ADD COLUMN prompt_category_filter TEXT[] DEFAULT '{}',
  ADD COLUMN affirmation_theme_filter TEXT[] DEFAULT '{}',
  ADD COLUMN mood_reminders_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN sync_notifications_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN sync_data_to_cloud BOOLEAN DEFAULT TRUE;
```

## Troubleshooting

### Common Issues

**Q: Settings not persisting**
- Check AsyncStorage permissions
- Verify SettingsProvider wraps app
- Check console for errors

**Q: Settings not syncing to cloud**
- Check internet connection
- Verify Supabase credentials
- Check RLS policies on user_settings table

**Q: Export not working**
- Check file system permissions
- Verify expo-file-system installed
- Verify expo-sharing installed

**Q: Delete confirmations not showing**
- Check Platform.OS detection
- Verify Alert.prompt (iOS only)
- Check console for errors

## Dependencies

```json
{
  "@react-native-async-storage/async-storage": "2.0.0",
  "expo-file-system": "~18.0.4",
  "expo-secure-store": "^14.0.0",
  "expo-sharing": "~13.0.0",
  "@supabase/supabase-js": "^2.81.1"
}
```

## Support

For questions or issues:
- Email: support@journalsafe.com
- GitHub: [Your Repo URL]
- Docs: [Your Docs URL]

---

**Version**: 1.0.0
**Last Updated**: 2025-11-17
**Author**: Journal Safe Team
