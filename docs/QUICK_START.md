# Daily Prompt System - Quick Start Guide

## Installation Complete

The daily prompt system has been successfully implemented! Here's what was created:

### Files Created

```
✅ /types/prompts.ts                  - TypeScript type definitions
✅ /utils/prompts.ts                  - Core utility functions
✅ /hooks/usePrompt.ts                - React hook for state management
✅ /hooks/index.ts                    - Barrel export for hooks
✅ /components/PromptCard.tsx         - UI component
✅ /utils/__tests__/prompts.test.ts   - Test suite
✅ /docs/PROMPT_SYSTEM.md             - Full documentation
✅ /docs/EXAMPLE_USAGE.tsx            - Integration examples
✅ /docs/QUICK_START.md               - This file
```

### Configuration Updated

```
✅ tsconfig.json - Added resolveJsonModule and esModuleInterop
```

## Quick Integration (3 Steps)

### Step 1: Add to Journal Entry Screen

Create or update your journal entry screen:

```typescript
// app/(tabs)/journal.tsx or wherever your journal entry is

import { PromptCard } from '~/components/PromptCard';
import { useState } from 'react';

export default function JournalScreen() {
  const [entry, setEntry] = useState('');

  const handleUsePrompt = (promptText: string) => {
    setEntry(entry + promptText + '\n\n');
  };

  return (
    <View>
      <PromptCard
        onUsePrompt={handleUsePrompt}
        showUseButton={true}
      />

      <TextInput
        value={entry}
        onChangeText={setEntry}
        multiline
        placeholder="Start writing..."
      />
    </View>
  );
}
```

### Step 2: Add to Home Screen (Optional)

```typescript
// app/(tabs)/index.tsx

import { PromptCard } from '~/components/PromptCard';

export default function HomeScreen() {
  return (
    <View>
      <Text>Welcome back!</Text>
      <PromptCard compact={true} />
      {/* Rest of your content */}
    </View>
  );
}
```

### Step 3: Add Settings (Optional)

```typescript
// app/(tabs)/settings.tsx

import { usePrompt } from '~/hooks/usePrompt';

export default function SettingsScreen() {
  const {
    language,
    setLanguage,
    promptsEnabled,
    setPromptsEnabled
  } = usePrompt();

  return (
    <View>
      <Switch
        value={promptsEnabled}
        onValueChange={setPromptsEnabled}
      />

      <Button
        onPress={() => setLanguage(language === 'en' ? 'es' : 'en')}
        title={`Language: ${language.toUpperCase()}`}
      />
    </View>
  );
}
```

## How It Works

### Daily Algorithm

1. **Deterministic**: Same prompt all day (resets at midnight)
2. **Seeded Random**: Uses date as seed for consistent results
3. **100 Prompts**: Cycles through all 100 prompts
4. **Offline-First**: No API calls, works completely offline

### User Actions

- **View Daily Prompt**: Shown automatically when screen loads
- **Shuffle**: Get a different random prompt
- **Reset**: Go back to today's daily prompt
- **Use Prompt**: Insert into journal entry
- **Filter by Category**: Show only specific category prompts
- **Change Language**: Switch between English and Spanish

### Data Persistence

All preferences saved to AsyncStorage:
- Language preference
- Category filter
- Prompts enabled/disabled
- Current shuffled prompt (if any)
- Last update date

## Testing

### Manual Testing

1. **View the daily prompt**:
   ```typescript
   import { getDailyPrompt } from '~/utils/prompts';
   const prompt = getDailyPrompt('en');
   console.log(prompt);
   ```

2. **Test shuffle**:
   - Click shuffle button multiple times
   - Should get different prompts each time
   - Should not repeat the current prompt

3. **Test reset**:
   - Shuffle to a new prompt
   - Click reset button
   - Should return to daily prompt
   - Sun icon should appear

4. **Test language**:
   - Change language in settings
   - Prompt text should update to Spanish
   - Category names should update

5. **Test persistence**:
   - Shuffle to a new prompt
   - Close and reopen app
   - Should show the shuffled prompt (not daily)
   - Next day, should reset to daily

### Unit Testing

Once Jest is configured, run:

```bash
npm test utils/__tests__/prompts.test.ts
```

## Features

### ✅ Implemented

- [x] Daily prompt algorithm (deterministic, date-based)
- [x] 100 prompts across 5 categories
- [x] Bilingual support (EN/ES)
- [x] Shuffle functionality
- [x] Reset to daily
- [x] Category filtering
- [x] Language switching
- [x] Enable/disable prompts
- [x] Persistence (AsyncStorage)
- [x] Auto-reset at midnight
- [x] Loading states
- [x] Error handling
- [x] TypeScript types
- [x] Test suite
- [x] Documentation
- [x] Example implementations

### 🎯 Future Enhancements

- [ ] Custom user prompts
- [ ] Favorite prompts
- [ ] Prompt history
- [ ] Share prompts
- [ ] More languages
- [ ] Themed prompts
- [ ] Analytics
- [ ] Smart recommendations

## Prompt Categories

1. **Gratitude** (20 prompts)
   - Focus on appreciation and thankfulness
   - Examples: "What's one small thing that brought you comfort today?"

2. **Self-Compassion** (25 prompts)
   - Self-care and kindness to oneself
   - Examples: "What permission do you need to give yourself right now?"

3. **Emotional Reflection** (20 prompts)
   - Understanding and processing emotions
   - Examples: "What emotion is most present for you today?"

4. **Progress & Growth** (15 prompts)
   - Personal development and learning
   - Examples: "What's something you understand about yourself now that you didn't before?"

5. **Coping & Resilience** (20 prompts)
   - Stress management and building strength
   - Examples: "What helps you feel grounded when things feel chaotic?"

## Common Issues

### Issue: Prompts not showing

**Solution**: Check that `promptsEnabled` is true:
```typescript
const { promptsEnabled, setPromptsEnabled } = usePrompt();
if (!promptsEnabled) setPromptsEnabled(true);
```

### Issue: Same prompt every time

**Solution**: Clear AsyncStorage:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

### Issue: Category filter not working

**Solution**: Check category name spelling (case-sensitive):
```typescript
// ✅ Correct
setCategoryFilter('self-compassion');

// ❌ Wrong
setCategoryFilter('Self-Compassion');
setCategoryFilter('self_compassion');
```

### Issue: TypeScript errors

**Solution**: Make sure tsconfig.json has been updated with:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

## Support

- 📖 Full docs: `/docs/PROMPT_SYSTEM.md`
- 💡 Examples: `/docs/EXAMPLE_USAGE.tsx`
- 🧪 Tests: `/utils/__tests__/prompts.test.ts`
- 🔧 Utils: `/utils/prompts.ts`
- 🎣 Hook: `/hooks/usePrompt.ts`
- 🎨 Component: `/components/PromptCard.tsx`

## Next Steps

1. **Integrate into your screens** (see examples above)
2. **Test the functionality** (shuffle, reset, language change)
3. **Customize the styling** (update PromptCard.tsx styles)
4. **Add to settings** (language, category, enable/disable)
5. **Configure Jest** (to run the test suite)

Enjoy your new daily prompt system! 🎉
