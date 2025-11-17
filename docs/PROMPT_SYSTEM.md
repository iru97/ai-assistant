# Daily Prompt System Documentation

## Overview

The daily prompt system provides users with inspiring journaling prompts that change daily. Users can shuffle to get different prompts if they don't like the daily one, and all preferences are persisted across sessions.

## Features

- **Daily Prompts**: Deterministic daily prompts based on date (same prompt all day)
- **100 Prompts**: 5 categories with bilingual support (EN/ES)
- **Shuffle Functionality**: Get different prompts without waiting for the next day
- **Category Filtering**: Filter prompts by category preference
- **Language Support**: Full English and Spanish support
- **Persistence**: User preferences and current prompt saved locally
- **Auto-reset**: Automatically resets to daily prompt at midnight

## Architecture

### Files Created

```
/types/prompts.ts          - TypeScript interfaces
/utils/prompts.ts          - Prompt utility functions
/hooks/usePrompt.ts        - React hook for prompt management
/components/PromptCard.tsx - UI component for displaying prompts
/utils/__tests__/prompts.test.ts - Test suite
```

### Prompt Categories

1. **Gratitude** (20 prompts) - Focus on appreciation and thankfulness
2. **Self-Compassion** (25 prompts) - Self-care and kindness
3. **Emotional Reflection** (20 prompts) - Understanding emotions
4. **Progress & Growth** (15 prompts) - Personal development
5. **Coping & Resilience** (20 prompts) - Stress management and strength

## Usage

### Basic Usage in a Screen

```typescript
import { PromptCard } from '~/components/PromptCard';

export default function JournalEntryScreen() {
  const handleUsePrompt = (promptText: string) => {
    // Insert prompt text into journal entry
    console.log('Using prompt:', promptText);
  };

  return (
    <View>
      <PromptCard
        onUsePrompt={handleUsePrompt}
        showUseButton={true}
      />
      {/* Rest of your screen */}
    </View>
  );
}
```

### Using the Hook Directly

```typescript
import { usePrompt } from '~/hooks/usePrompt';

export default function MyScreen() {
  const {
    currentPrompt,
    promptText,
    shufflePrompt,
    resetToDaily,
    isDaily,
    loading,
    language,
    setLanguage,
  } = usePrompt();

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>{promptText}</Text>
      <Button onPress={shufflePrompt} title="Shuffle" />
      {!isDaily && (
        <Button onPress={resetToDaily} title="Reset to Daily" />
      )}
    </View>
  );
}
```

### Setting User Preferences

```typescript
import { usePrompt } from '~/hooks/usePrompt';

export default function SettingsScreen() {
  const {
    language,
    categoryFilter,
    promptsEnabled,
    setLanguage,
    setCategoryFilter,
    setPromptsEnabled,
  } = usePrompt();

  return (
    <View>
      {/* Language toggle */}
      <Button
        onPress={() => setLanguage(language === 'en' ? 'es' : 'en')}
        title={`Language: ${language.toUpperCase()}`}
      />

      {/* Category filter */}
      <Button
        onPress={() => setCategoryFilter('gratitude')}
        title="Filter: Gratitude Only"
      />
      <Button
        onPress={() => setCategoryFilter(undefined)}
        title="Clear Filter"
      />

      {/* Enable/disable prompts */}
      <Switch
        value={promptsEnabled}
        onValueChange={setPromptsEnabled}
      />
    </View>
  );
}
```

### Using Utility Functions

```typescript
import {
  getDailyPrompt,
  getRandomPrompt,
  getPromptById,
  getPromptsByCategory,
  getCategories,
  getCategoryDisplayName,
} from '~/utils/prompts';

// Get today's daily prompt
const dailyPrompt = getDailyPrompt('en');

// Get a random prompt (excluding a specific one)
const randomPrompt = getRandomPrompt('en', undefined, dailyPrompt.id);

// Get specific prompt by ID
const prompt = getPromptById(42, 'es');

// Get all gratitude prompts
const gratitudePrompts = getPromptsByCategory('gratitude', 'en');

// Get all categories
const categories = getCategories();

// Get category display name
const categoryName = getCategoryDisplayName('self-compassion', 'es');
// Returns: "Autocompasión"
```

