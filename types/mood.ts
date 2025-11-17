/**
 * Mood Check-In Types
 * For quick mood logging without full journal entries
 */

// Mood types matching the database enum
export type MoodType = 'calm' | 'happy' | 'anxious' | 'sad' | 'overwhelmed';

// Mood configuration with emoji and metadata
export interface MoodConfig {
  id: MoodType;
  emoji: string;
  label: string;
  color: string; // Warm, gentle color for each mood
  bgColor: string; // Background color when selected
}

// Local mood entry structure
export interface MoodEntry {
  id: string; // UUID generated locally
  userId: string;
  mood: MoodType;
  context?: string; // Optional note (max 200 chars)
  clientCreatedAt: string; // ISO 8601 timestamp
  isSynced: boolean;
}

// Last mood check-in info for UI display
export interface LastMoodCheckIn {
  mood: MoodType;
  emoji: string;
  timestamp: string;
  hoursAgo: number;
}
