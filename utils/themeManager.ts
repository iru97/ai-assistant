/**
 * Theme Manager
 *
 * Manages theme persistence and application for dark mode support
 * Integrates with AsyncStorage for persistence and NativeWind for styling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';

export type Theme = 'light' | 'dark' | 'auto';
export type ColorScheme = 'light' | 'dark';

const THEME_STORAGE_KEY = '@journalsafe:theme';

/**
 * Get saved theme preference from AsyncStorage
 * @returns Theme preference or 'auto' if not set
 */
export async function getSavedTheme(): Promise<Theme> {
  try {
    const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
      return savedTheme;
    }
    return 'auto';
  } catch (error) {
    console.error('Failed to load theme preference:', error);
    return 'auto';
  }
}

/**
 * Save theme preference to AsyncStorage
 * @param theme - Theme to save
 */
export async function saveTheme(theme: Theme): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme preference:', error);
    throw error;
  }
}

/**
 * Apply color scheme to NativeWind
 * This sets the dark class on the root element
 * @param scheme - Color scheme to apply ('light' or 'dark')
 */
export function applyColorScheme(scheme: ColorScheme): void {
  try {
    colorScheme.set(scheme);
  } catch (error) {
    console.error('Failed to apply color scheme:', error);
  }
}

/**
 * Determine the actual color scheme based on theme preference and system scheme
 * @param theme - User's theme preference ('light', 'dark', or 'auto')
 * @param systemScheme - System color scheme ('light', 'dark', or null)
 * @returns Actual color scheme to apply ('light' or 'dark')
 */
export function resolveColorScheme(
  theme: Theme,
  systemScheme: 'light' | 'dark' | null
): ColorScheme {
  if (theme === 'auto') {
    // Follow system preference, default to light if system scheme is null
    return systemScheme || 'light';
  }
  return theme;
}

/**
 * Initialize theme on app start
 * @param systemScheme - Current system color scheme
 * @returns Resolved theme and color scheme
 */
export async function initializeTheme(
  systemScheme: 'light' | 'dark' | null
): Promise<{ theme: Theme; colorScheme: ColorScheme }> {
  const theme = await getSavedTheme();
  const colorScheme = resolveColorScheme(theme, systemScheme);
  applyColorScheme(colorScheme);

  return { theme, colorScheme };
}

/**
 * Update theme preference and apply it
 * @param theme - New theme preference
 * @param systemScheme - Current system color scheme
 * @returns Resolved color scheme
 */
export async function updateTheme(
  theme: Theme,
  systemScheme: 'light' | 'dark' | null
): Promise<ColorScheme> {
  await saveTheme(theme);
  const colorScheme = resolveColorScheme(theme, systemScheme);
  applyColorScheme(colorScheme);
  return colorScheme;
}
