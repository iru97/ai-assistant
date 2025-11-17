/**
 * Journal Safe MVP - TypeScript Types
 * Defines interfaces for journal entries and sync operations
 */

/**
 * Mood types matching the database enum
 */
export type MoodType = 'calm' | 'happy' | 'anxious' | 'sad' | 'overwhelmed';

/**
 * Sync status for journal entries
 */
export enum SyncStatus {
  LOCAL_ONLY = 'local_only', // Saved locally, not yet synced
  PENDING = 'pending', // In sync queue
  SYNCING = 'syncing', // Currently uploading
  SYNCED = 'synced', // Successfully synced to cloud
  FAILED = 'failed', // Sync failed (will retry)
  PHOTO_PENDING = 'photo_pending', // Text synced, photos pending
}

/**
 * Local journal entry structure
 */
export interface LocalJournalEntry {
  // Identification
  id: string; // UUID generated locally
  userId: string; // User ID from Supabase auth

  // Content
  title?: string; // Optional title
  content: string; // Journal entry text (required)
  mood?: MoodType; // Optional mood selection
  photoUrl?: string; // Supabase Storage URL (after upload)

  // Photos
  photoUri?: string; // Local file URI (before upload)

  // Metadata
  clientCreatedAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp

  // Sync tracking
  syncStatus: SyncStatus;
  syncAttempts: number; // Retry counter
  lastSyncAttempt?: string; // ISO 8601 timestamp
  syncedAt?: string; // ISO 8601 timestamp of successful sync

  // Local-only flags
  isLocalOnly: boolean; // True if never synced
}

/**
 * Supabase database entry (cloud schema)
 */
export interface SupabaseJournalEntry {
  id: string; // Same UUID from local entry
  user_id: string; // Foreign key to auth.users
  title?: string;
  content: string;
  mood?: MoodType;
  photo_url?: string; // Synced photo URL
  client_created_at: string;
  created_at: string;
  updated_at: string;
  is_synced: boolean;
  deleted_at?: string;
}

/**
 * Sync queue item
 */
export interface SyncQueueItem {
  entryId: string; // Reference to entry ID
  type: 'create' | 'photo'; // Type of sync operation
  priority: 'high' | 'normal'; // High priority = user-initiated
  addedAt: string; // When added to queue
  retryCount: number;
  nextRetryAt?: string; // When to retry next
}

/**
 * Photo upload task
 */
export interface PhotoUploadTask {
  id: string; // Unique task ID
  entryId: string; // Parent entry ID
  photoUri: string; // Local file URI
  fileName: string; // Target filename in storage
  uploadProgress: number; // 0-100
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
  pendingCount: number; // Entries waiting to sync
  lastSyncTime?: Date;
  error?: string;
}

/**
 * Journal prompt from prompts.json
 */
export interface JournalPrompt {
  id: number;
  category: string;
  text_en: string;
  text_es: string;
}
