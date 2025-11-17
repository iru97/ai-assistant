/**
 * Affirmations Screen
 *
 * Displays daily affirmations with a beautiful, uplifting UI.
 * Features:
 * - Today's affirmation (large, centered)
 * - New affirmation button (shuffle)
 * - History of recent affirmations
 * - Settings (enable/disable, time, language, theme filter)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Platform,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getDailyAffirmation,
  getRandomAffirmation,
  getAffirmationText,
  getThemeDisplayName,
  getAffirmationsHistory,
  getThemes,
} from '~/utils/affirmations';
import {
  getAffirmationPreferences,
  updateAffirmationPreferences,
  parseTime,
  formatTime,
} from '~/utils/affirmationSettings';
import {
  requestNotificationPermissions,
  scheduleDailyAffirmation,
  cancelDailyAffirmation,
  rescheduleDailyAffirmation,
  sendTestNotification,
} from '~/utils/notifications';
import type { Affirmation, AffirmationPreferences, AffirmationTheme } from '~/types/affirmations';

export default function AffirmationsScreen() {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation | null>(null);
  const [dailyAffirmation, setDailyAffirmation] = useState<Affirmation | null>(null);
  const [isDaily, setIsDaily] = useState(true);
  const [preferences, setPreferences] = useState<AffirmationPreferences>({
    enabled: true,
    notificationTime: '09:00',
    language: 'en',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());
  const [history, setHistory] = useState<Array<{ date: Date; affirmation: Affirmation }>>([]);

  // Load preferences and affirmations on mount
  useEffect(() => {
    loadPreferences();
    loadAffirmations();
  }, []);

  // Reload affirmations when preferences change
  useEffect(() => {
    loadAffirmations();
  }, [preferences.language, preferences.themeFilter]);

  const loadPreferences = async () => {
    const prefs = await getAffirmationPreferences();
    setPreferences(prefs);

    // Set up temp time for time picker
    const { hour, minute } = parseTime(prefs.notificationTime);
    const time = new Date();
    time.setHours(hour, minute, 0, 0);
    setTempTime(time);
  };

  const loadAffirmations = async () => {
    const prefs = await getAffirmationPreferences();
    const daily = await getDailyAffirmation(prefs.language, prefs.themeFilter);
    setDailyAffirmation(daily);
    setCurrentAffirmation(daily);
    setIsDaily(true);

    // Load history
    const affirmationHistory = await getAffirmationsHistory(7, prefs.language, prefs.themeFilter);
    setHistory(affirmationHistory);
  };

  const handleNewAffirmation = async () => {
    const random = await getRandomAffirmation(
      preferences.language,
      preferences.themeFilter,
      currentAffirmation?.id
    );
    setCurrentAffirmation(random);
    setIsDaily(false);
  };

  const handleResetToDaily = () => {
    setCurrentAffirmation(dailyAffirmation);
    setIsDaily(true);
  };

  const handleToggleEnabled = async (value: boolean) => {
    const newPrefs = await updateAffirmationPreferences({ enabled: value });
    setPreferences(newPrefs);

    if (value) {
      // Request permissions and schedule
      const { granted } = await requestNotificationPermissions();
      if (granted) {
        await scheduleDailyAffirmation(newPrefs.notificationTime);
        Alert.alert(
          'Notifications Enabled',
          `You'll receive your daily affirmation at ${newPrefs.notificationTime}`
        );
      } else {
        // Revert if permissions not granted
        await updateAffirmationPreferences({ enabled: false });
        setPreferences({ ...newPrefs, enabled: false });
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily affirmations.'
        );
      }
    } else {
      // Disable notifications
      await cancelDailyAffirmation();
      Alert.alert('Notifications Disabled', "You won't receive daily affirmation reminders.");
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      setTempTime(selectedDate);
      if (Platform.OS === 'android') {
        // On Android, immediately save the time
        saveTime(selectedDate);
      }
    }
  };

  const saveTime = async (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timeString = formatTime(hour, minute);

    const newPrefs = await updateAffirmationPreferences({ notificationTime: timeString });
    setPreferences(newPrefs);

    if (newPrefs.enabled) {
      await rescheduleDailyAffirmation(timeString);
      Alert.alert('Time Updated', `Your daily affirmation will arrive at ${timeString}`);
    }

    setShowTimePicker(false);
  };

  const handleShareAffirmation = async () => {
    if (!currentAffirmation) return;

    const text = getAffirmationText(currentAffirmation, preferences.language);
    try {
      await Share.share({
        message: text,
      });
    } catch (error) {
      console.error('Error sharing affirmation:', error);
    }
  };

  const handleThemeFilterChange = async (theme?: AffirmationTheme) => {
    const newPrefs = await updateAffirmationPreferences({ themeFilter: theme });
    setPreferences(newPrefs);
  };

  const handleLanguageChange = async (language: 'en' | 'es') => {
    const newPrefs = await updateAffirmationPreferences({ language });
    setPreferences(newPrefs);
  };

  if (!currentAffirmation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading affirmations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const affirmationText = getAffirmationText(currentAffirmation, preferences.language);
  const themeDisplayName = getThemeDisplayName(currentAffirmation.theme, preferences.language);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Affirmations</Text>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.settingsButton}>
            <Feather name="settings" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Main Affirmation Card */}
        <View style={styles.affirmationCard}>
          <View style={styles.themeBadge}>
            <MaterialCommunityIcons name="heart" size={16} color="#7c3aed" />
            <Text style={styles.themeBadgeText}>{themeDisplayName}</Text>
          </View>

          <Text style={styles.affirmationText}>{affirmationText}</Text>

          {!isDaily && (
            <TouchableOpacity onPress={handleResetToDaily} style={styles.resetButton}>
              <Feather name="rotate-ccw" size={16} color="#7c3aed" />
              <Text style={styles.resetButtonText}>Back to today's affirmation</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleNewAffirmation} style={styles.primaryButton}>
            <MaterialCommunityIcons name="shuffle-variant" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>New Affirmation</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShareAffirmation} style={styles.secondaryButton}>
            <Feather name="share-2" size={20} color="#7c3aed" />
          </TouchableOpacity>
        </View>

        {/* History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Affirmations</Text>
          {history.slice(1).map((item, index) => {
            const text = getAffirmationText(item.affirmation, preferences.language);
            const theme = getThemeDisplayName(item.affirmation.theme, preferences.language);
            const dateStr = item.date.toLocaleDateString(preferences.language === 'es' ? 'es' : 'en', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <View key={index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{dateStr}</Text>
                  <View style={styles.historyThemeBadge}>
                    <Text style={styles.historyThemeText}>{theme}</Text>
                  </View>
                </View>
                <Text style={styles.historyText} numberOfLines={2}>
                  {text}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Affirmation Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Enable/Disable */}
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Daily Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive a reminder to read your affirmation
                </Text>
              </View>
              <Switch
                value={preferences.enabled}
                onValueChange={handleToggleEnabled}
                trackColor={{ false: '#ccc', true: '#a78bfa' }}
                thumbColor={preferences.enabled ? '#7c3aed' : '#f4f3f4'}
              />
            </View>

            {/* Time Picker */}
            <TouchableOpacity
              style={[styles.settingRow, !preferences.enabled && styles.settingRowDisabled]}
              onPress={() => preferences.enabled && setShowTimePicker(true)}
              disabled={!preferences.enabled}>
              <View>
                <Text style={[styles.settingLabel, !preferences.enabled && styles.settingLabelDisabled]}>
                  Notification Time
                </Text>
                <Text style={styles.settingDescription}>{preferences.notificationTime}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>

            {showTimePicker && (
              <View style={styles.timePickerContainer}>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    onPress={() => saveTime(tempTime)}
                    style={styles.timePickerSaveButton}>
                    <Text style={styles.timePickerSaveText}>Save</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Language */}
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Language</Text>
                <Text style={styles.settingDescription}>
                  {preferences.language === 'en' ? 'English' : 'Español'}
                </Text>
              </View>
              <View style={styles.languageButtons}>
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    preferences.language === 'en' && styles.languageButtonActive,
                  ]}
                  onPress={() => handleLanguageChange('en')}>
                  <Text
                    style={[
                      styles.languageButtonText,
                      preferences.language === 'en' && styles.languageButtonTextActive,
                    ]}>
                    EN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    preferences.language === 'es' && styles.languageButtonActive,
                  ]}
                  onPress={() => handleLanguageChange('es')}>
                  <Text
                    style={[
                      styles.languageButtonText,
                      preferences.language === 'es' && styles.languageButtonTextActive,
                    ]}>
                    ES
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Theme Filter */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Theme Filter</Text>
              <Text style={styles.settingDescription}>
                Show affirmations from specific themes (optional)
              </Text>

              <TouchableOpacity
                style={[
                  styles.themeFilterButton,
                  !preferences.themeFilter && styles.themeFilterButtonActive,
                ]}
                onPress={() => handleThemeFilterChange(undefined)}>
                <Text
                  style={[
                    styles.themeFilterText,
                    !preferences.themeFilter && styles.themeFilterTextActive,
                  ]}>
                  All Themes
                </Text>
              </TouchableOpacity>

              {getThemes().map((theme) => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.themeFilterButton,
                    preferences.themeFilter === theme && styles.themeFilterButtonActive,
                  ]}
                  onPress={() => handleThemeFilterChange(theme)}>
                  <Text
                    style={[
                      styles.themeFilterText,
                      preferences.themeFilter === theme && styles.themeFilterTextActive,
                    ]}>
                    {getThemeDisplayName(theme, preferences.language)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Test Notification Button (for development) */}
            {__DEV__ && (
              <TouchableOpacity
                style={styles.testButton}
                onPress={sendTestNotification}>
                <Text style={styles.testButtonText}>Send Test Notification</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  settingsButton: {
    padding: 8,
  },
  affirmationCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  themeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  themeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
    marginLeft: 6,
  },
  affirmationText: {
    fontSize: 22,
    lineHeight: 32,
    color: '#1f2937',
    textAlign: 'center',
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#7c3aed',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  historySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  historyThemeBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyThemeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
  },
  historyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingLabelDisabled: {
    color: '#9ca3af',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  languageButtonActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  themeFilterButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 8,
  },
  themeFilterButtonActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  themeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  themeFilterTextActive: {
    color: '#fff',
  },
  timePickerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
  },
  timePickerSaveButton: {
    marginTop: 16,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  timePickerSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  testButton: {
    margin: 16,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
