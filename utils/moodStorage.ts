import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { MoodEntry, MoodType, LastMoodCheckIn } from '~/types/mood';
import { MOOD_CONFIGS } from '~/constants/moods';

const MOOD_ENTRIES_KEY = 'mood_entries';
const LAST_MOOD_KEY = 'last_mood_checkin';
const SYNC_QUEUE_KEY = 'mood_sync_queue';

/**
 * Generate a simple UUID for local entries
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Save a mood check-in locally (offline-first)
 */
export async function saveMoodCheckIn(
  userId: string,
  mood: MoodType,
  context?: string
): Promise<MoodEntry> {
  try {
    // Create mood entry
    const entry: MoodEntry = {
      id: generateUUID(),
      userId,
      mood,
      context: context?.trim() || undefined,
      clientCreatedAt: new Date().toISOString(),
      isSynced: false,
    };

    // Save to local storage
    await saveEntryLocally(entry);

    // Add to sync queue
    await addToSyncQueue(entry.id);

    // Update last mood check-in
    await saveLastMoodCheckIn(mood);

    // Attempt background sync (non-blocking)
    syncPendingMoodEntries().catch((error) =>
      console.error('Background sync failed:', error)
    );

    return entry;
  } catch (error) {
    console.error('Failed to save mood check-in:', error);
    throw error;
  }
}

/**
 * Save entry to local AsyncStorage
 */
async function saveEntryLocally(entry: MoodEntry): Promise<void> {
  try {
    // Get existing entries
    const entriesJson = await AsyncStorage.getItem(MOOD_ENTRIES_KEY);
    const entries: MoodEntry[] = entriesJson ? JSON.parse(entriesJson) : [];

    // Add new entry
    entries.push(entry);

    // Save back to storage (keep last 100 entries locally)
    const recentEntries = entries.slice(-100);
    await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(recentEntries));
  } catch (error) {
    console.error('Failed to save entry locally:', error);
    throw error;
  }
}

/**
 * Save last mood check-in timestamp
 */
async function saveLastMoodCheckIn(mood: MoodType): Promise<void> {
  try {
    const lastMood: LastMoodCheckIn = {
      mood,
      emoji: MOOD_CONFIGS[mood].emoji,
      timestamp: new Date().toISOString(),
      hoursAgo: 0,
    };
    await AsyncStorage.setItem(LAST_MOOD_KEY, JSON.stringify(lastMood));
  } catch (error) {
    console.error('Failed to save last mood:', error);
  }
}

/**
 * Get last mood check-in
 */
export async function getLastMoodCheckIn(): Promise<LastMoodCheckIn | null> {
  try {
    const lastMoodJson = await AsyncStorage.getItem(LAST_MOOD_KEY);
    if (!lastMoodJson) return null;

    const lastMood: LastMoodCheckIn = JSON.parse(lastMoodJson);

    // Calculate hours ago
    const timestamp = new Date(lastMood.timestamp);
    const now = new Date();
    const hoursAgo = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));

    return {
      ...lastMood,
      hoursAgo,
    };
  } catch (error) {
    console.error('Failed to get last mood:', error);
    return null;
  }
}

/**
 * Add entry ID to sync queue
 */
async function addToSyncQueue(entryId: string): Promise<void> {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue: string[] = queueJson ? JSON.parse(queueJson) : [];
    queue.push(entryId);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to add to sync queue:', error);
  }
}

/**
 * Sync pending mood entries to Supabase
 */
export async function syncPendingMoodEntries(): Promise<void> {
  try {
    // Get sync queue
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!queueJson) return;

    const queue: string[] = JSON.parse(queueJson);
    if (queue.length === 0) return;

    // Get all local entries
    const entriesJson = await AsyncStorage.getItem(MOOD_ENTRIES_KEY);
    if (!entriesJson) return;

    const entries: MoodEntry[] = JSON.parse(entriesJson);

    // Sync each queued entry
    const successfulIds: string[] = [];
    for (const entryId of queue) {
      const entry = entries.find((e) => e.id === entryId);
      if (!entry) continue;

      const success = await syncSingleEntry(entry);
      if (success) {
        successfulIds.push(entryId);
        // Update local entry as synced
        entry.isSynced = true;
      }
    }

    // Remove successful IDs from queue
    if (successfulIds.length > 0) {
      const newQueue = queue.filter((id) => !successfulIds.includes(id));
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));

      // Update local entries
      await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(entries));
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

/**
 * Sync a single entry to Supabase
 */
async function syncSingleEntry(entry: MoodEntry): Promise<boolean> {
  try {
    const { error } = await supabase.from('journal_entries').insert({
      id: entry.id,
      user_id: entry.userId,
      title: null, // Quick mood check-ins don't have titles
      content: entry.context || 'Quick mood check-in',
      mood: entry.mood,
      photo_url: null, // Quick mood check-ins don't have photos
      is_synced: true,
      client_created_at: entry.clientCreatedAt,
    });

    if (error) {
      console.error('Failed to sync entry:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to sync entry:', error);
    return false;
  }
}

/**
 * Get all local mood entries (for debugging/display)
 */
export async function getLocalMoodEntries(): Promise<MoodEntry[]> {
  try {
    const entriesJson = await AsyncStorage.getItem(MOOD_ENTRIES_KEY);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error('Failed to get local entries:', error);
    return [];
  }
}
