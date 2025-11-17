# Mood Check-In Integration Examples

## Query Examples

### Get all entries (journal + mood) for a user

```typescript
// Fetch from Supabase
const { data, error } = await supabase
  .from('journal_entries')
  .select('*')
  .eq('user_id', userId)
  .order('client_created_at', { ascending: false });

// Results include both:
// - Full journal entries (with title, long content)
// - Quick mood check-ins (no title, short/no content)
```

### Get only mood check-ins

```typescript
const { data, error } = await supabase
  .from('journal_entries')
  .select('*')
  .eq('user_id', userId)
  .is('title', null) // Quick mood check-ins have no title
  .not('mood', 'is', null) // Must have a mood
  .order('client_created_at', { ascending: false });
```

### Get mood trend for last 7 days

```typescript
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const { data, error } = await supabase
  .from('journal_entries')
  .select('mood, client_created_at')
  .eq('user_id', userId)
  .not('mood', 'is', null)
  .gte('client_created_at', sevenDaysAgo.toISOString())
  .order('client_created_at', { ascending: true });

// Process data for trend chart
const moodCounts = data.reduce((acc, entry) => {
  acc[entry.mood] = (acc[entry.mood] || 0) + 1;
  return acc;
}, {});
```

## Component Integration Examples

### Display mood in journal entry card

```typescript
// components/JournalEntryCard.tsx
import { MOOD_CONFIGS } from '~/constants/moods';

function JournalEntryCard({ entry }) {
  const isQuickMood = !entry.title && entry.mood;
  const moodConfig = entry.mood ? MOOD_CONFIGS[entry.mood] : null;

  return (
    <View style={styles.card}>
      {moodConfig && (
        <View style={styles.moodBadge}>
          <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
          <Text style={styles.moodLabel}>{moodConfig.label}</Text>
        </View>
      )}

      {isQuickMood ? (
        <>
          <Text style={styles.quickMoodLabel}>Quick mood check-in</Text>
          {entry.content !== 'Quick mood check-in' && (
            <Text style={styles.context}>{entry.content}</Text>
          )}
        </>
      ) : (
        <>
          <Text style={styles.title}>{entry.title}</Text>
          <Text style={styles.content}>{entry.content}</Text>
        </>
      )}

      <Text style={styles.timestamp}>
        {formatTimestamp(entry.client_created_at)}
      </Text>
    </View>
  );
}
```

### Mood filter for journal list

```typescript
// components/JournalList.tsx
import { MoodType } from '~/types/mood';
import { MOOD_OPTIONS } from '~/constants/moods';

function JournalList() {
  const [moodFilter, setMoodFilter] = useState<MoodType | 'all'>('all');

  return (
    <>
      {/* Mood filter chips */}
      <ScrollView horizontal style={styles.filterBar}>
        <FilterChip
          label="All"
          selected={moodFilter === 'all'}
          onPress={() => setMoodFilter('all')}
        />
        {MOOD_OPTIONS.map((mood) => (
          <FilterChip
            key={mood.id}
            label={`${mood.emoji} ${mood.label}`}
            selected={moodFilter === mood.id}
            onPress={() => setMoodFilter(mood.id)}
          />
        ))}
      </ScrollView>

      {/* Filtered entries */}
      <FlatList
        data={entries.filter((e) =>
          moodFilter === 'all' || e.mood === moodFilter
        )}
        renderItem={({ item }) => <JournalEntryCard entry={item} />}
      />
    </>
  );
}
```

### Mood trends widget for dashboard

```typescript
// components/MoodTrendsWidget.tsx
import { useEffect, useState } from 'react';
import { getLocalMoodEntries } from '~/utils/moodStorage';

function MoodTrendsWidget() {
  const [recentMoods, setRecentMoods] = useState([]);

  useEffect(() => {
    loadRecentMoods();
  }, []);

  async function loadRecentMoods() {
    const entries = await getLocalMoodEntries();
    // Get last 7 entries
    setRecentMoods(entries.slice(-7).reverse());
  }

  return (
    <View style={styles.widget}>
      <Text style={styles.widgetTitle}>Recent Moods</Text>
      <View style={styles.moodTimeline}>
        {recentMoods.map((entry, index) => (
          <View key={entry.id} style={styles.timelineItem}>
            <Text style={styles.timelineEmoji}>
              {MOOD_CONFIGS[entry.mood].emoji}
            </Text>
            <Text style={styles.timelineTime}>
              {formatRelativeTime(entry.clientCreatedAt)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
```

## Context-Based Features

### Identify patterns in mood + context

