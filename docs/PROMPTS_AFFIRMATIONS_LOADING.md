# Prompts & Affirmations Loading Migration

## Overview

This document describes the migration from static JSON file loading to Supabase database loading for prompts and affirmations, with intelligent fallback and caching mechanisms.

## Changes Made

### 1. `/home/user/ai-assistant/utils/prompts.ts`

**Before:**
- Loaded prompts synchronously from `../content/prompts.json`
- All functions were synchronous
- No database integration

**After:**
- Loads prompts from Supabase `prompts` table (async)
- Falls back to JSON file if Supabase fails
- Implements in-memory caching to avoid repeated DB calls
- All data-fetching functions are now async (return `Promise<T>`)

**Key Functions:**
- `loadPrompts()`: Internal function that loads from Supabase with JSON fallback
- `refreshPrompts()`: Exported function to clear cache and reload from Supabase
- `getDailyPrompt()`: Now async, uses cached data
- `getRandomPrompt()`: Now async, uses cached data
- `getPromptById()`: Now async, uses cached data
- `getPromptsByCategory()`: Now async, uses cached data
- `getTotalPromptsCount()`: Now async, uses cached data
- `getCategoryPromptsCount()`: Now async, uses cached data

### 2. `/home/user/ai-assistant/utils/affirmations.ts`

**Before:**
- Loaded affirmations synchronously from `../content/affirmations.json`
- All functions were synchronous
- No database integration

**After:**
- Loads affirmations from Supabase `affirmations` table (async)
- Falls back to JSON file if Supabase fails
- Implements in-memory caching to avoid repeated DB calls
- All data-fetching functions are now async (return `Promise<T>`)

**Key Functions:**
- `loadAffirmations()`: Internal function that loads from Supabase with JSON fallback
- `refreshAffirmations()`: Exported function to clear cache and reload from Supabase
- `getDailyAffirmation()`: Now async, uses cached data
- `getRandomAffirmation()`: Now async, uses cached data
- `getAffirmationById()`: Now async, uses cached data
- `getAffirmationsByTheme()`: Now async, uses cached data
- `getTotalAffirmationsCount()`: Now async, uses cached data
- `getThemeAffirmationsCount()`: Now async, uses cached data
- `getAffirmationsHistory()`: Now async, uses cached data

### 3. `/home/user/ai-assistant/hooks/usePrompt.ts`

**Updated to handle async functions:**
- `loadDailyPrompt()`: Now async
- All calls to `getDailyPrompt()` and `getRandomPrompt()` are awaited
- Proper error handling for async operations
- Loading state already existed, now properly covers async data loading

## Schema Mapping

### Current Database Schema Issue

According to `MISSING_CODE_ANALYSIS.md`, there's a schema mismatch:

**Database Schema (Current):**
- `prompts` table has: `text` column (single column, assumes English)
- `affirmations` table has: `text` column (single column, assumes English)

**TypeScript Interface (Expected):**
```typescript
interface Prompt {
  id: number;
  category: PromptCategory;
  text_en: string;
  text_es: string;
}

interface Affirmation {
  id: number;
  theme: AffirmationTheme;
  text_en: string;
  text_es: string;
}
```

### Current Workaround

The fetch functions map the database `text` column to both `text_en` and `text_es`:

```typescript
return data.map((row) => ({
  id: row.id,
  category: row.category as PromptCategory,
  text_en: row.text || row.text_en || '',
  text_es: row.text || row.text_es || '',
}));
```

This allows the code to work with the current database schema while maintaining compatibility with the expected TypeScript interface.

### Future Fix Required

The database schema should be updated to include separate columns:
- Rename `text` to `text_en`
- Add `text_es` column for Spanish translations

Once the schema is updated, the mapping code will automatically use the correct columns.

## Caching Strategy

### In-Memory Cache

Both utilities implement an in-memory cache:

```typescript
let promptsCache: Prompt[] | null = null;
let isLoading = false;
let loadPromise: Promise<Prompt[]> | null = null;
```

**Benefits:**
- Avoids repeated database calls per session
- Reduces network latency
- Improves app performance
- Prevents race conditions with concurrent requests

**Cache Lifecycle:**
- Cache is populated on first data load
- Cache persists for the entire app session
- Cache can be manually refreshed via `refreshPrompts()` / `refreshAffirmations()`
- Cache is cleared when app restarts

### Loading Flow

```
┌─────────────────┐
│  Component      │
│  calls function │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check cache     │◄──────┐
└────────┬────────┘       │
         │                │
    Cache exists?         │
         │                │
    ┌────┴────┐          │
    │         │          │
   YES       NO          │
    │         │          │
    │    ┌───▼────────┐  │
    │    │ Try Supabase│  │
    │    └───┬────────┘  │
    │        │           │
    │   Success?         │
    │        │           │
    │    ┌───┴────┐     │
    │    │        │     │
    │   YES      NO     │
    │    │        │     │
    │    │   ┌────▼─────┐
    │    │   │ Try JSON │
    │    │   └────┬─────┘
    │    │        │
    │    ▼        ▼
    │ ┌─────────────┐
    │ │ Set cache   │
    │ └──────┬──────┘
    │        │
    └────────┼────────────┐
             ▼            │
      ┌──────────────┐    │
      │ Return data  │────┘
      └──────────────┘
```

## Fallback Strategy

### 1. Supabase First
- Always try to load from Supabase database first
- Provides fresh data
- Enables admin updates without app release

### 2. JSON Fallback
- If Supabase fails, fall back to local JSON files
- Ensures app works offline
- Provides resilience against database issues

### 3. Error Handling
```typescript
try {
  // Try Supabase
  const prompts = await fetchPromptsFromSupabase();
  promptsCache = prompts;
  return prompts;
} catch (error) {
  console.warn('Failed to load prompts from Supabase, using JSON fallback:', error);

  // Fallback to JSON
  try {
    const promptsData = await import('../content/prompts.json');
    promptsCache = promptsData.prompts;
    return promptsCache;
  } catch (jsonError) {
    console.error('Failed to load prompts from JSON:', jsonError);
    throw new Error('Failed to load prompts from both Supabase and JSON');
  }
}
```

## Breaking Changes

### API Changes

All data-fetching functions are now **async**:

**Before:**
```typescript
const prompt = getDailyPrompt('en', 'gratitude');
const affirmation = getDailyAffirmation('es', 'body_acceptance');
```

**After:**
```typescript
const prompt = await getDailyPrompt('en', 'gratitude');
const affirmation = await getDailyAffirmation('es', 'body_acceptance');
```

### Component Impact

Any component using these functions must:

1. Use async/await or Promises
2. Handle loading states
3. Handle errors gracefully

**Example:**
```typescript
// Before
const MyComponent = () => {
  const prompt = getDailyPrompt('en');
  return <Text>{prompt.text_en}</Text>;
};

// After
const MyComponent = () => {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const p = await getDailyPrompt('en');
        setPrompt(p);
      } catch (error) {
        console.error('Failed to load prompt:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrompt();
  }, []);

  if (loading) return <Text>Loading...</Text>;
  if (!prompt) return <Text>Error loading prompt</Text>;

  return <Text>{prompt.text_en}</Text>;
};
```

## Manual Refresh

Both utilities export refresh functions for manual cache clearing:

```typescript
import { refreshPrompts } from '../utils/prompts';
import { refreshAffirmations } from '../utils/affirmations';

// Refresh prompts from Supabase
const updatedPrompts = await refreshPrompts();

// Refresh affirmations from Supabase
const updatedAffirmations = await refreshAffirmations();
```

**Use cases:**
- After admin updates prompts/affirmations in database
- Manual refresh button in settings
- Pull-to-refresh gestures
- Periodic background refresh

## Migration Checklist

