# Offline-First Architecture for Journal Safe MVP

## Overview

This document defines the offline-first architecture for Journal Safe, a mental health journaling app that MUST work reliably even without internet connectivity. The design prioritizes simplicity, data safety, and user trust.

### Core Principles

1. **Write-first local**: All entries are saved locally before any network operation
2. **Append-only model**: Entries are never edited after creation (simple sync, no conflicts)
3. **Transparent sync**: Users always know the sync status of their data
4. **Graceful degradation**: Full functionality offline, enhanced features online
5. **Data safety**: Multiple layers of persistence to prevent data loss

---

## 1. Data Flow Architecture

### High-Level Flow

```
User Input (Journal Entry)
    ↓
[1] Save to Local Storage (IMMEDIATE)
    ↓
[2] Add to Sync Queue
    ↓
[3] Update UI (show "saved locally")
    ↓
[4] Attempt Background Sync (if online)
    ↓
[5] Upload to Supabase
    ↓
[6] Update Local Entry (mark as synced)
    ↓
[7] Update UI (show "synced")
```

### Detailed Data Flow

#### Phase 1: Local Write (Synchronous)
```typescript
User creates entry
    ↓
Generate local UUID (entry ID)
    ↓
Save to expo-secure-store (encrypted)
    ↓
Add to AsyncStorage sync queue
    ↓
Update UI immediately (optimistic)
```

#### Phase 2: Background Sync (Asynchronous)
```typescript
Check network status
    ↓
If offline: Mark as "pending sync" and exit
    ↓
If online: Fetch entries from sync queue
    ↓
For each entry:
    ├─ Upload text content to Supabase
    ├─ Upload photos to Supabase Storage (if any)
    └─ On success: Mark as synced, remove from queue
```

#### Phase 3: Photo Handling (Separate Pipeline)
```typescript
Text entry synced successfully
    ↓
Check for attached photos
    ↓
For each photo:
    ├─ Compress image (reduce size)
    ├─ Upload to Supabase Storage
    ├─ Retry on failure (exponential backoff)
    └─ Update entry with photo URL
```

---

## 2. Local Storage Strategy

### Storage Layer Architecture

```
┌─────────────────────────────────────────┐
│     expo-secure-store (Encrypted)       │
│  - Journal entry content                │
│  - Sensitive metadata                   │
│  - User preferences                     │
└─────────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────────┐
│     AsyncStorage (Cache/Queue)          │
│  - Sync queue (entries pending upload)  │
│  - Sync status by entry ID              │
│  - Photo upload queue                   │
│  - Last sync timestamp                  │
└─────────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────────┐
│        Supabase (Cloud Database)        │
│  - Synced journal entries               │
│  - Photo URLs (Storage bucket)          │
│  - User account data                    │
└─────────────────────────────────────────┘
```

### What Goes Where

#### expo-secure-store (Encrypted Storage)
**Purpose**: Secure, encrypted storage for sensitive journal data

**Storage Key Pattern**: `journal_entry_{entryId}`

**Stored Data**:
- Full journal entry content (text, mood, date)
- Entry metadata (created_at, updated_at)
- Local-only entries not yet synced

**Limitations**:
- Max 2KB per entry (iOS limitation)
- For larger entries, split into chunks: `journal_entry_{entryId}_chunk_{n}`

#### AsyncStorage (Unencrypted Cache)
**Purpose**: Fast access to sync metadata and queues

**Storage Keys**:
- `sync_queue`: Array of entry IDs pending sync
- `photo_upload_queue`: Array of photo upload tasks
- `sync_status_{entryId}`: Sync status for each entry
- `last_sync_timestamp`: Last successful sync time
- `failed_syncs`: Entries that failed to sync (for retry)

**Why AsyncStorage for Queues?**
- Fast access for background sync operations
- No size limitations for queue arrays
- Non-sensitive data (just IDs and status)

---

## 3. Sync Logic

### Sync Triggers

The app attempts to sync in these scenarios:

1. **App Foreground**: When app comes to foreground
2. **Network Change**: When device goes from offline to online
3. **Manual Sync**: User pulls to refresh or taps "Sync Now"
4. **After Entry Creation**: Immediate attempt after saving locally
5. **Periodic Background**: Every 5 minutes when app is active

