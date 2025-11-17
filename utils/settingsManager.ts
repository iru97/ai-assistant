/**
 * Journal Safe MVP - Settings Manager
 * Handles loading, saving, and syncing user settings
 *
 * Strategy:
 * - Settings are stored in AsyncStorage (offline-first)
 * - Settings are synced to Supabase user_settings table (cloud backup)
 * - On app start: load from AsyncStorage, then sync from Supabase if newer
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import {
  UserSettings,
  DEFAULT_SETTINGS,
  LanguageType,
  ThemeType,
  StartScreenType,
  DefaultMoodType,
  AutoSaveInterval,
  PhotoQuality,
} from '~/types/settings';

const SETTINGS_STORAGE_KEY = 'user_settings';
const LAST_SYNC_KEY = 'settings_last_sync';

/**
 * Gets all settings (from AsyncStorage first, then Supabase if needed)
 */
export async function getSettings(): Promise<UserSettings> {
  try {
    // Load from AsyncStorage
    const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

    if (settingsJson) {
      const settings: UserSettings = JSON.parse(settingsJson);

      // Try to sync from Supabase in background (non-blocking)
      syncSettingsFromSupabase().catch(console.error);

      return settings;
    }

    // No local settings, try Supabase
    const supabaseSettings = await loadSettingsFromSupabase();
    if (supabaseSettings) {
      await saveSettingsLocally(supabaseSettings);
      return supabaseSettings;
    }

    // No settings found, return defaults
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to get settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Updates a single setting
 */
export async function updateSetting<K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K]
): Promise<void> {
  try {
    const currentSettings = await getSettings();
    const updatedSettings: UserSettings = {
      ...currentSettings,
      [key]: value,
      updatedAt: new Date().toISOString(),
    };

    await saveSettings(updatedSettings);
  } catch (error) {
    console.error('Failed to update setting:', error);
    throw error;
  }
}

/**
 * Updates multiple settings at once
 */
export async function updateSettings(
  updates: Partial<UserSettings>
): Promise<void> {
  try {
    const currentSettings = await getSettings();
    const updatedSettings: UserSettings = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await saveSettings(updatedSettings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
}

/**
 * Saves settings to both AsyncStorage and Supabase
 */
export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    // Save to AsyncStorage (always succeeds)
    await saveSettingsLocally(settings);

    // Save to Supabase (background, non-blocking)
    saveSettingsToSupabase(settings).catch(console.error);
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

/**
 * Saves settings to AsyncStorage
 */
async function saveSettingsLocally(settings: UserSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Loads settings from Supabase
 */
async function loadSettingsFromSupabase(): Promise<UserSettings | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    // Map database columns to UserSettings interface
    const settings: UserSettings = {
      language: data.language as LanguageType,
      theme: data.theme as ThemeType,
      startScreen: DEFAULT_SETTINGS.startScreen, // Not in DB yet

      defaultMood: DEFAULT_SETTINGS.defaultMood, // Not in DB yet
      autoSaveInterval: DEFAULT_SETTINGS.autoSaveInterval, // Not in DB yet
      photoQuality: DEFAULT_SETTINGS.photoQuality, // Not in DB yet
      promptCategoryFilter: DEFAULT_SETTINGS.promptCategoryFilter, // Not in DB yet

      dailyAffirmationEnabled: data.daily_affirmation_enabled,
      dailyAffirmationTime: data.daily_affirmation_time || '08:00',
      affirmationThemeFilter: DEFAULT_SETTINGS.affirmationThemeFilter, // Not in DB yet

      dailyPromptEnabled: data.daily_prompt_enabled,
      dailyPromptTime: data.daily_prompt_time || '09:00',
      moodRemindersEnabled: DEFAULT_SETTINGS.moodRemindersEnabled, // Not in DB yet
      syncNotificationsEnabled: DEFAULT_SETTINGS.syncNotificationsEnabled, // Not in DB yet

      requireAuthOnAppOpen: data.require_auth_on_app_open,
      syncDataToCloud: true, // Default to true

      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return settings;
  } catch (error) {
    console.error('Failed to load settings from Supabase:', error);
    return null;
  }
}

/**
 * Saves settings to Supabase
 */
async function saveSettingsToSupabase(settings: UserSettings): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Map UserSettings to database columns
    const dbSettings = {
      user_id: user.id,
      language: settings.language,
      theme: settings.theme,
      daily_affirmation_enabled: settings.dailyAffirmationEnabled,
      daily_affirmation_time: settings.dailyAffirmationTime,
      daily_prompt_enabled: settings.dailyPromptEnabled,
      daily_prompt_time: settings.dailyPromptTime,
      require_auth_on_app_open: settings.requireAuthOnAppOpen,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_settings')
      .upsert(dbSettings, { onConflict: 'user_id' });

    if (error) throw error;

    // Update last sync time
    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Failed to save settings to Supabase:', error);
  }
}

/**
 * Syncs settings from Supabase (if cloud version is newer)
 */
async function syncSettingsFromSupabase(): Promise<void> {
  try {
    const localSettings = await getLocalSettings();
    const cloudSettings = await loadSettingsFromSupabase();

    if (!cloudSettings) return;

    // Compare timestamps
    const localUpdated = localSettings?.updatedAt
      ? new Date(localSettings.updatedAt).getTime()
      : 0;
    const cloudUpdated = cloudSettings.updatedAt
      ? new Date(cloudSettings.updatedAt).getTime()
      : 0;

    // If cloud is newer, update local
    if (cloudUpdated > localUpdated) {
      await saveSettingsLocally(cloudSettings);
    }
  } catch (error) {
    console.error('Failed to sync settings from Supabase:', error);
  }
}

/**
 * Gets settings from AsyncStorage only (no network call)
 */
async function getLocalSettings(): Promise<UserSettings | null> {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    return settingsJson ? JSON.parse(settingsJson) : null;
  } catch (error) {
    console.error('Failed to get local settings:', error);
    return null;
  }
}