## API Reference

### `usePrompt()` Hook

Returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `dailyPrompt` | `Prompt \| null` | Today's daily prompt |
| `currentPrompt` | `Prompt \| null` | Currently displayed prompt |
| `promptText` | `string` | Current prompt text in user's language |
| `shufflePrompt` | `() => void` | Get a different random prompt |
| `resetToDaily` | `() => void` | Reset to today's daily prompt |
| `isDaily` | `boolean` | Whether current prompt is the daily one |
| `loading` | `boolean` | Whether prompts are still loading |
| `language` | `Language` | Current language preference |
| `categoryFilter` | `PromptCategory?` | Current category filter |
| `promptsEnabled` | `boolean` | Whether prompts are enabled |
| `setLanguage` | `(lang: Language) => Promise<void>` | Update language |
| `setCategoryFilter` | `(cat?: PromptCategory) => Promise<void>` | Update category filter |
| `setPromptsEnabled` | `(enabled: boolean) => Promise<void>` | Enable/disable prompts |

### `PromptCard` Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUsePrompt` | `(text: string) => void` | - | Callback when "Use this prompt" is pressed |
| `showUseButton` | `boolean` | `false` | Show the "Use this prompt" button |
| `language` | `Language` | Hook's language | Override language (optional) |
| `compact` | `boolean` | `false` | Use compact styling |

## Daily Prompt Algorithm

The daily prompt algorithm ensures consistency:

1. Get the current date
2. Calculate day of year (1-365)
3. Create seed: `year * 1000 + dayOfYear`
4. Use seeded random to select prompt index
5. Return prompt at that index

This ensures:
- Same prompt all day (deterministic)
- Different prompt each day
- Repeats after 100 days (we have 100 prompts)
- Works offline (no API calls)

## Storage Keys

User preferences are stored in AsyncStorage:

- `@prompt_language` - User's language preference
- `@prompt_category_filter` - Selected category filter
- `@prompts_enabled` - Whether prompts are enabled
- `@current_prompt_id` - ID of current prompt (if shuffled)
- `@current_prompt_date` - Date when current prompt was set

## Testing

Run the test suite:

```bash
npm test utils/__tests__/prompts.test.ts
```

Tests cover:
- Daily prompt generation
- Random prompt generation
- Prompt filtering by category
- Language support
- Utility functions

## Integration Points

### Journal Entry Screen

Add prompt at the top of the journal entry screen:

```typescript
<PromptCard
  onUsePrompt={(text) => setJournalEntry(text)}
  showUseButton={true}
/>
```

### Home Screen

Show daily inspiration:

```typescript
<PromptCard compact={true} />
```

### Settings Screen

Add preferences:

```typescript
const { language, setLanguage, setCategoryFilter, setPromptsEnabled } = usePrompt();

// Language selector
// Category filter dropdown
// Enable/disable toggle
```

## Best Practices

1. **Always use the hook** - Don't call utility functions directly in components
2. **Handle loading state** - Show loading indicator while prompts load
3. **Respect user preferences** - Don't show prompts if disabled
4. **Persist state** - Hook automatically saves user choices
5. **Test thoroughly** - Run test suite after changes

## Future Enhancements

Potential improvements:

- Custom prompts (user-created)
- Favorite prompts
- Prompt history
- Share prompts with friends
- More languages
- Themed prompts (holidays, seasons)
- Analytics on most-used categories
- Smart recommendations based on mood

## Troubleshooting

### Prompts not loading

Check:
1. `content/prompts.json` exists and is valid
2. AsyncStorage permissions are granted
3. No console errors in utility functions

### Same prompt every time

Check:
1. Date seed is calculating correctly
2. Prompt hasn't been shuffled and saved
3. Clear AsyncStorage: `await AsyncStorage.clear()`

### Category filter not working

Check:
1. Category name matches exactly (case-sensitive)
2. Category has prompts available
3. Storage key is being set correctly

## Support

For issues or questions:
1. Check the test suite for examples
2. Review the implementation in `/utils/prompts.ts`
3. Check AsyncStorage for stored preferences