### Sync Detection

**How to Detect What Needs Syncing**:

```typescript
// Check AsyncStorage sync queue
const syncQueue = await AsyncStorage.getItem('sync_queue');
const pendingIds = JSON.parse(syncQueue || '[]');

// For each pending ID, fetch from secure store and sync
for (const entryId of pendingIds) {
  const entry = await getEntryFromSecureStore(entryId);
  await syncEntryToSupabase(entry);
}
```

### Retry Strategy

**Exponential Backoff for Failed Syncs**:

```typescript
Attempt 1: Immediate
Attempt 2: Wait 5 seconds
Attempt 3: Wait 15 seconds
Attempt 4: Wait 45 seconds
Attempt 5: Wait 2 minutes
Attempt 6+: Wait 5 minutes

Max retries: 10
After max retries: Mark as "sync failed" and notify user
```

**Retry Logic**:
- Store retry count with each failed entry
- Reset retry count on successful sync
- Exponential backoff prevents battery drain
- User can manually retry at any time

### Photo Upload Handling

Photos are uploaded **separately** from text content:

1. **Text First**: Sync journal entry text immediately
2. **Photos Queued**: Add photos to separate upload queue
3. **Background Upload**: Upload photos in background with retry
4. **Progressive Enhancement**: Entry is usable before photos sync
5. **Photo URLs Updated**: Once uploaded, update entry with photo URLs

**Why Separate Photo Pipeline?**
- Photos are large (slow upload on poor connection)
- Text entries must be saved quickly
- Photos can be retried independently
- Better user experience (text shows immediately)

---

## 4. TypeScript Interfaces

### Core Data Types

```typescript
/**
 * Sync status for journal entries
 */
export enum SyncStatus {
  LOCAL_ONLY = 'local_only',       // Saved locally, not yet synced
  PENDING = 'pending',             // In sync queue
  SYNCING = 'syncing',            // Currently uploading
  SYNCED = 'synced',              // Successfully synced to cloud
  FAILED = 'failed',              // Sync failed (will retry)
  PHOTO_PENDING = 'photo_pending' // Text synced, photos pending
}

/**
 * Local journal entry structure
 */
export interface LocalJournalEntry {
  // Identification
  id: string;                      // UUID generated locally
  userId: string;                  // User ID from Supabase auth

  // Content
  content: string;                 // Journal entry text
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  emotions?: string[];             // Array of emotion tags

  // Photos
  photoUris?: string[];            // Local file URIs (before upload)
  photoUrls?: string[];            // Supabase Storage URLs (after upload)

  // Metadata
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp

  // Sync tracking
  syncStatus: SyncStatus;
  syncAttempts: number;            // Retry counter
  lastSyncAttempt?: string;        // ISO 8601 timestamp
  syncedAt?: string;               // ISO 8601 timestamp of successful sync

  // Local-only flags
  isLocalOnly: boolean;            // True if never synced
  chunkCount?: number;             // If entry split into chunks
}

/**
 * Supabase database entry (cloud schema)
 */
export interface SupabaseJournalEntry {
  id: string;                      // Same UUID from local entry
  user_id: string;                 // Foreign key to auth.users
  content: string;
  mood?: string;
  emotions?: string[];
  photo_urls?: string[];           // Only synced photo URLs
  created_at: string;
  updated_at: string;
  synced_at: string;
}

/**
 * Sync queue item
 */
export interface SyncQueueItem {
  entryId: string;                 // Reference to entry ID
  type: 'create' | 'photo';       // Type of sync operation
  priority: 'high' | 'normal';    // High priority = user-initiated
  addedAt: string;                // When added to queue
  retryCount: number;
  nextRetryAt?: string;           // When to retry next
}

/**
 * Photo upload task
 */
export interface PhotoUploadTask {
  id: string;                      // Unique task ID
  entryId: string;                 // Parent entry ID
  photoUri: string;                // Local file URI
  fileName: string;                // Target filename in storage
  uploadProgress: number;          // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  retryCount: number;
  error?: string;
}

/**
 * Sync state (for UI display)
 */
export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;            // Entries waiting to sync
  lastSyncTime?: Date;
  error?: string;
}
```

