# Journal Safe - Onboarding Flow

## Overview

The onboarding flow introduces first-time users to Journal Safe, collects essential preferences, and sets appropriate expectations about the app's purpose as a wellness tool (not medical treatment).

## User Experience

### Flow (5 Screens)

1. **Welcome Screen**
   - App introduction with purple heart emoji
   - "Welcome to Journal Safe" heading
   - Subtitle: "A safe space for your thoughts and feelings"
   - Get Started button
   - Skip option available

2. **Features Screen**
   - "What is Journal Safe?" heading
   - Three key features:
     - 📝 Private Journaling - Your thoughts stay private
     - 😌 Mood Tracking - Check in with yourself daily
     - 💜 Recovery Support - ED-safe prompts and affirmations
   - **Important disclaimer**: "Journal Safe is a wellness tool, not medical treatment"
   - Next button
   - Skip option available

3. **Personalize Screen**
   - "Personalize Your Experience" heading
   - Language selection: English / Español
   - Daily affirmations toggle
   - Time picker for affirmations (if enabled): 9:00 AM / 12:00 PM / 8:00 PM
   - Next button
   - Skip option available

4. **Permissions Screen**
   - "Stay Connected" heading
   - Explains notification benefits:
     - Daily affirmations at chosen time
     - Gentle check-in reminders
     - Important wellness tips
   - "Allow Notifications" button (primary action)
   - "Skip for now" link (secondary action)
   - Note: "You can change this anytime in Settings"

5. **Ready Screen**
   - "You're All Set!" heading
   - Success message with sparkles emoji
   - Quick tip: Access crisis resources from Help tab
   - Reminder: "You're not alone on this journey 💜"
   - "Start Journaling" button → Navigate to main app

## Design System

### Colors
- Primary: `#7c3aed` (purple-600)
- Light purple background: `bg-purple-50`
- White background: `bg-white`
- Text: Gray-900 (headings), Gray-600 (body)

### Typography
- Headings: 3xl, bold
- Subtitles: lg, regular
- Body: base, regular
- Icons/Emojis: 80px (illustrations), 48px (feature icons)

### Layout
- Horizontal padding: 24px (px-6)
- Vertical spacing: 32px (mt-8)
- Button height: 56px (py-4)
- Border radius: Full for buttons (rounded-full)

### Accessibility
- High contrast text
- Large touch targets (min 44x44)
- Skip option on every screen
- Clear visual hierarchy

## Technical Implementation

### File Structure

```
app/
  onboarding/
    index.tsx         # Main onboarding carousel (5 screens)

components/
  OnboardingScreen.tsx  # Reusable screen template
  FeatureCard.tsx       # Feature display component

utils/
  onboardingManager.ts  # Onboarding state management
  initialSetup.ts       # User preferences management
```

### State Management

**AsyncStorage Keys:**
```typescript
@journal_safe/onboarding_complete    // boolean (string)
@journal_safe/language               // "en" | "es"
@journal_safe/affirmations_enabled   // boolean (JSON)
@journal_safe/affirmation_time       // "HH:MM" (24-hour)
@journal_safe/notifications_enabled  // boolean (JSON)
```

### Navigation Flow

```
app/_layout.tsx
  ↓
Check auth session
  ↓
If authenticated:
  ↓
  Check hasCompletedOnboarding()
    ↓
    No  → /onboarding
    Yes → /(tabs)/assistant
  ↓
If not authenticated:
  → /(auth)/login
```

## API Reference

### onboardingManager.ts

```typescript
// Check if user completed onboarding
hasCompletedOnboarding(): Promise<boolean>

// Mark onboarding as complete
setOnboardingComplete(): Promise<void>

// Reset onboarding (testing only)
resetOnboarding(): Promise<void>
```

### initialSetup.ts

```typescript
// Types
type Language = 'en' | 'es';

interface UserPreferences {
  language: Language;
  affirmationsEnabled: boolean;
  affirmationTime?: string;
  notificationsEnabled: boolean;
}

// Language preferences
saveLanguagePreference(language: Language): Promise<void>
getLanguagePreference(): Promise<Language>

// Affirmation settings
saveAffirmationSettings(enabled: boolean, time?: string): Promise<void>
getAffirmationSettings(): Promise<{ enabled: boolean; time?: string }>

// Notifications
requestNotificationPermissions(): Promise<boolean>
areNotificationsEnabled(): Promise<boolean>

// Bulk operations
saveUserPreferences(preferences: UserPreferences): Promise<void>
getUserPreferences(): Promise<UserPreferences>
```

## Components

### OnboardingScreen

Reusable template for onboarding screens with consistent layout.

```typescript
interface OnboardingScreenProps {
  title: string;                    // Main heading
  subtitle?: string;                // Optional subtitle
  illustration?: string;            // Emoji or icon (80px)
  children?: React.ReactNode;       // Custom content
  onNext: () => void;               // Next button handler
  onSkip?: () => void;              // Skip button handler
  showSkip?: boolean;               // Show/hide skip button
  nextButtonText?: string;          // Button label (default: "Next")
  backgroundColor?: string;         // Tailwind class (default: "bg-white")
}
```

