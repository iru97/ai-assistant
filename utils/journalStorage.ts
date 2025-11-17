/**
 * Journal Safe MVP - Offline Storage Utilities
 * Handles local storage, sync queue, and Supabase sync operations
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import {
  LocalJournalEntry,
  SyncStatus,
  SyncQueueItem,
  SupabaseJournalEntry,
  MoodType,
} from '~/types/journal';
import { supabase } from '~/utils/supabase';

const CHUNK_SIZE = 1900; // Leave margin for iOS 2KB limit

/**
 * Saves a journal entry locally (ALWAYS succeeds, even offline)
 */
export async function saveJournalEntryLocally(
  userId: string,
  content: string,
  title?: string,
  mood?: MoodType,
  photoUri?: string
): Promise<LocalJournalEntry> {
  try {
    const now = new Date().toISOString();

    // Generate local entry
    const entry: LocalJournalEntry = {
      id: uuidv4(),
      userId,
      title,
      content,
      mood,
      photoUri,
      clientCreatedAt: now,
      updatedAt: now,
      syncStatus: SyncStatus.LOCAL_ONLY,
      syncAttempts: 0,
      isLocalOnly: true,
    };

    // Save to encrypted storage
    await saveEntryToSecureStore(entry);

    // Add to sync queue
    await addToSyncQueue(entry.id, 'create');

    // Trigger background sync (non-blocking)
    syncPendingEntries().catch(console.error);

    return entry;
  } catch (error) {
    console.error('Failed to save entry locally:', error);
    throw error;
  }
}

/**
 * Saves entry to secure store (handles chunking for large entries)
 */
async function saveEntryToSecureStore(entry: LocalJournalEntry): Promise<void> {
  const entryJson = JSON.stringify(entry);

  // If entry is small, save directly
  if (entryJson.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(`journal_entry_${entry.id}`, entryJson);
    return;
  }

  // If entry is large, split into chunks
  const chunks = [];
  for (let i = 0; i < entryJson.length; i += CHUNK_SIZE) {
    chunks.push(entryJson.slice(i, i + CHUNK_SIZE));
  }

  // Save each chunk
  for (let i = 0; i < chunks.length; i++) {
    await SecureStore.setItemAsync(`journal_entry_${entry.id}_chunk_${i}`, chunks[i]);
  }

  // Save metadata about chunks
  await SecureStore.setItemAsync(
    `journal_entry_${entry.id}_meta`,
    JSON.stringify({ chunkCount: chunks.length })
  );
}

/**
 * Retrieves entry from secure store (handles chunked entries)
 */
export async function getEntryFromSecureStore(
  entryId: string
): Promise<LocalJournalEntry | null> {
  try {
    // Try direct read first
    const entryJson = await SecureStore.getItemAsync(`journal_entry_${entryId}`);
    if (entryJson) {
      return JSON.parse(entryJson);
    }

    // Check if entry is chunked
    const metaJson = await SecureStore.getItemAsync(`journal_entry_${entryId}_meta`);
    if (!metaJson) return null;

    const { chunkCount } = JSON.parse(metaJson);
    let fullJson = '';

    // Reconstruct from chunks
    for (let i = 0; i < chunkCount; i++) {
      const chunk = await SecureStore.getItemAsync(`journal_entry_${entryId}_chunk_${i}`);
      if (chunk) fullJson += chunk;
    }

    return JSON.parse(fullJson);
  } catch (error) {
    console.error('Failed to get entry from secure store:', error);
    return null;
  }
}

/**
 * Get all local journal entries
 */
export async function getAllLocalEntries(): Promise<LocalJournalEntry[]> {
  try {
    // Get all entry IDs from AsyncStorage index
    const indexJson = await AsyncStorage.getItem('journal_entries_index');
    const entryIds: string[] = JSON.parse(indexJson || '[]');

    const entries: LocalJournalEntry[] = [];
    for (const entryId of entryIds) {
      const entry = await getEntryFromSecureStore(entryId);
      if (entry) {
        entries.push(entry);
      }
    }

    // Sort by creation date (newest first)
    entries.sort(
      (a, b) => new Date(b.clientCreatedAt).getTime() - new Date(a.clientCreatedAt).getTime()
    );

    return entries;
  } catch (error) {
    console.error('Failed to get all entries:', error);
    return [];
  }
}

/**
 * Add entry ID to index
 */
async function addToEntriesIndex(entryId: string): Promise<void> {
  const indexJson = await AsyncStorage.getItem('journal_entries_index');
  const entryIds: string[] = JSON.parse(indexJson || '[]');

  if (!entryIds.includes(entryId)) {
    entryIds.push(entryId);
    await AsyncStorage.setItem('journal_entries_index', JSON.stringify(entryIds));
  }
}

/**
 * Adds entry to sync queue
 */
async function addToSyncQueue(
  entryId: string,
  type: 'create' | 'photo',
  priority: 'high' | 'normal' = 'normal'
): Promise<void> {
  const queueJson = await AsyncStorage.getItem('sync_queue');
  const queue: SyncQueueItem[] = JSON.parse(queueJson || '[]');

  // Check if entry is already in queue
  const existingIndex = queue.findIndex((item) => item.entryId === entryId);
  if (existingIndex !== -1) {
    // Update existing queue item
    queue[existingIndex].priority = priority;
    queue[existingIndex].retryCount = 0;
  } else {
    // Add new queue item
    const queueItem: SyncQueueItem = {
      entryId,
      type,
      priority,
      addedAt: new Date().toISOString(),
      retryCount: 0,
    };
    queue.push(queueItem);
  }

  await AsyncStorage.setItem('sync_queue', JSON.stringify(queue));

  // Add to entries index
  await addToEntriesIndex(entryId);
}