---

## 5. Code Examples

### Core Functions

#### 1. Save Journal Entry Locally

```typescript
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Saves a journal entry locally (ALWAYS succeeds, even offline)
 */
export async function saveJournalEntryLocally(
  userId: string,
  content: string,
  mood?: string,
  photoUris?: string[]
): Promise<LocalJournalEntry> {
  try {
    // Generate local entry
    const entry: LocalJournalEntry = {
      id: uuidv4(),
      userId,
      content,
      mood,
      photoUris,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    // Even if secure store fails, try AsyncStorage as backup
    await saveEntryToAsyncStorage(entry);
    throw error;
  }
}

/**
 * Saves entry to secure store (handles chunking for large entries)
 */
async function saveEntryToSecureStore(entry: LocalJournalEntry): Promise<void> {
  const entryJson = JSON.stringify(entry);
  const CHUNK_SIZE = 1900; // Leave margin for iOS 2KB limit

  // If entry is small, save directly
  if (entryJson.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(
      `journal_entry_${entry.id}`,
      entryJson
    );
    return;
  }

  // If entry is large, split into chunks
  const chunks = [];
  for (let i = 0; i < entryJson.length; i += CHUNK_SIZE) {
    chunks.push(entryJson.slice(i, i + CHUNK_SIZE));
  }

  // Save each chunk
  for (let i = 0; i < chunks.length; i++) {
    await SecureStore.setItemAsync(
      `journal_entry_${entry.id}_chunk_${i}`,
      chunks[i]
    );
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
async function getEntryFromSecureStore(
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
      const chunk = await SecureStore.getItemAsync(
        `journal_entry_${entryId}_chunk_${i}`
      );
      if (chunk) fullJson += chunk;
    }

    return JSON.parse(fullJson);
  } catch (error) {
    console.error('Failed to get entry from secure store:', error);
    return null;
  }
}

/**
 * Backup save to AsyncStorage (fallback if SecureStore fails)
 */
async function saveEntryToAsyncStorage(entry: LocalJournalEntry): Promise<void> {
  await AsyncStorage.setItem(
    `backup_entry_${entry.id}`,
    JSON.stringify(entry)
  );
}
```

#### 2. Sync Pending Entries

```typescript
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../utils/supabase';

/**
 * Syncs all pending entries to Supabase
 */
export async function syncPendingEntries(): Promise<void> {
  try {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('Offline - skipping sync');
      return;
    }

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
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          id: entry.id,
          user_id: entry.userId,
          content: entry.content,
          mood: entry.mood,
          emotions: entry.emotions,
          created_at: entry.createdAt,
          updated_at: entry.updatedAt,
          synced_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update local entry
      entry.syncStatus = entry.photoUris && entry.photoUris.length > 0
        ? SyncStatus.PHOTO_PENDING
        : SyncStatus.SYNCED;
      entry.syncedAt = new Date().toISOString();
      entry.isLocalOnly = false;

      await saveEntryToSecureStore(entry);

      // Remove from sync queue
      await removeFromSyncQueue(entryId);

      // If there are photos, add to photo upload queue
      if (entry.photoUris && entry.photoUris.length > 0) {
        await addPhotosToUploadQueue(entry);
      }

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

    // If max retries exceeded, notify user
    if (queueItem.retryCount >= 10) {
      console.error(`Entry ${entryId} exceeded max retries`);
      // TODO: Show user notification
    }
  }
}
```

#### 3. Upload Photo with Retry

