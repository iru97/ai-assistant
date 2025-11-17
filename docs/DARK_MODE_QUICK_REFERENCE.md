# Dark Mode Quick Reference

## TL;DR
Dark mode is **50% complete**. Foundation is done. Convert remaining screens using this guide.

## Usage in 3 Steps

### 1. Import useTheme (if needed)
```tsx
import { useTheme } from '~/themes/ThemeProvider';
```

### 2. Replace StyleSheet with className
```tsx
// BEFORE
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  title: { color: '#000', fontSize: 24 },
});

// AFTER
<View className="bg-white dark:bg-dark-card">
  <Text className="text-gray-900 dark:text-dark-text text-2xl">
    Hello
  </Text>
</View>
```

### 3. Handle Dynamic Colors
```tsx
const { isDark } = useTheme();
<Icon color={isDark ? '#f9fafb' : '#1f2937'} />
```

## Common Classes Cheat Sheet

### Backgrounds
| Light | Dark | Usage |
|-------|------|-------|
| `bg-white` | `dark:bg-dark-card` | Cards, modals |
| `bg-gray-50` | `dark:bg-dark-background-secondary` | Subtle backgrounds |
| `bg-gray-100` | `dark:bg-dark-background` | Screen backgrounds |
| `bg-primary` | `dark:bg-primary-light` | Purple buttons |

### Text
| Light | Dark | Usage |
|-------|------|-------|
| `text-gray-900` | `dark:text-dark-text` | Primary text |
| `text-gray-600` | `dark:text-dark-text-secondary` | Secondary text |
| `text-gray-500` | `dark:text-gray-400` | Muted text |

### Borders
| Class |
|-------|
| `border-gray-200 dark:border-dark-border` |

## Color Hex Values
```javascript
// Light Mode
background: '#faf5ff' // Light purple
card: '#ffffff'
text: '#1f2937'
border: '#e5e7eb'
primary: '#7c3aed'

// Dark Mode
background: '#111827'
card: '#374151'
text: '#f9fafb'
border: '#4b5563'
primary: '#a78bfa' // Lighter for contrast
```

## Complete Example
```tsx
import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '~/themes/ThemeProvider';

export default function ExampleScreen() {
  const { isDark } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-dark-background">
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
          Title
        </Text>
        <Text className="text-gray-600 dark:text-dark-text-secondary mb-4">
          Subtitle
        </Text>

        <View className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border">
          <View className="flex-row items-center mb-4">
            <Feather
              name="heart"
              size={24}
              color={isDark ? '#a78bfa' : '#7c3aed'}
            />
            <Text className="text-lg font-semibold text-gray-900 dark:text-dark-text ml-3">
              Card Title
            </Text>
          </View>

          <TouchableOpacity className="bg-primary dark:bg-primary-light py-3 px-6 rounded-xl">
            <Text className="text-white text-center font-semibold">
              Button
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
```

## Convert in 5 Minutes

1. **Remove StyleSheet import and styles object**
2. **Add className to all Views, Texts, etc.**
3. **Use cheat sheet above for common patterns**
4. **For icons, use useTheme() and isDark**
5. **Test in both modes**

## Testing Theme
1. Open app Settings
2. Tap "Theme" row
3. Select Light/Dark/Auto
4. Theme changes immediately

## Files Modified
✅ Core system (5 files)
✅ Settings components (4 files)
✅ Settings screen (1 file)
❌ Main screens (6 files) - **TO DO**
❌ Other components (3 files) - **TO DO**

## Where to Start
1. `app/(tabs)/journal/new.tsx` - Most visible
2. `app/(tabs)/mood.tsx` - Most colorful
3. `app/(tabs)/affirmations.tsx` - Good example
4. `app/(tabs)/help.tsx` - Important for accessibility
5. `components/PromptCard.tsx` - Reusable

## Questions?
See full docs: `docs/DARK_MODE.md`

---

**Status**: Foundation Complete ✅
**Your task**: Convert remaining screens
**Time per screen**: ~15-30 minutes
**Total remaining**: ~2-3 hours
