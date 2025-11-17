/**
 * Affirmation Utility Functions
 *
 * Provides functions to get daily affirmations, random affirmations, and filter affirmations
 * by theme. Uses a deterministic algorithm seeded by date for consistent daily affirmations.
 */

import affirmationsData from '../content/affirmations.json';
import type { Affirmation, AffirmationTheme, Language } from '../types/affirmations';

const allAffirmations: Affirmation[] = affirmationsData.affirmations;

/**
 * Get the day of year (1-365/366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Create a deterministic seed based on the current date
 */
function getDateSeed(date: Date = new Date()): number {
  const year = date.getFullYear();
  const dayOfYear = getDayOfYear(date);
  return year * 1000 + dayOfYear;
}

/**
 * Seeded random number generator (Linear Congruential Generator)
 * Returns a number between 0 and 1
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Filter affirmations by theme
 */
function filterByTheme(affirmations: Affirmation[], theme?: AffirmationTheme): Affirmation[] {
  if (!theme) return affirmations;
  return affirmations.filter((affirmation) => affirmation.theme === theme);
}

/**
 * Get the text for an affirmation in the specified language
 */
export function getAffirmationText(affirmation: Affirmation, language: Language = 'en'): string {
  return language === 'es' ? affirmation.text_es : affirmation.text_en;
}

/**
 * Get the daily affirmation (deterministic based on date)
 * Same affirmation is returned all day, changes at midnight
 *
 * @param language - User's preferred language ('en' or 'es')
 * @param theme - Optional theme filter
 * @returns The daily affirmation
 */
export function getDailyAffirmation(
  language: Language = 'en',
  theme?: AffirmationTheme
): Affirmation {
  const availableAffirmations = filterByTheme(allAffirmations, theme);

  if (availableAffirmations.length === 0) {
    // Fallback to all affirmations if theme filter yields no results
    return getDailyAffirmation(language, undefined);
  }

  const seed = getDateSeed();
  const index = Math.floor(seededRandom(seed) * availableAffirmations.length);

  return availableAffirmations[index];
}

/**
 * Get a random affirmation (different from current/excluded affirmation)
 *
 * @param language - User's preferred language ('en' or 'es')
 * @param theme - Optional theme filter
 * @param excludeId - ID of affirmation to exclude (usually current affirmation)
 * @returns A random affirmation
 */
export function getRandomAffirmation(
  language: Language = 'en',
  theme?: AffirmationTheme,
  excludeId?: number
): Affirmation {
  let availableAffirmations = filterByTheme(allAffirmations, theme);

  // Exclude the current affirmation if provided
  if (excludeId !== undefined) {
    availableAffirmations = availableAffirmations.filter((a) => a.id !== excludeId);
  }

  if (availableAffirmations.length === 0) {
    // Fallback to all affirmations if filtering yields no results
    return getRandomAffirmation(language, undefined, excludeId);
  }

  // Use current timestamp as seed for randomness
  const randomIndex = Math.floor(Math.random() * availableAffirmations.length);
  return availableAffirmations[randomIndex];
}

/**
 * Get a specific affirmation by ID
 *
 * @param id - The affirmation ID
 * @param language - User's preferred language (not used in selection, just for consistency)
 * @returns The affirmation with the specified ID, or null if not found
 */
export function getAffirmationById(id: number, language: Language = 'en'): Affirmation | null {
  return allAffirmations.find((a) => a.id === id) || null;
}

/**
 * Get all affirmations for a specific theme
 *
 * @param theme - The theme to filter by
 * @param language - User's preferred language (not used in selection, just for consistency)
 * @returns Array of affirmations in the specified theme
 */
export function getAffirmationsByTheme(
  theme: AffirmationTheme,
  language: Language = 'en'
): Affirmation[] {
  return filterByTheme(allAffirmations, theme);
}

/**
 * Get all available themes
 */
export function getThemes(): AffirmationTheme[] {
  return [
    'unconditional_self_worth',
    'recovery_is_non_linear',
    'body_acceptance',
    'nourishment_and_self_care',
    'strength_and_resilience',
  ];
}

/**
 * Get theme display name
 */
export function getThemeDisplayName(theme: AffirmationTheme, language: Language = 'en'): string {
  const themeNames: Record<AffirmationTheme, { en: string; es: string }> = {
    unconditional_self_worth: { en: 'Self-Worth', es: 'Autoestima' },
    recovery_is_non_linear: { en: 'Recovery Journey', es: 'Camino de Recuperación' },
    body_acceptance: { en: 'Body Acceptance', es: 'Aceptación Corporal' },
    nourishment_and_self_care: { en: 'Self-Care', es: 'Autocuidado' },
    strength_and_resilience: { en: 'Strength & Resilience', es: 'Fuerza y Resiliencia' },
  };

  return themeNames[theme][language];
}

/**
 * Get total count of affirmations
 */
export function getTotalAffirmationsCount(): number {
  return allAffirmations.length;
}

/**
 * Get count of affirmations in a theme
 */
export function getThemeAffirmationsCount(theme: AffirmationTheme): number {
  return filterByTheme(allAffirmations, theme).length;
}

/**
 * Get affirmations for the last N days
 *
 * @param days - Number of days to get affirmations for (default: 7)
 * @param language - User's preferred language
 * @param theme - Optional theme filter
 * @returns Array of affirmations with their dates
 */
export function getAffirmationsHistory(
  days: number = 7,
  language: Language = 'en',
  theme?: AffirmationTheme
): Array<{ date: Date; affirmation: Affirmation }> {
  const history: Array<{ date: Date; affirmation: Affirmation }> = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Get the affirmation for this specific date
    const availableAffirmations = filterByTheme(allAffirmations, theme);
    if (availableAffirmations.length > 0) {
      const seed = getDateSeed(date);
      const index = Math.floor(seededRandom(seed) * availableAffirmations.length);
      history.push({
        date,
        affirmation: availableAffirmations[index],
      });
    }
  }

  return history;
}