```typescript
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

/**
 * Uploads a photo to Supabase Storage with retry logic
 */
export async function uploadPhoto(
  task: PhotoUploadTask,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  const MAX_RETRIES = 5;

  try {
    // Update task status
    task.status = 'uploading';
    await updatePhotoUploadTask(task);

    // Read file as base64
    const fileInfo = await FileSystem.getInfoAsync(task.photoUri);
    if (!fileInfo.exists) {
      throw new Error('Photo file not found');
    }

    const base64 = await FileSystem.readAsStringAsync(task.photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Generate storage path
    const fileExt = task.fileName.split('.').pop();
    const storagePath = `${task.entryId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('journal-photos')
      .upload(storagePath, decode(base64), {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('journal-photos')
      .getPublicUrl(storagePath);

    const photoUrl = urlData.publicUrl;

    // Update task as completed
    task.status = 'completed';
    task.uploadProgress = 100;
    await updatePhotoUploadTask(task);

    // Update entry with photo URL
    await addPhotoUrlToEntry(task.entryId, photoUrl);

    // Remove from upload queue
    await removeFromPhotoUploadQueue(task.id);

    console.log(`Photo uploaded successfully: ${photoUrl}`);
    return photoUrl;

  } catch (error) {
    console.error('Photo upload failed:', error);

    // Increment retry count
    task.retryCount++;
    task.status = 'failed';
    task.error = error.message;

    if (task.retryCount < MAX_RETRIES) {
      // Schedule retry with exponential backoff
      const backoffMs = Math.pow(2, task.retryCount) * 5000;
      setTimeout(() => {
        uploadPhoto(task, onProgress).catch(console.error);
      }, backoffMs);

      await updatePhotoUploadTask(task);
    } else {
      console.error(`Photo upload failed after ${MAX_RETRIES} retries`);
      await updatePhotoUploadTask(task);
      // TODO: Notify user of failed photo upload
    }

    return null;
  }
}

/**
 * Adds photo URL to existing entry
 */
async function addPhotoUrlToEntry(
  entryId: string,
  photoUrl: string
): Promise<void> {
  // Update local entry
  const entry = await getEntryFromSecureStore(entryId);
  if (!entry) return;

  entry.photoUrls = entry.photoUrls || [];
  entry.photoUrls.push(photoUrl);

  // Check if all photos are uploaded
  const allPhotosUploaded = entry.photoUris?.length === entry.photoUrls.length;
  if (allPhotosUploaded) {
    entry.syncStatus = SyncStatus.SYNCED;
  }

  await saveEntryToSecureStore(entry);

  // Update Supabase
  await supabase
    .from('journal_entries')
    .update({ photo_urls: entry.photoUrls })
    .eq('id', entryId);
}
```

#### 4. Sync Queue Management

```typescript
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

  const queueItem: SyncQueueItem = {
    entryId,
    type,
    priority,
    addedAt: new Date().toISOString(),
    retryCount: 0,
  };

  queue.push(queueItem);

  await AsyncStorage.setItem('sync_queue', JSON.stringify(queue));
}

/**
 * Removes entry from sync queue
 */
async function removeFromSyncQueue(entryId: string): Promise<void> {
  const queueJson = await AsyncStorage.getItem('sync_queue');
  const queue: SyncQueueItem[] = JSON.parse(queueJson || '[]');

  const updatedQueue = queue.filter(item => item.entryId !== entryId);

  await AsyncStorage.setItem('sync_queue', JSON.stringify(updatedQueue));
}

/**
 * Updates sync queue item
 */
async function updateSyncQueue(queueItem: SyncQueueItem): Promise<void> {
  const queueJson = await AsyncStorage.getItem('sync_queue');
  const queue: SyncQueueItem[] = JSON.parse(queueJson || '[]');

  const index = queue.findIndex(item => item.entryId === queueItem.entryId);
  if (index !== -1) {
    queue[index] = queueItem;
    await AsyncStorage.setItem('sync_queue', JSON.stringify(queue));
  }
}

/**
 * Updates sync status for an entry
 */
async function updateSyncStatus(
  entryId: string,
  status: SyncStatus
): Promise<void> {
  await AsyncStorage.setItem(
    `sync_status_${entryId}`,
    JSON.stringify({ status, updatedAt: new Date().toISOString() })
  );
}
```

#### 5. Network Monitoring

```typescript
import NetInfo from '@react-native-community/netinfo';

/**
 * Sets up network monitoring to trigger sync
 */