/**
 * Resets settings to defaults
 */
export async function resetSettings(): Promise<void> {
  try {
    await saveSettings(DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Failed to reset settings:', error);
    throw error;
  }
}

// ============================================================================
// SPECIFIC SETTING GETTERS/SETTERS
// ============================================================================

export async function getLanguage(): Promise<LanguageType> {
  const settings = await getSettings();
  return settings.language;
}

export async function setLanguage(language: LanguageType): Promise<void> {
  await updateSetting('language', language);
}

export async function getTheme(): Promise<ThemeType> {
  const settings = await getSettings();
  return settings.theme;
}

export async function setTheme(theme: ThemeType): Promise<void> {
  await updateSetting('theme', theme);
}

export async function getStartScreen(): Promise<StartScreenType> {
  const settings = await getSettings();
  return settings.startScreen;
}

export async function setStartScreen(screen: StartScreenType): Promise<void> {
  await updateSetting('startScreen', screen);
}

export async function getDailyAffirmationEnabled(): Promise<boolean> {
  const settings = await getSettings();
  return settings.dailyAffirmationEnabled;
}

export async function setDailyAffirmationEnabled(enabled: boolean): Promise<void> {
  await updateSetting('dailyAffirmationEnabled', enabled);
}

export async function getDailyAffirmationTime(): Promise<string> {
  const settings = await getSettings();
  return settings.dailyAffirmationTime;
}

export async function setDailyAffirmationTime(time: string): Promise<void> {
  await updateSetting('dailyAffirmationTime', time);
}

export async function getDailyPromptEnabled(): Promise<boolean> {
  const settings = await getSettings();
  return settings.dailyPromptEnabled;
}

export async function setDailyPromptEnabled(enabled: boolean): Promise<void> {
  await updateSetting('dailyPromptEnabled', enabled);
}

export async function getRequireAuthOnAppOpen(): Promise<boolean> {
  const settings = await getSettings();
  return settings.requireAuthOnAppOpen;
}

export async function setRequireAuthOnAppOpen(required: boolean): Promise<void> {
  await updateSetting('requireAuthOnAppOpen', required);
}

export async function getSyncDataToCloud(): Promise<boolean> {
  const settings = await getSettings();
  return settings.syncDataToCloud;
}

export async function setSyncDataToCloud(enabled: boolean): Promise<void> {
  await updateSetting('syncDataToCloud', enabled);
}
