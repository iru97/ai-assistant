/**
 * Journal Safe MVP - Data Management Utilities
 * Handles clearing local data, deleting cloud data, and account deletion
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';
import { getAllLocalEntries } from './journalStorage';
import { StorageUsage } from '~/types/settings';

/**
 * Calculates storage usage
 */
export async function getStorageUsage(): Promise<StorageUsage> {
  try {
    const entries = await getAllLocalEntries();
    const entryCount = entries.length;
    const photoCount = entries.filter((e) => e.photoUri || e.photoUrl).length;

    // Estimate size (rough calculation)
    let totalBytes = 0;
    for (const entry of entries) {
      // Estimate JSON size
      totalBytes += JSON.stringify(entry).length;
    }

    const formattedSize = formatBytes(totalBytes);

    return {
      entryCount,
      photoCount,
      totalBytes,
      formattedSize,
    };
  } catch (error) {
    console.error('Failed to calculate storage usage:', error);
    return {
      entryCount: 0,
      photoCount: 0,
      totalBytes: 0,
      formattedSize: '0 B',
    };
  }
}

/**
 * Formats bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Clears all local data (AsyncStorage + SecureStore)
 * Cloud data remains intact
 */
export async function clearLocalData(): Promise<void> {
  try {
    console.log('Clearing local data...');

    // Get all entry IDs before clearing
    const entries = await getAllLocalEntries();

    // Clear SecureStore entries
    for (const entry of entries) {
      try {
        await SecureStore.deleteItemAsync(`journal_entry_${entry.id}`);

        // Also check for chunked entries
        const metaJson = await SecureStore.getItemAsync(`journal_entry_${entry.id}_meta`);
        if (metaJson) {
          const { chunkCount } = JSON.parse(metaJson);
          for (let i = 0; i < chunkCount; i++) {
            await SecureStore.deleteItemAsync(`journal_entry_${entry.id}_chunk_${i}`);
          }
          await SecureStore.deleteItemAsync(`journal_entry_${entry.id}_meta`);
        }
      } catch (error) {
        console.error(`Failed to delete entry ${entry.id} from SecureStore:`, error);
      }
    }

    // Clear AsyncStorage data
    const keysToRemove = [
      'journal_entries_index',
      'sync_queue',
      'last_sync_timestamp',
      'mood_history',
    ];

    for (const key of keysToRemove) {
      await AsyncStorage.removeItem(key);
    }

    console.log('Local data cleared successfully');
  } catch (error) {
    console.error('Failed to clear local data:', error);
    throw error;
  }
}

/**
 * Deletes all cloud data (Supabase)
 * Local data remains intact
 */
export async function deleteCloudData(): Promise<void> {
  try {
    console.log('Deleting cloud data...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Delete journal entries
    const { error: entriesError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('user_id', user.id);

    if (entriesError) throw entriesError;

    // Delete photos from storage
    const { data: photos, error: listError } = await supabase.storage
      .from('journal-photos')
      .list(user.id);

    if (!listError && photos && photos.length > 0) {
      const filePaths = photos.map((photo) => `${user.id}/${photo.name}`);
      const { error: deleteError } = await supabase.storage
        .from('journal-photos')
        .remove(filePaths);

      if (deleteError) {
        console.error('Failed to delete photos:', deleteError);
      }
    }

    // Note: We don't delete user_settings or profiles here
    // Those are handled separately

    console.log('Cloud data deleted successfully');
  } catch (error) {
    console.error('Failed to delete cloud data:', error);
    throw error;
  }
}

/**
 * Deletes ALL data (local + cloud)
 * This is irreversible
 */
export async function deleteAllData(): Promise<void> {
  try {
    console.log('Deleting all data...');

    // Delete cloud data first
    await deleteCloudData();

    // Then clear local data
    await clearLocalData();

    console.log('All data deleted successfully');
  } catch (error) {
    console.error('Failed to delete all data:', error);
    throw error;
  }
}

/**
 * Deletes user account (includes all data + profile)
 * This is irreversible and requires re-authentication
 */
export async function deleteAccount(): Promise<void> {
  try {
    console.log('Deleting account...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Delete all data first
    await deleteAllData();

    // Delete user_settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', user.id);

    if (settingsError) {
      console.error('Failed to delete user settings:', settingsError);
    }

    // Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Failed to delete profile:', profileError);
    }

    // Finally, delete the auth user
    // Note: This requires admin privileges, so we'll sign out instead
    // The actual user deletion should be handled by Supabase admin/triggers
    await supabase.auth.signOut();

    console.log('Account deleted successfully');
  } catch (error) {
    console.error('Failed to delete account:', error);
    throw error;
  }
}

/**
 * Gets count of unsynced entries
 */
export async function getUnsyncedCount(): Promise<number> {
  try {
    const syncQueueJson = await AsyncStorage.getItem('sync_queue');
    const syncQueue = JSON.parse(syncQueueJson || '[]');
    return syncQueue.length;
  } catch (error) {
    console.error('Failed to get unsynced count:', error);
    return 0;
  }
}

/**
 * Checks if user has any data
 */
export async function hasAnyData(): Promise<boolean> {
  try {
    const usage = await getStorageUsage();
    return usage.entryCount > 0;
  } catch (error) {
    console.error('Failed to check if user has data:', error);
    return false;
  }
}
