/**
 * Prompt System Types
 *
 * Defines TypeScript interfaces for the daily prompt system
 */

export type PromptCategory =
  | 'gratitude'
  | 'self-compassion'
  | 'emotional-reflection'
  | 'progress-growth'
  | 'coping-resilience';

export type Language = 'en' | 'es';

export interface Prompt {
  id: string; // UUID from database
  category: PromptCategory;
  text_en: string;
  text_es: string;
}

export interface PromptsData {
  prompts: Prompt[];
}

export interface PromptPreferences {
  language: Language;
  categoryFilter?: PromptCategory;
  promptsEnabled: boolean;
}

export interface DailyPromptState {
  dailyPrompt: Prompt | null;
  currentPrompt: Prompt | null;
  isDaily: boolean;
  loading: boolean;
}
