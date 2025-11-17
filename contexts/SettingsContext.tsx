/**
 * Journal Safe MVP - Settings Context
 * Provides global settings state and update functions
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '~/types/settings';
import {
  getSettings,
  updateSettings as updateSettingsManager,
  updateSetting as updateSettingManager,
  resetSettings as resetSettingsManager,
} from '~/utils/settingsManager';
import {
  scheduleDailyAffirmation,
  cancelDailyAffirmation,
} from '~/utils/notifications';

interface SettingsContextValue {
  settings: UserSettings;
  isLoading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  updateSetting: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => Promise<void>;
  resetSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * Settings Provider Component
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Handle notification scheduling when affirmation settings change
  useEffect(() => {
    if (isLoading) {
      // Don't schedule notifications during initial load
      return;
    }

    const handleNotificationScheduling = async () => {
      try {
        if (settings.dailyAffirmationEnabled) {
          // Schedule notification at the specified time
          console.log(`Scheduling daily affirmation at ${settings.dailyAffirmationTime}`);
          await scheduleDailyAffirmation(settings.dailyAffirmationTime);
        } else {
          // Cancel any scheduled notifications
          console.log('Cancelling daily affirmation notifications');
          await cancelDailyAffirmation();
        }
      } catch (error) {
        console.error('Failed to update notification scheduling:', error);
      }
    };

    handleNotificationScheduling();
  }, [settings.dailyAffirmationEnabled, settings.dailyAffirmationTime, isLoading]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      await updateSettingsManager(updates);

      // Update local state
      setSettings((prev) => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    try {
      await updateSettingManager(key, value);

      // Update local state
      setSettings((prev) => ({
        ...prev,
        [key]: value,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to update setting:', error);
      throw error;
    }
  };

  const resetSettings = async () => {
    try {
      await resetSettingsManager();
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const value: SettingsContextValue = {
    settings,
    isLoading,
    updateSettings,
    updateSetting,
    resetSettings,
    refreshSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Hook to use Settings Context
 */
export function useSettings() {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
}
