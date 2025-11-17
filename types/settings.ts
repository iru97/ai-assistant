/**
 * Journal Safe MVP - Settings TypeScript Types
 * Defines interfaces for user settings and preferences
 */

/**
 * Language options
 */
export type LanguageType = 'en' | 'es';

/**
 * Theme options
 */
export type ThemeType = 'light' | 'dark' | 'auto';

/**
 * Start screen options
 */
export type StartScreenType = 'journal' | 'mood' | 'affirmations';

/**
 * Default mood options
 */
export type DefaultMoodType = 'none' | 'last_used';

/**
 * Auto-save interval options (in seconds)
 */
export type AutoSaveInterval = 30 | 60 | 120;

/**
 * Photo quality options
 */
export type PhotoQuality = 'high' | 'medium' | 'low';

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'pdf';

/**
 * User settings interface (matches database schema + local settings)
 */
export interface UserSettings {
  // Profile
  displayName?: string;
  email?: string;
  avatarUrl?: string;

  // Preferences
  language: LanguageType;
  theme: ThemeType;
  startScreen: StartScreenType;

  // Journaling
  defaultMood: DefaultMoodType;
  autoSaveInterval: AutoSaveInterval;
  photoQuality: PhotoQuality;
  promptCategoryFilter: string[]; // Empty array = all categories

  // Affirmations
  dailyAffirmationEnabled: boolean;
  dailyAffirmationTime: string; // HH:mm format (e.g., "08:00")
  affirmationThemeFilter: string[]; // Empty array = all themes

  // Notifications
  dailyPromptEnabled: boolean;
  dailyPromptTime: string; // HH:mm format (e.g., "09:00")
  moodRemindersEnabled: boolean;
  syncNotificationsEnabled: boolean;

  // Privacy & Security
  requireAuthOnAppOpen: boolean;
  syncDataToCloud: boolean;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: UserSettings = {
  // Preferences
  language: 'en',
  theme: 'auto',
  startScreen: 'journal',

  // Journaling
  defaultMood: 'none',
  autoSaveInterval: 60,
  photoQuality: 'medium',
  promptCategoryFilter: [],

  // Affirmations
  dailyAffirmationEnabled: true,
  dailyAffirmationTime: '08:00',
  affirmationThemeFilter: [],

  // Notifications
  dailyPromptEnabled: true,
  dailyPromptTime: '09:00',
  moodRemindersEnabled: false,
  syncNotificationsEnabled: true,

  // Privacy & Security
  requireAuthOnAppOpen: false,
  syncDataToCloud: true,
};

/**
 * Settings section identifiers
 */
export type SettingsSectionId =
  | 'profile'
  | 'preferences'
  | 'journaling'
  | 'affirmations'
  | 'notifications'
  | 'privacy'
  | 'data'
  | 'support'
  | 'account';

/**
 * Picker option interface
 */
export interface PickerOption<T = string> {
  label: string;
  value: T;
}

/**
 * Storage usage information
 */
export interface StorageUsage {
  entryCount: number;
  photoCount: number;
  totalBytes: number;
  formattedSize: string;
}

/**
 * Confirmation dialog types
 */
export type ConfirmationType =
  | 'clear_local_data'
  | 'delete_all_data'
  | 'sign_out'
  | 'delete_account';
