# Affirmations System Documentation

## Overview

The Journal Safe affirmations system provides users with daily, evidence-based affirmations to support eating disorder recovery. The system is HIPAA-compliant, using local notifications that don't expose Protected Health Information (PHI).

## Features

### Core Functionality
- **Daily Affirmations**: One affirmation per day, deterministically seeded by date
- **Local Notifications**: HIPAA-compliant generic notifications scheduled on-device
- **Multilingual Support**: English and Spanish (EN/ES)
- **Theme-Based Filtering**: 5 recovery-focused themes with 50 total affirmations
- **History View**: Last 7 days of affirmations
- **Shuffle Feature**: Get a new random affirmation anytime

### HIPAA Compliance

**CRITICAL**: Notifications must NOT contain affirmation text (potential PHI)

✅ **CORRECT** (Generic notification):
```typescript
{
  title: "Journal Safe",
  body: "Your daily affirmation is ready"
}
```

❌ **WRONG** (Contains PHI):
```typescript
{
  title: "Daily Affirmation",
  body: "Your worth is not determined by your appearance" // PHI!
}
```

**Why this matters**: Affirmation content could reveal mental health condition (eating disorder), which is PHI under HIPAA.

## Architecture

### File Structure

```
/types/affirmations.ts          # TypeScript type definitions
/utils/affirmations.ts          # Core affirmation logic
/utils/affirmationSettings.ts   # Settings management (AsyncStorage)
/utils/notifications.ts         # Notification scheduling (expo-notifications)
/app/(tabs)/affirmations.tsx    # UI component
/content/affirmations.json      # 50 affirmations data
```

### Data Flow

1. **Daily Affirmation Selection**:
   ```
   Date → Seed → Deterministic Index → Same affirmation all day
   ```

2. **Notification Flow**:
   ```
   User enables → Request permissions → Schedule local notification
   → At trigger time → Generic notification
   → User taps → App opens → Show actual affirmation
   ```

3. **Settings Storage**:
   ```
   User changes settings → AsyncStorage → Update preferences
   → Reschedule notification (if enabled)
   ```

## Affirmation Themes

The system includes 5 themes based on eating disorder recovery principles:

1. **unconditional_self_worth** (15 affirmations)
   - Focus: Intrinsic value independent of appearance
   - Example: "Your worth is not determined by your appearance"

2. **recovery_is_non_linear** (10 affirmations)
   - Focus: Normalizing setbacks, progress over perfection
   - Example: "Recovery is not linear, and that's completely okay"

3. **body_acceptance** (10 affirmations)
   - Focus: Respect and honor for the body
   - Example: "Your body deserves kindness, not criticism"

4. **nourishment_and_self_care** (10 affirmations)
   - Focus: Self-care as necessary, not selfish
   - Example: "You deserve nourishment and care, unconditionally"

5. **strength_and_resilience** (5 affirmations)
   - Focus: Recognizing inner strength in recovery
   - Example: "Every day you choose recovery is a victory"

## API Reference

### Affirmation Functions (`utils/affirmations.ts`)

#### `getDailyAffirmation(language?, theme?)`
Get the daily affirmation (deterministic, same all day).

```typescript
import { getDailyAffirmation } from '~/utils/affirmations';

const affirmation = getDailyAffirmation('en', 'unconditional_self_worth');
// Returns: Affirmation object
```

#### `getRandomAffirmation(language?, theme?, excludeId?)`
Get a random affirmation (excluding current one).

```typescript
const random = getRandomAffirmation('es', undefined, currentId);
```

#### `getAffirmationText(affirmation, language)`
Extract text in the specified language.

```typescript
const text = getAffirmationText(affirmation, 'en');
// Returns: "Your worth is not determined by your appearance..."
```

#### `getAffirmationById(id, language?)`
Get specific affirmation by ID.

```typescript
const affirmation = getAffirmationById(1, 'en');
```

#### `getAffirmationsByTheme(theme, language?)`
Get all affirmations for a theme.

```typescript
const selfWorthAffirmations = getAffirmationsByTheme('unconditional_self_worth');
```

#### `getAffirmationsHistory(days, language?, theme?)`
Get affirmations for the last N days.

```typescript
const history = getAffirmationsHistory(7, 'en');
// Returns: Array<{ date: Date, affirmation: Affirmation }>
```

#### `getThemeDisplayName(theme, language)`
Get human-readable theme name.