- [x] Update `utils/prompts.ts` with Supabase loading
- [x] Update `utils/affirmations.ts` with Supabase loading
- [x] Update `hooks/usePrompt.ts` to handle async functions
- [x] Update `app/(tabs)/affirmations.tsx` to handle async functions
- [ ] Update `utils/__tests__/prompts.test.ts` to handle async functions
- [ ] Update `utils/__tests__/affirmations.test.ts` to handle async functions (if exists)
- [ ] Update all other components using prompt functions (if any)
- [ ] Test offline fallback behavior
- [ ] Test caching behavior
- [ ] Test refresh functions
- [ ] Update database schema to support `text_en` and `text_es`
- [ ] Add Spanish translations to database
- [ ] Update mapping code once schema is fixed

## Test Files That Need Updating

### `/home/user/ai-assistant/utils/__tests__/prompts.test.ts`

All test functions need to be updated to handle async:

**Before:**
```typescript
it('should return a valid prompt', () => {
  const prompt = getDailyPrompt('en');
  expect(prompt).toBeDefined();
});
```

**After:**
```typescript
it('should return a valid prompt', async () => {
  const prompt = await getDailyPrompt('en');
  expect(prompt).toBeDefined();
});
```

### Affirmations Tests

If there's an affirmations test file, it will need the same updates.

## Testing

### Test Cases

1. **Normal Flow:**
   - App loads with Supabase connection
   - Data is fetched from database
   - Cache is populated
   - Subsequent calls use cache

2. **Offline Mode:**
   - App loads without Supabase connection
   - Falls back to JSON files
   - Cache is populated with JSON data
   - App continues to function

3. **Database Errors:**
   - Supabase returns error
   - Falls back to JSON
   - Error is logged but app continues

4. **Cache Refresh:**
   - Call `refreshPrompts()` or `refreshAffirmations()`
   - Cache is cleared
   - Fresh data is fetched from Supabase
   - Cache is repopulated

5. **Concurrent Requests:**
   - Multiple components request data simultaneously
   - Only one database call is made
   - All requests receive the same Promise
   - No race conditions

## Performance Considerations

### Initial Load
- First load fetches from Supabase (network request)
- Loading state shown to user
- Data cached in memory

### Subsequent Loads
- Uses cached data (instant)
- No network requests
- No loading states needed

### Memory Usage
- Prompts: ~50 items × ~100 bytes = ~5 KB
- Affirmations: ~50 items × ~100 bytes = ~5 KB
- Total: ~10 KB (negligible for modern devices)

## Future Improvements

1. **Persistent Cache:**
   - Store in AsyncStorage for offline persistence
   - Implement cache expiration (e.g., 24 hours)
   - Background refresh when cache is stale

2. **Real-time Updates:**
   - Subscribe to Supabase real-time changes
   - Auto-refresh when data changes in database
   - Push notifications for new content

3. **Optimistic Loading:**
   - Load from cache immediately
   - Fetch from Supabase in background
   - Update cache when fresh data arrives

4. **Analytics:**
   - Track cache hit rate
   - Monitor fallback usage
   - Measure load times

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify Supabase connection in `utils/supabase.ts`
3. Ensure JSON files exist in `content/` directory
4. Test with and without network connection

## Related Files

- `/home/user/ai-assistant/utils/prompts.ts` - Prompts utility
- `/home/user/ai-assistant/utils/affirmations.ts` - Affirmations utility
- `/home/user/ai-assistant/hooks/usePrompt.ts` - Prompts React hook
- `/home/user/ai-assistant/utils/supabase.ts` - Supabase client
- `/home/user/ai-assistant/types/prompts.ts` - Prompts types
- `/home/user/ai-assistant/types/affirmations.ts` - Affirmations types
- `/home/user/ai-assistant/content/prompts.json` - Fallback prompts
- `/home/user/ai-assistant/content/affirmations.json` - Fallback affirmations
