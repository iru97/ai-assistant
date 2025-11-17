/**
 * Affirmation Settings Storage
 *
 * Manages user preferences for affirmations using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AffirmationPreferences, AffirmationTheme, Language } from '../types/affirmations';

const STORAGE_KEY = '@journal_safe:affirmation_preferences';

/**
 * Default affirmation preferences
 */
const DEFAULT_PREFERENCES: AffirmationPreferences = {
  enabled: true,
  notificationTime: '09:00', // 9 AM default
  language: 'en',
  themeFilter: undefined, // Show all themes by default
};

/**
 * Get affirmation preferences from storage
 */
export async function getAffirmationPreferences(): Promise<AffirmationPreferences> {
  try {
    const storedPreferences = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedPreferences) {
      const parsed = JSON.parse(storedPreferences);
      // Merge with defaults to ensure all fields exist
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error loading affirmation preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save affirmation preferences to storage
 */
export async function saveAffirmationPreferences(
  preferences: AffirmationPreferences
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving affirmation preferences:', error);
    throw error;
  }
}

/**
 * Update specific preference fields
 */
export async function updateAffirmationPreferences(
  updates: Partial<AffirmationPreferences>
): Promise<AffirmationPreferences> {
  const currentPreferences = await getAffirmationPreferences();
  const newPreferences = { ...currentPreferences, ...updates };
  await saveAffirmationPreferences(newPreferences);
  return newPreferences;
}

/**
 * Enable or disable daily affirmations
 */
export async function setAffirmationsEnabled(enabled: boolean): Promise<void> {
  await updateAffirmationPreferences({ enabled });
}

/**
 * Set notification time (24-hour format: "HH:mm")
 */
export async function setNotificationTime(time: string): Promise<void> {
  // Validate time format
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    throw new Error('Invalid time format. Use HH:mm (24-hour format)');
  }
  await updateAffirmationPreferences({ notificationTime: time });
}

/**
 * Set language preference
 */
export async function setLanguage(language: Language): Promise<void> {
  await updateAffirmationPreferences({ language });
}

/**
 * Set theme filter
 */
export async function setThemeFilter(theme?: AffirmationTheme): Promise<void> {
  await updateAffirmationPreferences({ themeFilter: theme });
}

/**
 * Reset preferences to defaults
 */
export async function resetAffirmationPreferences(): Promise<void> {
  await saveAffirmationPreferences(DEFAULT_PREFERENCES);
}

/**
 * Parse time string to hours and minutes
 */
export function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

/**
 * Format time object to string
 */
export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}
