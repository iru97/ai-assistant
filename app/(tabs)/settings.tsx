/**
 * Journal Safe MVP - Settings Screen
 * Comprehensive settings screen with all user preferences
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '~/providers/AuthProvider';
import { supabase } from '~/utils/supabase';
import { useSettings } from '~/contexts/SettingsContext';
import {
  SettingsSection,
  SettingToggle,
  SettingButton,
  SettingPicker,
} from '~/components/settings';
import { PickerOption, LanguageType, ThemeType, StartScreenType } from '~/types/settings';
import {
  getStorageUsage,
  clearLocalData,
  deleteAllData,
  deleteAccount,
  StorageUsage,
} from '~/utils/dataManagement';
import { exportEntries } from '~/utils/exportData';

export default function SettingsPage() {
  const { user } = useAuth();
  const { settings, updateSetting, isLoading } = useSettings();
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);

  // Load storage usage
  useEffect(() => {
    loadStorageUsage();
  }, []);

  const loadStorageUsage = async () => {
    try {
      const usage = await getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Failed to load storage usage:', error);
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Unsynced data will remain on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Error', `Failed to sign out: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  // Clear local data handler
  const handleClearLocalData = () => {
    Alert.alert(
      'Clear Local Data?',
      'This will delete all journal entries and photos stored on this device. Cloud data will remain safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearLocalData();
              await loadStorageUsage();
              Alert.alert('Success', 'Local data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear local data');
            }
          },
        },
      ]
    );
  };

  // Delete all data handler
  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data?',
      'This action CANNOT be undone. All your journal entries, photos, and data will be permanently deleted from both this device and the cloud.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            if (Platform.OS === 'ios') {
              Alert.prompt(
                'Type DELETE to confirm',
                'This is your last chance to cancel.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async (text) => {
                      if (text === 'DELETE') {
                        try {
                          await deleteAllData();
                          await loadStorageUsage();
                          Alert.alert('Success', 'All data has been deleted');
                        } catch (error) {
                          Alert.alert('Error', 'Failed to delete data');
                        }
                      } else {
                        Alert.alert('Cancelled', 'You must type DELETE to confirm');
                      }
                    },
                  },
                ],
                'plain-text'
              );
            } else {
              // Android doesn't support Alert.prompt
              Alert.alert(
                'Final Confirmation',
                'Are you absolutely sure you want to delete all your data? This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete Forever',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await deleteAllData();
                        await loadStorageUsage();
                        Alert.alert('Success', 'All data has been deleted');
                      } catch (error) {
                        Alert.alert('Error', 'Failed to delete data');
                      }
                    },
                  },
                ]
              );
            }
          },
        },
      ]
    );
  };

  // Delete account handler
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account Permanently?',
      'This action CANNOT be undone. Your account and all data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            if (Platform.OS === 'ios') {
              Alert.prompt(
                'Type DELETE to confirm',
                'This will permanently delete your account and all data.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async (text) => {
                      if (text === 'DELETE') {
                        try {
                          await deleteAccount();
                          Alert.alert('Account Deleted', 'Your account has been deleted');
                        } catch (error) {
                          Alert.alert('Error', 'Failed to delete account');
                        }
                      } else {
                        Alert.alert('Cancelled', 'You must type DELETE to confirm');
                      }
                    },
                  },
                ],
                'plain-text'
              );
            } else {
              // Android fallback
              Alert.alert(
                'Final Confirmation',
                'Are you absolutely sure? Your account and all data will be permanently deleted.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete Forever',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await deleteAccount();
                        Alert.alert('Account Deleted', 'Your account has been deleted');
                      } catch (error) {
                        Alert.alert('Error', 'Failed to delete account');
                      }
                    },
                  },
                ]
              );
            }
          },
        },
      ]
    );
  };

  // Export data handler
  const handleExport = () => {
    Alert.alert('Export Journal', 'Choose export format:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'JSON',
        onPress: async () => {
          try {
            await exportEntries('json');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to export');
          }
        },
      },
      {
        text: 'Text/PDF',
        onPress: async () => {
          try {
            await exportEntries('pdf');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to export');
          }
        },
      },
    ]);
  };

  // Open external links
  const openPrivacyPolicy = () => {
    Linking.openURL('https://yourapp.com/privacy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://yourapp.com/terms');
  };

  const openCrisisResources = () => {
    // Navigate to help tab (implement navigation as needed)
    Alert.alert('Crisis Resources', 'Navigate to Help tab for crisis resources');
  };

  const sendFeedback = () => {
    Linking.openURL('mailto:support@journalsafe.com?subject=Feedback');
  };

  const rateApp = () => {
    // Open app store link
    const storeUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/idYOUR_APP_ID'
      : 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME';
    Linking.openURL(storeUrl);
  };

  // Picker options
  const languageOptions: PickerOption<LanguageType>[] = [
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
  ];

  const themeOptions: PickerOption<ThemeType>[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'auto' },
  ];

  const startScreenOptions: PickerOption<StartScreenType>[] = [
    { label: 'Journal', value: 'journal' },
    { label: 'Mood', value: 'mood' },
    { label: 'Affirmations', value: 'affirmations' },
  ];

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.message}>Please sign in to access settings</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView>
        {/* Profile Section */}
        <View style={styles.profile}>
          <Image
            alt="Profile"
            source={{
              uri:
                settings.avatarUrl ||
                'https://e7.pngegg.com/pngimages/81/570/png-clipart-profile-logo-computer-icons-user-user-blue-heroes.png',
            }}
            style={styles.profileAvatar}
          />
          <Text style={styles.profileName}>
            {settings.displayName || user.email || 'User'}
          </Text>
          {user.email && <Text style={styles.profileEmail}>{user.email}</Text>}
        </View>

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <SettingPicker
            label="Language"
            value={settings.language}
            options={languageOptions}
            onChange={(value) => updateSetting('language', value)}
            icon="globe"
            iconBackgroundColor="#fe9400"
            isFirst
          />
          <SettingPicker
            label="Theme"
            value={settings.theme}
            options={themeOptions}
            onChange={(value) => updateSetting('theme', value)}
            icon="moon"
            iconBackgroundColor="#007AFF"
          />
          <SettingPicker
            label="Start Screen"
            value={settings.startScreen}
            options={startScreenOptions}
            onChange={(value) => updateSetting('startScreen', value)}
            icon="home"
            iconBackgroundColor="#10A37F"
          />
        </SettingsSection>

        {/* Affirmations Section */}
        <SettingsSection title="Affirmations">
          <SettingToggle
            label="Daily Affirmations"
            value={settings.dailyAffirmationEnabled}
            onChange={(value) => updateSetting('dailyAffirmationEnabled', value)}
            icon="heart"
            iconBackgroundColor="#FF69B4"
            isFirst
          />
          <SettingButton
            label="Notification Time"
            value={settings.dailyAffirmationTime}
            onPress={() => {
              Alert.alert('Time Picker', 'Time picker coming soon');
            }}
            icon="clock"
            iconBackgroundColor="#FF69B4"
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingToggle
            label="Daily Prompts"
            value={settings.dailyPromptEnabled}
            onChange={(value) => updateSetting('dailyPromptEnabled', value)}
            icon="bell"
            iconBackgroundColor="#38C959"
            isFirst
          />
          <SettingButton
            label="Prompt Time"
            value={settings.dailyPromptTime}
            onPress={() => {
              Alert.alert('Time Picker', 'Time picker coming soon');
            }}
            icon="clock"
            iconBackgroundColor="#38C959"
          />
          <SettingToggle
            label="Sync Notifications"
            value={settings.syncNotificationsEnabled}
            onChange={(value) => updateSetting('syncNotificationsEnabled', value)}
            icon="cloud"
            iconBackgroundColor="#38C959"
          />
        </SettingsSection>

        {/* Privacy & Security Section */}
        <SettingsSection title="Privacy & Security">
          <SettingToggle
            label="Require Auth on App Open"
            value={settings.requireAuthOnAppOpen}
            onChange={(value) => updateSetting('requireAuthOnAppOpen', value)}
            icon="lock"
            iconBackgroundColor="#FE3C30"
            isFirst
          />
          <SettingToggle
            label="Sync Data to Cloud"
            value={settings.syncDataToCloud}
            onChange={(value) => updateSetting('syncDataToCloud', value)}
            icon="cloud"
            iconBackgroundColor="#007AFF"
          />
          <SettingButton
            label="Privacy Policy"
            onPress={openPrivacyPolicy}
            icon="shield"
            iconBackgroundColor="#666"
          />
          <SettingButton
            label="Terms of Service"
            onPress={openTermsOfService}
            icon="file-text"
            iconBackgroundColor="#666"
          />
        </SettingsSection>

        {/* Data Management Section */}
        <SettingsSection title="Data Management">
          <SettingButton
            label="Export Journal Entries"
            onPress={handleExport}
            icon="download"
            iconBackgroundColor="#10A37F"
            isFirst
          />
          <SettingButton
            label="Storage Usage"
            value={
              storageUsage
                ? `${storageUsage.entryCount} entries, ${storageUsage.formattedSize}`
                : 'Loading...'
            }
            onPress={loadStorageUsage}
            icon="database"
            iconBackgroundColor="#007AFF"
          />
          <SettingButton
            label="Clear Local Data"
            onPress={handleClearLocalData}
            icon="trash-2"
            iconBackgroundColor="#FF9500"
            destructive
          />
          <SettingButton
            label="Delete All Data"
            onPress={handleDeleteAllData}
            icon="alert-triangle"
            iconBackgroundColor="#FF3B30"
            destructive
          />
        </SettingsSection>

        {/* Support & Help Section */}
        <SettingsSection title="Support & Help">
          <SettingButton
            label="Crisis Resources"
            onPress={openCrisisResources}
            icon="life-buoy"
            iconBackgroundColor="#FF3B30"
            isFirst
          />
          <SettingButton
            label="Send Feedback"
            onPress={sendFeedback}
            icon="mail"
            iconBackgroundColor="#007AFF"
          />
          <SettingButton
            label="Rate the App"
            onPress={rateApp}
            icon="star"
            iconBackgroundColor="#FF9500"
          />
          <SettingButton
            label="Version"
            value="1.0.0"
            onPress={() => {}}
            icon="info"
            iconBackgroundColor="#666"
          />
        </SettingsSection>

        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingButton
            label="Logged in as"
            value={user.email || 'User'}
            onPress={() => {}}
            icon="user"
            iconBackgroundColor="#007AFF"
            isFirst
          />
          <SettingButton
            label="Sign Out"
            onPress={handleSignOut}
            icon="log-out"
            iconBackgroundColor="#FF9500"
            destructive
          />
          <SettingButton
            label="Delete Account"
            onPress={handleDeleteAccount}
            icon="x-circle"
            iconBackgroundColor="#FF3B30"
            destructive
          />
        </SettingsSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Journal Safe - A safe space for your thoughts
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
  },
  profile: {
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e3e3e3',
    marginBottom: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#090909',
  },
  profileEmail: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '400',
    color: '#848484',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#929292',
    textAlign: 'center',
  },
});
