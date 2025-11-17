import { MoodConfig, MoodType } from '~/types/mood';

/**
 * Mood configurations with warm, gentle colors
 * Designed to be non-judgmental and supportive
 */
export const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  calm: {
    id: 'calm',
    emoji: '😌',
    label: 'Calm',
    color: '#6B9AC4', // Soft blue
    bgColor: '#E8F1F8',
  },
  happy: {
    id: 'happy',
    emoji: '😊',
    label: 'Happy',
    color: '#F4A261', // Warm orange
    bgColor: '#FFF4EC',
  },
  anxious: {
    id: 'anxious',
    emoji: '😰',
    label: 'Anxious',
    color: '#8B7FA8', // Gentle purple
    bgColor: '#F0EDF5',
  },
  sad: {
    id: 'sad',
    emoji: '😢',
    label: 'Sad',
    color: '#7C9EB5', // Muted blue
    bgColor: '#EBF2F7',
  },
  overwhelmed: {
    id: 'overwhelmed',
    emoji: '😵',
    label: 'Overwhelmed',
    color: '#C17676', // Soft red
    bgColor: '#F9EEEE',
  },
};

// Array of moods in display order
export const MOOD_OPTIONS: MoodConfig[] = [
  MOOD_CONFIGS.calm,
  MOOD_CONFIGS.happy,
  MOOD_CONFIGS.anxious,
  MOOD_CONFIGS.sad,
  MOOD_CONFIGS.overwhelmed,
];