export function setupNetworkMonitoring(): () => void {
  const unsubscribe = NetInfo.addEventListener(state => {
    console.log('Connection type:', state.type);
    console.log('Is connected?', state.isConnected);

    // If just came online, trigger sync
    if (state.isConnected) {
      syncPendingEntries().catch(console.error);
    }
  });

  return unsubscribe;
}

/**
 * Sets up app state monitoring to trigger sync
 */
export function setupAppStateMonitoring(): () => void {
  const subscription = AppState.addEventListener('change', nextAppState => {
    if (nextAppState === 'active') {
      // App came to foreground, trigger sync
      syncPendingEntries().catch(console.error);
    }
  });

  return () => subscription.remove();
}
```

---

## 6. Edge Cases

### Edge Case 1: App Crashes During Sync

**Scenario**: App crashes while uploading entry to Supabase

**Impact**: Entry may be partially synced

**Solution**:
```typescript
// On app startup, check for incomplete syncs
export async function recoverFromCrash(): Promise<void> {
  // Find entries with status "syncing"
  const allEntries = await getAllLocalEntries();

  for (const entry of allEntries) {
    if (entry.syncStatus === SyncStatus.SYNCING) {
      // Check if entry exists in Supabase
      const { data } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('id', entry.id)
        .single();

      if (data) {
        // Entry was successfully synced before crash
        entry.syncStatus = SyncStatus.SYNCED;
        await saveEntryToSecureStore(entry);
      } else {
        // Entry was not synced, add back to queue
        entry.syncStatus = SyncStatus.PENDING;
        await saveEntryToSecureStore(entry);
        await addToSyncQueue(entry.id, 'create', 'high');
      }
    }
  }
}
```

**Prevention**:
- Use atomic operations where possible
- Check sync status on app startup
- Retry logic handles incomplete syncs
- Never delete local entry until confirmed synced

---

### Edge Case 2: Entry Created on Multiple Devices

**Scenario**: User has app on iPhone and iPad, creates entries on both while offline

**Impact**: Two entries with different local UUIDs

**Solution** (Append-Only Model):
```typescript
// Since entries are append-only, this is NOT a conflict
// Each device creates its own entry with unique UUID
// Both entries sync to Supabase independently

// On sync:
Device A: Creates entry with ID "uuid-a"
Device B: Creates entry with ID "uuid-b"

// After sync:
Supabase has both entries (uuid-a and uuid-b)
Each device fetches all entries from Supabase
Both devices show both entries

// No conflict resolution needed!
```

**Why This Works**:
- Journal entries are append-only (never edited)
- Each entry has a unique UUID
- Multiple entries from different devices are all valid
- Sync merges entries by fetching all from Supabase

**Sync Logic**:
```typescript
export async function fetchEntriesFromSupabase(
  userId: string
): Promise<LocalJournalEntry[]> {
  // Fetch all entries from Supabase
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get all local entry IDs
  const localEntries = await getAllLocalEntries();
  const localIds = new Set(localEntries.map(e => e.id));

  // Find entries that exist in Supabase but not locally
  const newEntries = data.filter(entry => !localIds.has(entry.id));

  // Save new entries locally
  for (const entry of newEntries) {
    await saveEntryToSecureStore(convertToLocalEntry(entry));
  }

  return data.map(convertToLocalEntry);
}
```

---

### Edge Case 3: Photo Upload Fails but Text Syncs

**Scenario**: Entry text syncs successfully, but photo upload fails

**Impact**: Entry shows in cloud without photos

**Solution**:
```typescript
// Use separate sync status for photos
entry.syncStatus = SyncStatus.PHOTO_PENDING;

// Show partial sync in UI
<EntryCard
  entry={entry}
  syncStatus={
    entry.syncStatus === SyncStatus.PHOTO_PENDING
      ? 'Text synced, photos pending'
      : 'Fully synced'
  }
/>