/**
 * Removes entry from sync queue
 */
async function removeFromSyncQueue(entryId: string): Promise<void> {
  const queueJson = await AsyncStorage.getItem('sync_queue');
  const queue: SyncQueueItem[] = JSON.parse(queueJson || '[]');

  const updatedQueue = queue.filter((item) => item.entryId !== entryId);

  await AsyncStorage.setItem('sync_queue', JSON.stringify(updatedQueue));
}

/**
 * Updates sync queue item
 */
async function updateSyncQueue(queueItem: SyncQueueItem): Promise<void> {
  const queueJson = await AsyncStorage.getItem('sync_queue');
  const queue: SyncQueueItem[] = JSON.parse(queueJson || '[]');

  const index = queue.findIndex((item) => item.entryId === queueItem.entryId);
  if (index !== -1) {
    queue[index] = queueItem;
    await AsyncStorage.setItem('sync_queue', JSON.stringify(queue));
  }
}

/**
 * Updates sync status for an entry
 */
async function updateSyncStatus(entryId: string, status: SyncStatus): Promise<void> {
  await AsyncStorage.setItem(
    `sync_status_${entryId}`,
    JSON.stringify({ status, updatedAt: new Date().toISOString() })
  );
}

/**
 * Syncs all pending entries to Supabase
 */
export async function syncPendingEntries(): Promise<void> {
  try {
    // Get sync queue
    const syncQueueJson = await AsyncStorage.getItem('sync_queue');
    const syncQueue: SyncQueueItem[] = JSON.parse(syncQueueJson || '[]');

    if (syncQueue.length === 0) {
      console.log('No entries to sync');
      return;
    }

    console.log(`Syncing ${syncQueue.length} entries...`);

    // Process each queued entry
    for (const queueItem of syncQueue) {
      // Check if retry is needed
      if (queueItem.nextRetryAt) {
        const nextRetry = new Date(queueItem.nextRetryAt);
        if (nextRetry > new Date()) {
          console.log(`Skipping ${queueItem.entryId} - retry scheduled for ${nextRetry}`);
          continue;
        }
      }

      // Sync the entry
      await syncSingleEntry(queueItem);
    }

    // Update last sync timestamp
    await AsyncStorage.setItem('last_sync_timestamp', new Date().toISOString());
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

/**
 * Syncs a single entry to Supabase
 */
async function syncSingleEntry(queueItem: SyncQueueItem): Promise<void> {
  const { entryId, type } = queueItem;

  try {
    // Update status to syncing
    await updateSyncStatus(entryId, SyncStatus.SYNCING);

    // Get entry from secure store
    const entry = await getEntryFromSecureStore(entryId);
    if (!entry) {
      console.error(`Entry ${entryId} not found in secure store`);
      await removeFromSyncQueue(entryId);
      return;
    }

    if (type === 'create') {
      // Sync text content to Supabase
      const { error } = await supabase.from('journal_entries').insert({
        id: entry.id,
        user_id: entry.userId,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        photo_url: entry.photoUrl,
        client_created_at: entry.clientCreatedAt,
        is_synced: true,
      });

      if (error) throw error;

      // Update local entry
      entry.syncStatus = entry.photoUri && !entry.photoUrl ? SyncStatus.PHOTO_PENDING : SyncStatus.SYNCED;
      entry.syncedAt = new Date().toISOString();
      entry.isLocalOnly = false;

      await saveEntryToSecureStore(entry);

      // Remove from sync queue
      await removeFromSyncQueue(entryId);

      console.log(`Entry ${entryId} synced successfully`);
    }
  } catch (error) {
    console.error(`Failed to sync entry ${entryId}:`, error);

    // Increment retry count
    queueItem.retryCount++;

    // Calculate next retry time (exponential backoff)
    const backoffSeconds = Math.min(300, Math.pow(3, queueItem.retryCount) * 5);
    queueItem.nextRetryAt = new Date(Date.now() + backoffSeconds * 1000).toISOString();

    // Update sync queue
    await updateSyncQueue(queueItem);

    // Update entry status
    await updateSyncStatus(entryId, SyncStatus.FAILED);

    // If max retries exceeded, log error
    if (queueItem.retryCount >= 10) {
      console.error(`Entry ${entryId} exceeded max retries`);
    }
  }
}

/**
 * Get sync status message for UI
 */
export function getSyncStatusMessage(entry: LocalJournalEntry): string {
  switch (entry.syncStatus) {
    case SyncStatus.LOCAL_ONLY:
      return 'Saved on this device';
    case SyncStatus.PENDING:
      return 'Waiting to sync...';
    case SyncStatus.SYNCING:
      return 'Syncing...';
    case SyncStatus.SYNCED:
      return 'Synced';
    case SyncStatus.FAILED:
      return 'Sync failed - will retry';
    case SyncStatus.PHOTO_PENDING:
      return 'Text synced, photo uploading...';
    default:
      return 'Unknown status';
  }
}

/**
 * Get sync status icon for UI
 */
export function getSyncStatusIcon(entry: LocalJournalEntry): string {
  switch (entry.syncStatus) {
    case SyncStatus.LOCAL_ONLY:
      return '📱';
    case SyncStatus.PENDING:
      return '⏳';
    case SyncStatus.SYNCING:
      return '☁️';
    case SyncStatus.SYNCED:
      return '✅';
    case SyncStatus.FAILED:
      return '⚠️';
    case SyncStatus.PHOTO_PENDING:
      return '📸';
    default:
      return '';
  }
}
