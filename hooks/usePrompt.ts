/**
 * usePrompt Hook
 *
 * React hook for managing daily prompts and user prompt preferences.
 * Provides access to the daily prompt, current prompt, and methods to
 * shuffle or reset prompts.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDailyPrompt,
  getRandomPrompt,
  getPromptText,
} from '../utils/prompts';
import type { Prompt, Language, PromptCategory } from '../types/prompts';

const STORAGE_KEYS = {
  LANGUAGE: '@prompt_language',
  CATEGORY_FILTER: '@prompt_category_filter',
  PROMPTS_ENABLED: '@prompts_enabled',
  CURRENT_PROMPT_ID: '@current_prompt_id',
  CURRENT_PROMPT_DATE: '@current_prompt_date',
};

export interface UsePromptOptions {
  language?: Language;
  categoryFilter?: PromptCategory;
  enabled?: boolean;
}

export interface UsePromptReturn {
  dailyPrompt: Prompt | null;
  currentPrompt: Prompt | null;
  promptText: string;
  shufflePrompt: () => void;
  resetToDaily: () => void;
  isDaily: boolean;
  loading: boolean;
  language: Language;
  categoryFilter?: PromptCategory;
  promptsEnabled: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  setCategoryFilter: (category?: PromptCategory) => Promise<void>;
  setPromptsEnabled: (enabled: boolean) => Promise<void>;
}

/**
 * Custom hook for managing prompts
 */
export function usePrompt(options?: UsePromptOptions): UsePromptReturn {
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>(options?.language || 'en');
  const [categoryFilter, setCategoryFilterState] = useState<PromptCategory | undefined>(
    options?.categoryFilter
  );
  const [promptsEnabled, setPromptsEnabledState] = useState<boolean>(
    options?.enabled !== undefined ? options.enabled : true
  );
  const [dailyPrompt, setDailyPrompt] = useState<Prompt | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [isDaily, setIsDaily] = useState(true);

  /**
   * Load preferences from AsyncStorage
   */
  const loadPreferences = useCallback(async () => {
    try {
      const [storedLanguage, storedCategory, storedEnabled] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_FILTER),
        AsyncStorage.getItem(STORAGE_KEYS.PROMPTS_ENABLED),
      ]);

      if (storedLanguage) {
        setLanguageState(storedLanguage as Language);
      }
      if (storedCategory && storedCategory !== 'null') {
        setCategoryFilterState(storedCategory as PromptCategory);
      }
      if (storedEnabled !== null) {
        setPromptsEnabledState(storedEnabled === 'true');
      }
    } catch (error) {
      console.error('Error loading prompt preferences:', error);
    }
  }, []);

  /**
   * Load or refresh the daily prompt
   */
  const loadDailyPrompt = useCallback(() => {
    const prompt = getDailyPrompt(language, categoryFilter);
    setDailyPrompt(prompt);
    return prompt;
  }, [language, categoryFilter]);

  /**
   * Check if we need to reset to daily prompt (new day)
   */
  const checkAndResetDaily = useCallback(async () => {
    try {
      const today = new Date().toDateString();
      const storedDate = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_PROMPT_DATE);

      if (storedDate !== today) {
        // New day - reset to daily prompt
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_PROMPT_DATE, today);
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_PROMPT_ID);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking daily reset:', error);
      return false;
    }
  }, []);

  /**
   * Initialize prompts
   */
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        // Load user preferences
        await loadPreferences();

        // Check if we need to reset to daily
        const shouldReset = await checkAndResetDaily();

        // Load daily prompt
        const daily = loadDailyPrompt();

        // Check if there's a saved current prompt
        const savedPromptId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_PROMPT_ID);

        if (savedPromptId && !shouldReset) {
          // User had shuffled - restore their shuffled prompt
          const promptId = parseInt(savedPromptId, 10);
          const savedPrompt = daily.id === promptId ? daily : getRandomPrompt(language, categoryFilter, daily.id);
          setCurrentPrompt(savedPrompt);
          setIsDaily(savedPrompt.id === daily.id);
        } else {
          // Use daily prompt
          setCurrentPrompt(daily);
          setIsDaily(true);
        }
      } catch (error) {
        console.error('Error initializing prompts:', error);
        // Fallback to daily prompt
        const daily = loadDailyPrompt();
        setCurrentPrompt(daily);
        setIsDaily(true);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [loadPreferences, loadDailyPrompt, checkAndResetDaily, language, categoryFilter]);

  /**
   * Shuffle to get a different prompt
   */
  const shufflePrompt = useCallback(async () => {
    if (!currentPrompt || !dailyPrompt) return;

    const newPrompt = getRandomPrompt(language, categoryFilter, currentPrompt.id);
    setCurrentPrompt(newPrompt);
    setIsDaily(newPrompt.id === dailyPrompt.id);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_PROMPT_ID, newPrompt.id.toString());
    } catch (error) {
      console.error('Error saving shuffled prompt:', error);
    }
  }, [currentPrompt, dailyPrompt, language, categoryFilter]);

  /**
   * Reset to the daily prompt
   */
  const resetToDaily = useCallback(async () => {
    if (!dailyPrompt) return;

    setCurrentPrompt(dailyPrompt);
    setIsDaily(true);

    // Clear saved prompt
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_PROMPT_ID);
    } catch (error) {
      console.error('Error resetting to daily prompt:', error);
    }
  }, [dailyPrompt]);

  /**
   * Update language preference
   */
  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      // Reload prompts with new language
      const daily = getDailyPrompt(lang, categoryFilter);
      setDailyPrompt(daily);
      setCurrentPrompt(daily);
      setIsDaily(true);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }, [categoryFilter]);

  /**
   * Update category filter preference
   */
  const setCategoryFilter = useCallback(async (category?: PromptCategory) => {
    setCategoryFilterState(category);
    try {
      if (category) {
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORY_FILTER, category);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CATEGORY_FILTER);
      }
      // Reload prompts with new filter
      const daily = getDailyPrompt(language, category);
      setDailyPrompt(daily);
      setCurrentPrompt(daily);
      setIsDaily(true);
    } catch (error) {
      console.error('Error saving category filter:', error);
    }
  }, [language]);

  /**
   * Update prompts enabled preference
   */
  const setPromptsEnabled = useCallback(async (enabled: boolean) => {
    setPromptsEnabledState(enabled);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROMPTS_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Error saving prompts enabled preference:', error);
    }
  }, []);

  // Get the text for the current prompt in the user's language
  const promptText = currentPrompt ? getPromptText(currentPrompt, language) : '';

  return {
    dailyPrompt,
    currentPrompt,
    promptText,
    shufflePrompt,
    resetToDaily,
    isDaily,
    loading,
    language,
    categoryFilter,
    promptsEnabled,
    setLanguage,
    setCategoryFilter,
    setPromptsEnabled,
  };
}