// Retry photo upload independently
await retryPhotoUploads(entry.id);
```

**Photo Retry Logic**:
```typescript
export async function retryPhotoUploads(entryId: string): Promise<void> {
  const entry = await getEntryFromSecureStore(entryId);
  if (!entry || !entry.photoUris) return;

  // Find photos that haven't been uploaded yet
  const uploadedCount = entry.photoUrls?.length || 0;
  const pendingPhotos = entry.photoUris.slice(uploadedCount);

  // Upload each pending photo
  for (const photoUri of pendingPhotos) {
    const task: PhotoUploadTask = {
      id: uuidv4(),
      entryId: entry.id,
      photoUri,
      fileName: photoUri.split('/').pop() || 'photo.jpg',
      uploadProgress: 0,
      status: 'pending',
      retryCount: 0,
    };

    await uploadPhoto(task);
  }
}
```

**User Communication**:
```typescript
// Show clear status to user
function getSyncStatusMessage(entry: LocalJournalEntry): string {
  switch (entry.syncStatus) {
    case SyncStatus.LOCAL_ONLY:
      return '📱 Saved on this device';
    case SyncStatus.PENDING:
      return '⏳ Waiting to sync...';
    case SyncStatus.SYNCING:
      return '☁️ Syncing...';
    case SyncStatus.SYNCED:
      return '✅ Synced';
    case SyncStatus.FAILED:
      return '⚠️ Sync failed - tap to retry';
    case SyncStatus.PHOTO_PENDING:
      return '✅ Text synced, 📸 photos uploading...';
  }
}
```

---

### Edge Case 4: User Deletes Local Data

**Scenario**: User clears app data or uninstalls/reinstalls app

**Impact**: All local entries are lost

**Solution**:
```typescript
// On app startup, check if Supabase has entries
export async function restoreFromCloud(userId: string): Promise<void> {
  try {
    // Check if local storage is empty
    const localEntries = await getAllLocalEntries();

    if (localEntries.length === 0) {
      // Fetch all entries from Supabase
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId);

      if (data && data.length > 0) {
        // Restore entries to local storage
        for (const entry of data) {
          await saveEntryToSecureStore(convertToLocalEntry(entry));
        }

        console.log(`Restored ${data.length} entries from cloud`);
      }
    }
  } catch (error) {
    console.error('Failed to restore from cloud:', error);
  }
}
```

**Prevention**:
- Always sync entries to cloud as soon as possible
- Show warning before clearing app data
- Implement "Download my data" feature

---

### Edge Case 5: Network Drops During Upload

**Scenario**: Network connection drops mid-upload

**Impact**: Upload fails, needs retry

**Solution**:
```typescript
// Supabase client handles network errors automatically
// Our retry logic catches these errors

