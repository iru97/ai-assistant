/**
 * Enhanced ThemeProvider with NativeWind integration
 * Integrates with SettingsContext for theme persistence
 * Manages theme state and system theme detection
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { StatusBar } from 'react-native';
import { useColorScheme } from '~/hooks/useColorScheme';
import { applyColorScheme, resolveColorScheme, Theme, ColorScheme } from '~/utils/themeManager';
import { lightColors, darkColors } from './colors';

interface ThemeContextValue {
  // Legacy support for existing code
  dark: boolean;
  colors: typeof lightColors;
  setScheme: (scheme: string) => void;

  // New dark mode support
  theme: Theme;
  colorScheme: ColorScheme;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>({
  dark: false,
  colors: lightColors,
  setScheme: () => {},
  theme: 'auto',
  colorScheme: 'light',
  isDark: false,
});

interface ThemeProviderProps {
  children: ReactNode;
  themePreference?: Theme; // Can be passed from SettingsContext
}

export const ThemeProvider = ({ children, themePreference }: ThemeProviderProps) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(themePreference || 'auto');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');

  // Update theme when themePreference changes (from settings)
  useEffect(() => {
    if (themePreference) {
      setThemeState(themePreference);
    }
  }, [themePreference]);

  // Update color scheme when theme or system scheme changes
  useEffect(() => {
    const newScheme = resolveColorScheme(theme, systemScheme);
    setColorScheme(newScheme);
    applyColorScheme(newScheme);
  }, [theme, systemScheme]);

  // Update StatusBar style based on color scheme
  useEffect(() => {
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
  }, [colorScheme]);

  const isDark = colorScheme === 'dark';

  const value: ThemeContextValue = {
    // Legacy support
    dark: isDark,
    colors: isDark ? darkColors : lightColors,
    setScheme: (scheme: string) => {
      const themeMap: { [key: string]: Theme } = {
        light: 'light',
        dark: 'dark',
        auto: 'auto',
      };
      if (themeMap[scheme]) {
        setThemeState(themeMap[scheme]);
      }
    },

    // New dark mode support
    theme,
    colorScheme,
    isDark,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
