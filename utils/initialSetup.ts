import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// AsyncStorage keys for user preferences
export const LANGUAGE_KEY = '@journal_safe/language';
export const AFFIRMATIONS_ENABLED_KEY = '@journal_safe/affirmations_enabled';
export const AFFIRMATION_TIME_KEY = '@journal_safe/affirmation_time';
export const NOTIFICATIONS_ENABLED_KEY = '@journal_safe/notifications_enabled';

export type Language = 'en' | 'es';

export interface UserPreferences {
  language: Language;
  affirmationsEnabled: boolean;
  affirmationTime?: string; // Format: "HH:MM" (24-hour)
  notificationsEnabled: boolean;
}

/**
 * Save user's language preference
 */
export async function saveLanguagePreference(language: Language): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    console.log('Language preference saved:', language);
  } catch (error) {
    console.error('Failed to save language preference:', error);
    throw error;
  }
}

/**
 * Get user's language preference
 */
export async function getLanguagePreference(): Promise<Language> {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_KEY);
    return (language as Language) || 'en'; // Default to English
  } catch (error) {
    console.error('Failed to get language preference:', error);
    return 'en';
  }
}

/**
 * Save affirmation settings
 */
export async function saveAffirmationSettings(
  enabled: boolean,
  time?: string
): Promise<void> {
  try {
    await AsyncStorage.setItem(AFFIRMATIONS_ENABLED_KEY, JSON.stringify(enabled));
    if (time) {
      await AsyncStorage.setItem(AFFIRMATION_TIME_KEY, time);
    }
    console.log('Affirmation settings saved:', { enabled, time });
  } catch (error) {
    console.error('Failed to save affirmation settings:', error);
    throw error;
  }
}

/**
 * Get affirmation settings
 */
export async function getAffirmationSettings(): Promise<{
  enabled: boolean;
  time?: string;
}> {
  try {
    const enabledJson = await AsyncStorage.getItem(AFFIRMATIONS_ENABLED_KEY);
    const enabled = enabledJson ? JSON.parse(enabledJson) : false;
    const time = await AsyncStorage.getItem(AFFIRMATION_TIME_KEY);
    return { enabled, time: time || undefined };
  } catch (error) {
    console.error('Failed to get affirmation settings:', error);
    return { enabled: false };
  }
}

/**
 * Request notification permissions
 * @returns Promise<boolean> - true if granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const granted = finalStatus === 'granted';
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, JSON.stringify(granted));

    console.log('Notification permission:', granted);
    return granted;
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const enabledJson = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return enabledJson ? JSON.parse(enabledJson) : false;
  } catch (error) {
    console.error('Failed to check notification status:', error);
    return false;
  }
}

/**
 * Save all user preferences at once (during onboarding)
 */
export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  try {
    await saveLanguagePreference(preferences.language);
    await saveAffirmationSettings(
      preferences.affirmationsEnabled,
      preferences.affirmationTime
    );
    await AsyncStorage.setItem(
      NOTIFICATIONS_ENABLED_KEY,
      JSON.stringify(preferences.notificationsEnabled)
    );
    console.log('All user preferences saved:', preferences);
  } catch (error) {
    console.error('Failed to save user preferences:', error);
    throw error;
  }
}

/**
 * Get all user preferences
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const language = await getLanguagePreference();
    const { enabled, time } = await getAffirmationSettings();
    const notificationsEnabled = await areNotificationsEnabled();

    return {
      language,
      affirmationsEnabled: enabled,
      affirmationTime: time,
      notificationsEnabled,
    };
  } catch (error) {
    console.error('Failed to get user preferences:', error);
    return {
      language: 'en',
      affirmationsEnabled: false,
      notificationsEnabled: false,
    };
  }
}
