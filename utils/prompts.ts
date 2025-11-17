/**
 * Prompt Utility Functions
 *
 * Provides functions to get daily prompts, random prompts, and filter prompts
 * by category. Uses a deterministic algorithm seeded by date for consistent
 * daily prompts.
 */

import promptsData from '../content/prompts.json';
import type { Prompt, PromptCategory, Language } from '../types/prompts';

const allPrompts: Prompt[] = promptsData.prompts;

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
 * Filter prompts by category
 */
function filterByCategory(prompts: Prompt[], category?: PromptCategory): Prompt[] {
  if (!category) return prompts;
  return prompts.filter((prompt) => prompt.category === category);
}

/**
 * Get the text for a prompt in the specified language
 */
export function getPromptText(prompt: Prompt, language: Language = 'en'): string {
  return language === 'es' ? prompt.text_es : prompt.text_en;
}

/**
 * Get the daily prompt (deterministic based on date)
 * Same prompt is returned all day, changes at midnight
 *
 * @param language - User's preferred language ('en' or 'es')
 * @param category - Optional category filter
 * @returns The daily prompt
 */
export function getDailyPrompt(
  language: Language = 'en',
  category?: PromptCategory
): Prompt {
  const availablePrompts = filterByCategory(allPrompts, category);

  if (availablePrompts.length === 0) {
    // Fallback to all prompts if category filter yields no results
    return getDailyPrompt(language, undefined);
  }

  const seed = getDateSeed();
  const index = Math.floor(seededRandom(seed) * availablePrompts.length);

  return availablePrompts[index];
}

/**
 * Get a random prompt (different from current/excluded prompt)
 *
 * @param language - User's preferred language ('en' or 'es')
 * @param category - Optional category filter
 * @param excludeId - ID of prompt to exclude (usually current prompt)
 * @returns A random prompt
 */
export function getRandomPrompt(
  language: Language = 'en',
  category?: PromptCategory,
  excludeId?: number
): Prompt {
  let availablePrompts = filterByCategory(allPrompts, category);

  // Exclude the current prompt if provided
  if (excludeId !== undefined) {
    availablePrompts = availablePrompts.filter((p) => p.id !== excludeId);
  }

  if (availablePrompts.length === 0) {
    // Fallback to all prompts if filtering yields no results
    return getRandomPrompt(language, undefined, excludeId);
  }

  // Use current timestamp as seed for randomness
  const randomIndex = Math.floor(Math.random() * availablePrompts.length);
  return availablePrompts[randomIndex];
}

/**
 * Get a specific prompt by ID
 *
 * @param id - The prompt ID
 * @param language - User's preferred language (not used in selection, just for consistency)
 * @returns The prompt with the specified ID, or the first prompt if not found
 */
export function getPromptById(id: number, language: Language = 'en'): Prompt | null {
  return allPrompts.find((p) => p.id === id) || null;
}

/**
 * Get all prompts for a specific category
 *
 * @param category - The category to filter by
 * @param language - User's preferred language (not used in selection, just for consistency)
 * @returns Array of prompts in the specified category
 */
export function getPromptsByCategory(
  category: PromptCategory,
  language: Language = 'en'
): Prompt[] {
  return filterByCategory(allPrompts, category);
}

/**
 * Get all available categories
 */
export function getCategories(): PromptCategory[] {
  return ['gratitude', 'self-compassion', 'emotional-reflection', 'progress-growth', 'coping-resilience'];
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: PromptCategory, language: Language = 'en'): string {
  const categoryNames: Record<PromptCategory, { en: string; es: string }> = {
    gratitude: { en: 'Gratitude', es: 'Gratitud' },
    'self-compassion': { en: 'Self-Compassion', es: 'Autocompasión' },
    'emotional-reflection': { en: 'Emotional Reflection', es: 'Reflexión Emocional' },
    'progress-growth': { en: 'Progress & Growth', es: 'Progreso y Crecimiento' },
    'coping-resilience': { en: 'Coping & Resilience', es: 'Afrontamiento y Resiliencia' },
  };

  return categoryNames[category][language];
}

/**
 * Get total count of prompts
 */
export function getTotalPromptsCount(): number {
  return allPrompts.length;
}

/**
 * Get count of prompts in a category
 */
export function getCategoryPromptsCount(category: PromptCategory): number {
  return filterByCategory(allPrompts, category).length;
}