```typescript
// Analyze when user feels anxious
const anxiousEntries = await supabase
  .from('journal_entries')
  .select('content, client_created_at')
  .eq('user_id', userId)
  .eq('mood', 'anxious')
  .order('client_created_at', { ascending: false })
  .limit(20);

// Extract common contexts
const contexts = anxiousEntries.data
  .map(e => e.content)
  .filter(c => c !== 'Quick mood check-in');

// Show user insights:
// "You often feel anxious before meetings"
// "Anxiety appears more in the mornings"
```

### Suggest coping strategies based on mood

```typescript
function MoodBasedResources({ mood }: { mood: MoodType }) {
  const resources = {
    anxious: {
      title: 'Coping with Anxiety',
      tips: [
        'Try the 5-4-3-2-1 grounding technique',
        'Take 5 deep breaths',
        'Journal about what\'s worrying you',
      ],
    },
    overwhelmed: {
      title: 'When Feeling Overwhelmed',
      tips: [
        'Break tasks into smaller steps',
        'Take a 10-minute break',
        'Reach out to a friend or therapist',
      ],
    },
    sad: {
      title: 'Support for Sadness',
      tips: [
        'Be gentle with yourself',
        'Do one small self-care activity',
        'Connect with someone you trust',
      ],
    },
  };

  const resource = resources[mood];
  if (!resource) return null;

  return (
    <View style={styles.resourceCard}>
      <Text style={styles.resourceTitle}>{resource.title}</Text>
      {resource.tips.map((tip, i) => (
        <Text key={i} style={styles.tip}>• {tip}</Text>
      ))}
    </View>
  );
}
```

## Real-Time Sync Example

### Listen for new mood entries (optional)

```typescript
// Set up Supabase Realtime subscription
import { useEffect } from 'react';

function useMoodUpdates(userId: string) {
  useEffect(() => {
    const subscription = supabase
      .channel('mood-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.mood) {
            console.log('New mood check-in:', payload.new);
            // Update UI, refresh list, etc.
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);
}
```

## Export Data Example

### Export mood history as CSV

```typescript
async function exportMoodHistory(userId: string) {
  const { data } = await supabase
    .from('journal_entries')
    .select('mood, content, client_created_at')
    .eq('user_id', userId)
    .not('mood', 'is', null)
    .order('client_created_at', { ascending: true });

  // Convert to CSV
  const csv = [
    'Date,Time,Mood,Note',
    ...data.map((entry) => {
      const date = new Date(entry.client_created_at);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        entry.mood,
        `"${entry.content || ''}"`,
      ].join(',');
    }),
  ].join('\n');

  // Save or share CSV
  return csv;
}
```

## Testing Integration

### Mock mood data for development

```typescript
// utils/mockMoodData.ts
import { saveMoodCheckIn } from '~/utils/moodStorage';

export async function generateMockMoodData(userId: string) {
  const moods: MoodType[] = ['calm', 'happy', 'anxious', 'sad', 'overwhelmed'];
  const contexts = [
    'Morning routine',
    'After exercise',
    'Before meeting',
    'Lunch time',
    'Evening wind-down',
  ];

  // Generate 20 random mood check-ins over the past week
  for (let i = 0; i < 20; i++) {
    const mood = moods[Math.floor(Math.random() * moods.length)];
    const context = Math.random() > 0.5
      ? contexts[Math.floor(Math.random() * contexts.length)]
      : undefined;

    await saveMoodCheckIn(userId, mood, context);

    // Space out entries
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('Generated 20 mock mood entries');
}
```

## Migration Helper

### If you need to backfill moods for existing entries

```typescript
// One-time script to add moods to old journal entries
async function backfillMoods(userId: string) {
  // Get entries without moods
  const { data } = await supabase
    .from('journal_entries')
    .select('id, content')
    .eq('user_id', userId)
    .is('mood', null);

  // Analyze sentiment and assign moods (example)
  for (const entry of data) {
    const inferredMood = analyzeSentiment(entry.content);

    await supabase
      .from('journal_entries')
      .update({ mood: inferredMood })
      .eq('id', entry.id);
  }
}

function analyzeSentiment(text: string): MoodType {
  // Simple keyword-based sentiment analysis
  const lower = text.toLowerCase();

  if (lower.match(/anxious|worried|nervous|stressed/)) return 'anxious';
  if (lower.match(/sad|down|depressed|lonely/)) return 'sad';
  if (lower.match(/overwhelmed|too much|can't handle/)) return 'overwhelmed';
  if (lower.match(/happy|great|wonderful|excited/)) return 'happy';

  return 'calm'; // Default
}
```

---

These examples show how the Mood Check-In feature integrates seamlessly with the existing journal system while maintaining its standalone simplicity.