**Usage:**
```tsx
<OnboardingScreen
  title="Welcome to Journal Safe"
  subtitle="A safe space for your thoughts and feelings"
  illustration="💜"
  onNext={goToNext}
  onSkip={skipToEnd}
  showSkip
  nextButtonText="Get Started"
  backgroundColor="bg-purple-50"
/>
```

### FeatureCard

Displays a feature with icon, title, and description.

```typescript
interface FeatureCardProps {
  icon: string;        // Emoji or icon
  title: string;       // Feature name
  description: string; // Feature description
}
```

**Usage:**
```tsx
<FeatureCard
  icon="📝"
  title="Private Journaling"
  description="Your thoughts stay private and secure."
/>
```

## Customization Guide

### Adding a New Screen

1. Update the `screens` array in `/app/onboarding/index.tsx`:
```typescript
const screens: Screen[] = ['welcome', 'features', 'personalize', 'new-screen', 'permissions', 'ready'];
```

2. Add the screen case in `renderScreen()`:
```typescript
case 'new-screen':
  return (
    <View style={{ width }}>
      <OnboardingScreen
        title="Your Title"
        subtitle="Your subtitle"
        illustration="🎉"
        onNext={goToNext}
        onSkip={skipToEnd}
        showSkip
      >
        {/* Custom content here */}
      </OnboardingScreen>
    </View>
  );
```

### Changing Colors

Update the purple theme in `/app/onboarding/index.tsx`:
- `bg-purple-50` → Light background
- `bg-purple-600` → Primary buttons
- `text-purple-600` → Primary text
- `border-purple-600` → Primary borders

### Adding More Language Options

1. Update the `Language` type in `/utils/initialSetup.ts`:
```typescript
export type Language = 'en' | 'es' | 'fr' | 'de';
```

2. Add the language button in the Personalize screen:
```tsx
<TouchableOpacity
  onPress={() => setLanguage('fr')}
  className={/* styling */}>
  <Text>Français</Text>
</TouchableOpacity>
```

### Modifying Affirmation Times

Update the time picker in the Personalize screen:
```tsx
<TouchableOpacity onPress={() => setAffirmationTime('06:00')}>
  <Text>6:00 AM</Text>
</TouchableOpacity>
```

## Testing

### Reset Onboarding (For Testing)

```typescript
import { resetOnboarding } from '~/utils/onboardingManager';

// Call this to reset and see onboarding again
await resetOnboarding();
```

### Check Current Status

```typescript
import { hasCompletedOnboarding } from '~/utils/onboardingManager';
import { getUserPreferences } from '~/utils/initialSetup';

// Check if onboarding is complete
const isComplete = await hasCompletedOnboarding();
console.log('Onboarding complete:', isComplete);

// Check saved preferences
const prefs = await getUserPreferences();
console.log('User preferences:', prefs);
```

## Dependencies

### Required
- `@react-native-async-storage/async-storage` - For persistent storage
- `expo-router` - For navigation
- `react-native-safe-area-context` - For safe area handling
- `nativewind` - For Tailwind styling

### Optional (for full functionality)
- `expo-notifications` - For notification permissions and scheduling
  ```bash
  npx expo install expo-notifications
  ```

## Important Notes

### Notification Permissions

The current implementation includes notification permission logic in `/utils/initialSetup.ts`, but **expo-notifications** is not currently installed in the project.

**To enable notifications:**
1. Install the package:
   ```bash
   npx expo install expo-notifications
   ```

2. Configure notification handling in your app

**Without expo-notifications:**
- The app will still work
- Notification permission request will fail silently
- Users can still complete onboarding
- All other features function normally

### Privacy & Safety

The onboarding explicitly states that Journal Safe is:
- ✅ A wellness tool
- ✅ For personal journaling and mood tracking
- ❌ NOT medical treatment
- ❌ NOT a substitute for professional help

Always maintain this messaging to set proper expectations.

### Crisis Resources

The final screen mentions crisis resources in the Help tab. Ensure this feature is implemented and accessible from the main app.

## Future Enhancements

Potential improvements for future iterations:

1. **Advanced Time Picker**
   - Full time picker component (not just 3 preset times)
   - Multiple affirmation times per day

2. **More Languages**
   - French, German, Portuguese, etc.
   - Automatic language detection based on device locale

3. **Personalization**
   - Theme selection (light/dark)
   - Color accent preferences
   - Font size options

4. **Progress Animation**
   - Animated progress bar instead of dots
   - Smooth transitions between screens

5. **Illustrations**
   - Custom illustrations instead of emojis
   - SVG graphics for better quality

6. **Video/Animation**
   - Brief intro video
   - Lottie animations for visual appeal

7. **Onboarding Analytics**
   - Track which screens users skip
   - A/B test different messaging
   - Measure completion rates

## Support

For questions or issues with the onboarding flow:
1. Check AsyncStorage for saved preferences
2. Verify navigation routing in `app/_layout.tsx`
3. Test with `resetOnboarding()` to restart the flow
4. Review console logs for errors

## License

This onboarding flow is part of the Journal Safe app and follows the same license as the parent project.