```typescript
const name = getThemeDisplayName('body_acceptance', 'es');
// Returns: "Aceptación Corporal"
```

### Settings Functions (`utils/affirmationSettings.ts`)

#### `getAffirmationPreferences()`
Load preferences from AsyncStorage.

```typescript
const prefs = await getAffirmationPreferences();
// Returns: { enabled, notificationTime, language, themeFilter? }
```

#### `updateAffirmationPreferences(updates)`
Update specific preferences.

```typescript
await updateAffirmationPreferences({
  enabled: true,
  notificationTime: '09:00'
});
```

#### `setAffirmationsEnabled(enabled)`
Enable/disable daily affirmations.

```typescript
await setAffirmationsEnabled(true);
```

#### `setNotificationTime(time)`
Set notification time (24-hour format).

```typescript
await setNotificationTime('09:00'); // 9 AM
```

#### `setLanguage(language)`
Set language preference.

```typescript
await setLanguage('es'); // Spanish
```

#### `setThemeFilter(theme?)`
Set theme filter (undefined = all themes).

```typescript
await setThemeFilter('recovery_is_non_linear');
await setThemeFilter(undefined); // Show all themes
```

### Notification Functions (`utils/notifications.ts`)

#### `requestNotificationPermissions()`
Request notification permissions from user.

```typescript
const { granted } = await requestNotificationPermissions();
if (granted) {
  // Proceed with scheduling
}
```

#### `scheduleDailyAffirmation(time)`
Schedule repeating daily notification.

```typescript
const notificationId = await scheduleDailyAffirmation('09:00');
```

#### `cancelDailyAffirmation()`
Cancel the daily notification.

```typescript
await cancelDailyAffirmation();
```

#### `rescheduleDailyAffirmation(time)`
Cancel and reschedule for new time.

```typescript
await rescheduleDailyAffirmation('14:00'); // 2 PM
```

#### `isDailyAffirmationScheduled()`
Check if notification is currently scheduled.

```typescript
const isScheduled = await isDailyAffirmationScheduled();
```

#### `sendTestNotification()` (DEV ONLY)
Send test notification immediately.

```typescript
await sendTestNotification(); // Triggers in 2 seconds
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
# Or if dependencies not auto-installed:
npx expo install expo-notifications @react-native-community/datetimepicker
```

### 2. Configure Notifications (Native Apps)

#### iOS (`app.json` or `app.config.js`)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

#### Android (`app.json`)

```json
{
  "expo": {
    "android": {
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "SCHEDULE_EXACT_ALARM"
      ]
    }
  }
}
```

### 3. Handle Notification Taps (Optional)

To navigate to affirmations screen when user taps notification, add to root layout:

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { setupNotificationHandler } from '~/utils/notifications';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const subscription = setupNotificationHandler((notification) => {
      // Navigate to affirmations screen
      router.push('/affirmations');
    });

    return () => subscription.remove();
  }, []);

  return <Slot />;
}
```

## Usage Examples

### Basic Usage

```typescript
import { getDailyAffirmation, getAffirmationText } from '~/utils/affirmations';

// Get today's affirmation
const affirmation = getDailyAffirmation('en');
const text = getAffirmationText(affirmation, 'en');

console.log(text);
// "Your worth is not determined by your appearance, your size, or what you eat."
```

### Enable Notifications

```typescript
import { requestNotificationPermissions, scheduleDailyAffirmation } from '~/utils/notifications';
import { setAffirmationsEnabled, setNotificationTime } from '~/utils/affirmationSettings';

async function enableDailyAffirmations() {
  // Request permissions
  const { granted } = await requestNotificationPermissions();

  if (!granted) {
    alert('Please enable notifications in settings');
    return;
  }

  // Save preferences
  await setAffirmationsEnabled(true);
  await setNotificationTime('09:00');

  // Schedule notification
  await scheduleDailyAffirmation('09:00');

  console.log('Daily affirmations enabled at 9:00 AM');
}
```

### Filter by Theme

```typescript
import { getDailyAffirmation } from '~/utils/affirmations';
import { setThemeFilter } from '~/utils/affirmationSettings';

// Show only recovery-focused affirmations
await setThemeFilter('recovery_is_non_linear');

// Get daily affirmation from that theme
const affirmation = getDailyAffirmation('en', 'recovery_is_non_linear');
```

### Display History

```typescript
import { getAffirmationsHistory, getAffirmationText } from '~/utils/affirmations';

