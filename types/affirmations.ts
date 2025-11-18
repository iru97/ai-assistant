/**
 * Affirmation System Types
 *
 * Defines TypeScript interfaces for the daily affirmations system
 */

export type AffirmationTheme =
  | 'unconditional_self_worth'
  | 'recovery_is_non_linear'
  | 'body_acceptance'
  | 'nourishment_and_self_care'
  | 'strength_and_resilience';

export type Language = 'en' | 'es';

export interface Affirmation {
  id: string; // UUID from database
  theme: AffirmationTheme;
  text_en: string;
  text_es: string;
}

export interface AffirmationsData {
  affirmations: Affirmation[];
}

export interface AffirmationPreferences {
  enabled: boolean;
  notificationTime: string; // Format: "HH:mm" (e.g., "09:00")
  language: Language;
  themeFilter?: AffirmationTheme;
}

export interface DailyAffirmationState {
  dailyAffirmation: Affirmation | null;
  currentAffirmation: Affirmation | null;
  isDaily: boolean;
  loading: boolean;
}

export interface AffirmationHistory {
  date: string; // ISO date string
  affirmationId: string; // UUID from database
  isFavorite?: boolean;
}
