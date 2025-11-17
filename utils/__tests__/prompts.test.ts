/**
 * Prompt Utility Functions Tests
 *
 * Test suite for prompt utility functions
 */

import {
  getDailyPrompt,
  getRandomPrompt,
  getPromptById,
  getPromptsByCategory,
  getCategories,
  getCategoryDisplayName,
  getTotalPromptsCount,
  getCategoryPromptsCount,
  getPromptText,
} from '../prompts';

describe('Prompt Utilities', () => {
  describe('getDailyPrompt', () => {
    it('should return a valid prompt', () => {
      const prompt = getDailyPrompt('en');
      expect(prompt).toBeDefined();
      expect(prompt.id).toBeGreaterThan(0);
      expect(prompt.text_en).toBeDefined();
      expect(prompt.text_es).toBeDefined();
      expect(prompt.category).toBeDefined();
    });

    it('should return the same prompt for the same day', () => {
      const prompt1 = getDailyPrompt('en');
      const prompt2 = getDailyPrompt('en');
      expect(prompt1.id).toBe(prompt2.id);
    });

    it('should respect category filter', () => {
      const prompt = getDailyPrompt('en', 'gratitude');
      expect(prompt.category).toBe('gratitude');
    });

    it('should work with different languages', () => {
      const promptEn = getDailyPrompt('en');
      const promptEs = getDailyPrompt('es');
      expect(promptEn.id).toBe(promptEs.id); // Same prompt, different language
    });
  });

  describe('getRandomPrompt', () => {
    it('should return a valid prompt', () => {
      const prompt = getRandomPrompt('en');
      expect(prompt).toBeDefined();
      expect(prompt.id).toBeGreaterThan(0);
    });

    it('should return different prompt when excluding current', () => {
      const prompt1 = getRandomPrompt('en');
      const prompt2 = getRandomPrompt('en', undefined, prompt1.id);
      expect(prompt2.id).not.toBe(prompt1.id);
    });

    it('should respect category filter', () => {
      const prompt = getRandomPrompt('en', 'gratitude');
      expect(prompt.category).toBe('gratitude');
    });
  });

  describe('getPromptById', () => {
    it('should return the correct prompt by ID', () => {
      const prompt = getPromptById(1, 'en');
      expect(prompt).toBeDefined();
      expect(prompt?.id).toBe(1);
      expect(prompt?.category).toBe('gratitude');
    });

    it('should return null for invalid ID', () => {
      const prompt = getPromptById(9999, 'en');
      expect(prompt).toBeNull();
    });
  });

  describe('getPromptsByCategory', () => {
    it('should return prompts for gratitude category', () => {
      const prompts = getPromptsByCategory('gratitude', 'en');
      expect(prompts.length).toBe(20);
      prompts.forEach((prompt) => {
        expect(prompt.category).toBe('gratitude');
      });
    });

    it('should return prompts for self-compassion category', () => {
      const prompts = getPromptsByCategory('self-compassion', 'en');
      expect(prompts.length).toBe(25);
      prompts.forEach((prompt) => {
        expect(prompt.category).toBe('self-compassion');
      });
    });

    it('should return prompts for emotional-reflection category', () => {
      const prompts = getPromptsByCategory('emotional-reflection', 'en');
      expect(prompts.length).toBe(20);
    });

    it('should return prompts for progress-growth category', () => {
      const prompts = getPromptsByCategory('progress-growth', 'en');
      expect(prompts.length).toBe(15);
    });

    it('should return prompts for coping-resilience category', () => {
      const prompts = getPromptsByCategory('coping-resilience', 'en');
      expect(prompts.length).toBe(20);
    });
  });

  describe('getCategories', () => {
    it('should return all 5 categories', () => {
      const categories = getCategories();
      expect(categories).toHaveLength(5);
      expect(categories).toContain('gratitude');
      expect(categories).toContain('self-compassion');
      expect(categories).toContain('emotional-reflection');
      expect(categories).toContain('progress-growth');
      expect(categories).toContain('coping-resilience');
    });
  });

  describe('getCategoryDisplayName', () => {
    it('should return English category names', () => {
      expect(getCategoryDisplayName('gratitude', 'en')).toBe('Gratitude');
      expect(getCategoryDisplayName('self-compassion', 'en')).toBe('Self-Compassion');
      expect(getCategoryDisplayName('emotional-reflection', 'en')).toBe('Emotional Reflection');
      expect(getCategoryDisplayName('progress-growth', 'en')).toBe('Progress & Growth');
      expect(getCategoryDisplayName('coping-resilience', 'en')).toBe('Coping & Resilience');
    });

    it('should return Spanish category names', () => {
      expect(getCategoryDisplayName('gratitude', 'es')).toBe('Gratitud');
      expect(getCategoryDisplayName('self-compassion', 'es')).toBe('Autocompasión');
      expect(getCategoryDisplayName('emotional-reflection', 'es')).toBe('Reflexión Emocional');
      expect(getCategoryDisplayName('progress-growth', 'es')).toBe('Progreso y Crecimiento');
      expect(getCategoryDisplayName('coping-resilience', 'es')).toBe('Afrontamiento y Resiliencia');
    });
  });

  describe('getTotalPromptsCount', () => {
    it('should return 100 total prompts', () => {
      const count = getTotalPromptsCount();
      expect(count).toBe(100);
    });
  });

  describe('getCategoryPromptsCount', () => {
    it('should return correct counts for each category', () => {
      expect(getCategoryPromptsCount('gratitude')).toBe(20);
      expect(getCategoryPromptsCount('self-compassion')).toBe(25);
      expect(getCategoryPromptsCount('emotional-reflection')).toBe(20);
      expect(getCategoryPromptsCount('progress-growth')).toBe(15);
      expect(getCategoryPromptsCount('coping-resilience')).toBe(20);
    });
  });

  describe('getPromptText', () => {
    it('should return English text when language is en', () => {
      const prompt = getPromptById(1, 'en');
      if (prompt) {
        const text = getPromptText(prompt, 'en');
        expect(text).toBe(prompt.text_en);
      }
    });

    it('should return Spanish text when language is es', () => {
      const prompt = getPromptById(1, 'es');
      if (prompt) {
        const text = getPromptText(prompt, 'es');
        expect(text).toBe(prompt.text_es);
      }
    });

    it('should default to English text', () => {
      const prompt = getPromptById(1, 'en');
      if (prompt) {
        const text = getPromptText(prompt);
        expect(text).toBe(prompt.text_en);
      }
    });
  });
});