const history = getAffirmationsHistory(7, 'en');

history.forEach(({ date, affirmation }) => {
  const text = getAffirmationText(affirmation, 'en');
  console.log(`${date.toLocaleDateString()}: ${text}`);
});
```

## Testing

### Manual Testing Checklist

- [ ] Enable notifications → Receive notification at scheduled time
- [ ] Tap notification → App opens to affirmations screen
- [ ] Change notification time → New notification scheduled
- [ ] Disable notifications → No notifications received
- [ ] Change language → Affirmations display in new language
- [ ] Filter by theme → Only affirmations from that theme shown
- [ ] Shuffle affirmation → Get different affirmation
- [ ] View history → Last 7 days displayed correctly
- [ ] Same affirmation all day → Daily affirmation doesn't change
- [ ] Next day → New daily affirmation

### Test Notification (Development)

```typescript
import { sendTestNotification } from '~/utils/notifications';

// Send test notification in 2 seconds
await sendTestNotification();
```

### Verify Scheduled Notifications

```typescript
import { getScheduledNotifications } from '~/utils/notifications';

const scheduled = await getScheduledNotifications();
console.log('Scheduled notifications:', scheduled);
```

## Troubleshooting

### Issue: Notifications not appearing

**Solution**:
1. Check permissions: Settings → Journal Safe → Notifications (iOS/Android)
2. Verify notification is scheduled: Use `getScheduledNotifications()`
3. Check notification time isn't in the past
4. On Android: Check "Do Not Disturb" mode

### Issue: Notification appears but doesn't open app

**Solution**:
1. Ensure notification handler is set up in root layout
2. Check notification data contains `type: 'daily-affirmation'`
3. Verify deep linking is configured

### Issue: Same affirmation every day

**Solution**:
This is expected if using theme filter with few affirmations. The seed algorithm may repeat with small datasets. Consider:
- Removing theme filter
- Using wider date range in seed calculation (modify `getDateSeed`)

### Issue: Different affirmation throughout the day

**Solution**:
- Verify using `getDailyAffirmation()` not `getRandomAffirmation()`
- Check date/timezone consistency
- Clear and reload preferences

## Best Practices

1. **Always Request Permissions First**
   ```typescript
   const { granted } = await requestNotificationPermissions();
   if (!granted) return; // Don't schedule
   ```

2. **Reschedule After Time Change**
   ```typescript
   await rescheduleDailyAffirmation(newTime); // Cancels old, schedules new
   ```

3. **Handle Settings Changes**
   ```typescript
   // When user disables
   await cancelDailyAffirmation();
   await setAffirmationsEnabled(false);
   ```

4. **Graceful Fallbacks**
   ```typescript
   const prefs = await getAffirmationPreferences(); // Never throws, returns defaults
   ```

5. **Test Before Release**
   - Use `sendTestNotification()` in dev builds
   - Test on both iOS and Android
   - Verify time zones work correctly

## Performance Considerations

- **AsyncStorage**: All settings operations are async
- **Local Notifications**: No server calls, works offline
- **Deterministic Selection**: O(1) lookup, very fast
- **History Calculation**: O(n) where n = days (max 7, negligible)

## Future Enhancements

Potential features for future versions:

1. **Favorite Affirmations**: Save favorites for quick access
2. **Custom Affirmations**: User-created affirmations
3. **Sharing**: Share affirmations to social media
4. **Widgets**: Home screen widgets with daily affirmation
5. **Notification Variations**: Multiple notification times
6. **Streaks**: Track consecutive days viewing affirmations
7. **Reminders**: Additional gentle reminders throughout day
8. **Audio Affirmations**: Voice-recorded affirmations
9. **Background Images**: Customizable affirmation card backgrounds
10. **Analytics**: Track which themes are most helpful

## Support

For questions or issues:
- Review this documentation
- Check `/utils/affirmations.ts` inline comments
- Test with `sendTestNotification()` in dev mode
- Review expo-notifications documentation

## License & Attribution

Affirmation content curated for eating disorder recovery based on evidence-based therapeutic principles including:
- Unconditional self-worth
- Non-linear recovery models
- Body neutrality/acceptance
- Self-compassion practices
- Resilience building

All affirmations reviewed for trauma-informed, HAES-aligned language.
