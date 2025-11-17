/**
 * Prompt Utility Functions
 *
 * Provides functions to get daily prompts, random prompts, and filter prompts
 * by category. Uses a deterministic algorithm seeded by date for consistent
 * daily prompts.
 *
 * Data is loaded from Supabase database with fallback to local JSON files.
 * Prompts are cached in memory to avoid repeated database calls.
 */

import { supabase } from './supabase';
import type { Prompt, PromptCategory, Language } from '../types/prompts';

// Memory cache for prompts
let promptsCache: Prompt[] | null = null;
let isLoading = false;
let loadPromise: Promise<Prompt[]> | null = null;

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
 * Fetch prompts from Supabase database
 * Maps database schema to TypeScript interface
 */
async function fetchPromptsFromSupabase(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('is_active', true)
    .order('id');

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error('No prompts found in database');
  }

  // Map database fields to TypeScript types
  // Database has 'prompt_text' column (single language for now)
  // We map it to both text_en and text_es until i18n is implemented
  return data.map((row) => ({
    id: row.id,
    category: row.category as PromptCategory,
    text_en: row.prompt_text || '',
    text_es: row.prompt_text || '', // TODO: Add prompt_text_es column for i18n
  }));
}

/**
 * Load prompts from Supabase with fallback to JSON
 * Implements caching to avoid repeated database calls
 */
async function loadPrompts(): Promise<Prompt[]> {
  // Return cached data if available
  if (promptsCache) {
    return promptsCache;
  }

  // If already loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Start loading
  isLoading = true;
  loadPromise = (async () => {
    try {
      // Try to fetch from Supabase
      const prompts = await fetchPromptsFromSupabase();
      promptsCache = prompts;
      return prompts;
    } catch (error) {
      console.warn('Failed to load prompts from Supabase, using JSON fallback:', error);

      // Fallback to JSON file
      try {
        const promptsData = await import('../content/prompts.json');
        promptsCache = promptsData.prompts;
        return promptsCache;
      } catch (jsonError) {
        console.error('Failed to load prompts from JSON:', jsonError);
        throw new Error('Failed to load prompts from both Supabase and JSON');
      }
    } finally {
      isLoading = false;
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * Refresh prompts from Supabase (clears cache and reloads)
 * Useful for manual refresh or after database updates
 */
export async function refreshPrompts(): Promise<Prompt[]> {
  promptsCache = null;
  return loadPrompts();
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
export async function getDailyPrompt(
  language: Language = 'en',
  category?: PromptCategory
): Promise<Prompt> {
  const allPrompts = await loadPrompts();
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
export async function getRandomPrompt(
  language: Language = 'en',
  category?: PromptCategory,
  excludeId?: number
): Promise<Prompt> {
  const allPrompts = await loadPrompts();
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
 * @returns The prompt with the specified ID, or null if not found
 */
export async function getPromptById(id: number, language: Language = 'en'): Promise<Prompt | null> {
  const allPrompts = await loadPrompts();
  return allPrompts.find((p) => p.id === id) || null;
}

/**
 * Get all prompts for a specific category
 *
 * @param category - The category to filter by
 * @param language - User's preferred language (not used in selection, just for consistency)
 * @returns Array of prompts in the specified category
 */
export async function getPromptsByCategory(
  category: PromptCategory,
  language: Language = 'en'
): Promise<Prompt[]> {
  const allPrompts = await loadPrompts();
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
export async function getTotalPromptsCount(): Promise<number> {
  const allPrompts = await loadPrompts();
  return allPrompts.length;
}

/**
 * Get count of prompts in a category
 */
export async function getCategoryPromptsCount(category: PromptCategory): Promise<number> {
  const allPrompts = await loadPrompts();
  return filterByCategory(allPrompts, category).length;
}