try {
  await supabase.from('journal_entries').insert(entry);
} catch (error) {
  if (error.message.includes('network') || error.message.includes('timeout')) {
    // Network error - will retry with exponential backoff
    console.log('Network error, will retry');
  }
  throw error; // Let retry logic handle it
}
```

**Network Monitoring**:
```typescript
// Monitor network status during upload
export async function uploadWithNetworkMonitoring(
  entry: LocalJournalEntry
): Promise<void> {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (!state.isConnected) {
      // Network dropped during upload
      console.log('Network dropped, will retry when online');
    }
  });

  try {
    await supabase.from('journal_entries').insert(entry);
  } finally {
    unsubscribe();
  }
}
```

---

### Edge Case 6: Sync Queue Gets Very Large

**Scenario**: User creates 100+ entries while offline for days

**Impact**: Sync may take a long time, drain battery

**Solution**:
```typescript
// Batch sync entries instead of one-by-one
export async function batchSyncEntries(
  entries: LocalJournalEntry[]
): Promise<void> {
  const BATCH_SIZE = 10;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    // Upload batch to Supabase
    const { error } = await supabase
      .from('journal_entries')
      .insert(batch.map(convertToSupabaseEntry));

    if (error) {
      console.error('Batch sync failed:', error);
      // Individual retry logic will handle failed entries
    } else {
      // Update all entries in batch as synced
      for (const entry of batch) {
        entry.syncStatus = SyncStatus.SYNCED;
        await saveEntryToSecureStore(entry);
        await removeFromSyncQueue(entry.id);
      }
    }

    // Pause between batches to avoid overwhelming API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

**User Communication**:
```typescript
// Show progress during large sync
<View>
  <Text>Syncing {syncedCount} of {totalCount} entries...</Text>
  <ProgressBar progress={syncedCount / totalCount} />
</View>
```

---

## 7. Implementation Checklist

### Phase 1: Local Storage (Week 1)
- [ ] Install expo-secure-store in dependencies (move from devDependencies)
- [ ] Implement `saveJournalEntryLocally()` function
- [ ] Implement `getEntryFromSecureStore()` with chunking support
- [ ] Implement `getAllLocalEntries()` function
- [ ] Add AsyncStorage backup layer
- [ ] Test local save/retrieve flow

### Phase 2: Sync Queue (Week 2)
- [ ] Implement sync queue in AsyncStorage
- [ ] Implement `addToSyncQueue()` function
- [ ] Implement `removeFromSyncQueue()` function
- [ ] Implement sync status tracking
- [ ] Test queue management

### Phase 3: Supabase Sync (Week 3)
- [ ] Create `journal_entries` table in Supabase
- [ ] Set up Row Level Security policies
- [ ] Implement `syncSingleEntry()` function
- [ ] Implement `syncPendingEntries()` function
- [ ] Implement exponential backoff retry logic
- [ ] Test sync with mock entries

### Phase 4: Photo Upload (Week 4)
- [ ] Create `journal-photos` storage bucket in Supabase
- [ ] Implement photo upload queue
- [ ] Implement `uploadPhoto()` with retry
- [ ] Implement `addPhotosToUploadQueue()` function
- [ ] Test photo upload flow
- [ ] Test photo retry logic

### Phase 5: Network Monitoring (Week 5)
- [ ] Install @react-native-community/netinfo
- [ ] Implement `setupNetworkMonitoring()` function
- [ ] Implement `setupAppStateMonitoring()` function
- [ ] Trigger sync on network change
- [ ] Trigger sync on app foreground
- [ ] Test offline/online transitions

### Phase 6: UI Indicators (Week 6)
- [ ] Create sync status badge component
- [ ] Show sync status on entry cards
- [ ] Implement pull-to-refresh sync
- [ ] Implement manual "Sync Now" button
- [ ] Show sync progress for large queues
- [ ] Show photo upload progress
- [ ] Test UI states (synced, pending, failed)

### Phase 7: Edge Cases (Week 7)
- [ ] Implement crash recovery (`recoverFromCrash()`)
- [ ] Implement cloud restore (`restoreFromCloud()`)
- [ ] Implement batch sync for large queues
- [ ] Test multi-device scenario
- [ ] Test photo failure scenarios
- [ ] Test network drop scenarios

### Phase 8: Testing & Polish (Week 8)
- [ ] Test with airplane mode
- [ ] Test with poor connectivity
- [ ] Test with large entries (2KB+ text)
- [ ] Test with multiple photos
- [ ] Test sync after app crash
- [ ] Load test with 100+ entries
- [ ] Battery usage testing
- [ ] User acceptance testing

---

## 8. Supabase Database Schema

### Table: journal_entries

```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood TEXT,
  emotions TEXT[],
  photo_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);

-- Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Users can only read their own entries
CREATE POLICY "Users can view own entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own entries
CREATE POLICY "Users can insert own entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete entries (append-only)
-- No UPDATE or DELETE policies = no updates or deletes allowed
```

### Storage Bucket: journal-photos

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('journal-photos', 'journal-photos', true);

-- Storage policies
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'journal-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'journal-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 9. Performance Considerations

### Battery Optimization

**Problem**: Frequent sync attempts drain battery

**Solutions**:
1. **Exponential backoff**: Don't retry immediately after failure
2. **Batch operations**: Sync multiple entries at once
3. **Network awareness**: Only sync on WiFi for photos (optional setting)
4. **Debounce sync triggers**: Don't sync more than once per minute

```typescript
// Debounced sync function
let syncTimeout: NodeJS.Timeout | null = null;

export function scheduleSyncDebounced(): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(() => {
    syncPendingEntries().catch(console.error);
  }, 60000); // Wait 1 minute before syncing
}
```

### Storage Optimization

**Problem**: Secure store has 2KB limit on iOS

**Solutions**:
1. **Chunking**: Split large entries into chunks
2. **Compression**: Use gzip for text content (optional)
3. **Photo references**: Store photo URIs, not photo data
4. **Cleanup**: Delete synced entries after 30 days (keep in cloud)

### Network Optimization

**Problem**: Uploading photos on slow connection

**Solutions**:
1. **Image compression**: Reduce photo size before upload
2. **Progressive sync**: Sync text first, photos later
3. **WiFi-only mode**: Option to only upload photos on WiFi
4. **Resumable uploads**: Use chunked upload for large files

```typescript
// Compress image before upload
import * as ImageManipulator from 'expo-image-manipulator';

async function compressImage(uri: string): Promise<string> {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1920 } }], // Max width 1920px
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
}
```

---

## 10. Monitoring & Debugging

### Logging Strategy

```typescript
// Structured logging for debugging
export function logSync(action: string, data: any): void {
  const log = {
    timestamp: new Date().toISOString(),
    action,
    data,
  };

  console.log('SYNC:', JSON.stringify(log));

  // In production, send to analytics
  // Analytics.track('sync_event', log);
}

// Usage
logSync('entry_created', { entryId: entry.id });
logSync('sync_started', { queueSize: queue.length });
logSync('sync_completed', { syncedCount: 5, failedCount: 1 });
```

### Metrics to Track

1. **Sync success rate**: % of entries synced successfully
2. **Sync latency**: Time from creation to successful sync
3. **Retry count**: Average retries per entry
4. **Queue size**: Number of entries waiting to sync
5. **Photo upload success rate**: % of photos uploaded successfully
6. **Battery impact**: Battery drain from sync operations

### Debug Panel (Development Only)

```typescript
// Debug component to show sync state
export function SyncDebugPanel(): JSX.Element {
  const [syncState, setSyncState] = useState<SyncState | null>(null);

  useEffect(() => {
    loadSyncState().then(setSyncState);
  }, []);

  return (
    <View style={styles.debugPanel}>
      <Text>Sync Status: {syncState?.isSyncing ? 'Syncing' : 'Idle'}</Text>
      <Text>Pending: {syncState?.pendingCount}</Text>
      <Text>Last Sync: {syncState?.lastSyncTime?.toLocaleString()}</Text>
      <Text>Online: {syncState?.isOnline ? 'Yes' : 'No'}</Text>
      <Button title="Force Sync" onPress={syncPendingEntries} />
      <Button title="Clear Queue" onPress={clearSyncQueue} />
    </View>
  );
}
```

---

## 11. Security Considerations

### Encryption

- **expo-secure-store**: Encrypted by default (uses iOS Keychain / Android Keystore)
- **AsyncStorage**: NOT encrypted (only store non-sensitive data)
- **Supabase**: Use HTTPS for all requests
- **Photos**: Consider encrypting before upload (optional)

### Authentication

- Use Supabase Auth for user authentication
- Store auth tokens in expo-secure-store
- Refresh tokens automatically (Supabase client handles this)
- Never store passwords locally

### Data Privacy

- Row Level Security (RLS) ensures users only see their own data
- No shared entries or public entries (for MVP)
- Photos are in user-specific folders (user_id/photo.jpg)
- Clear privacy policy about what data is stored

---

## 12. Migration Path

### From MVP to v2

When the app grows, you may need:

1. **Conflict resolution**: If users can edit entries
2. **Real-time sync**: Use Supabase Realtime subscriptions
3. **Selective sync**: Only sync recent entries, fetch older on demand
4. **Client-side search**: Use SQLite for faster local search
5. **End-to-end encryption**: Encrypt entries before uploading

These features can be added later without major refactoring.

---

## Summary

This offline-first architecture ensures Journal Safe works reliably even without internet connectivity. Key principles:

1. **Local-first**: Everything saves locally immediately
2. **Background sync**: Transparent sync to cloud when online
3. **Append-only**: No conflicts, entries are never edited
4. **Simple retry**: Exponential backoff for failures
5. **Progressive enhancement**: Text syncs before photos
6. **User transparency**: Always show sync status

The architecture is **simple, robust, and production-ready** for an MVP.
