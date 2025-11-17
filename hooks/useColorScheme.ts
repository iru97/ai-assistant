/**
 * useColorScheme Hook
 *
 * Wrapper around React Native's useColorScheme that returns the system color scheme
 * Returns 'light' | 'dark' | null
 * Updates when system theme changes
 */

import { useColorScheme as useRNColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark' | null;

/**
 * Hook to detect system color scheme
 * @returns 'light' | 'dark' | null (null if not determined)
 */
export function useColorScheme(): ColorScheme {
  return useRNColorScheme();
}
