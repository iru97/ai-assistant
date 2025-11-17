/**
 * Example Usage: Journal Entry Screen with Daily Prompts
 *
 * This file demonstrates how to integrate the prompt system
 * into a journal entry screen.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PromptCard } from '~/components/PromptCard';
import { COLORS } from '~/constants/theme';

export default function JournalEntryScreen() {
  const [journalEntry, setJournalEntry] = useState('');
  const [title, setTitle] = useState('');

  const handleUsePrompt = (promptText: string) => {
    // Insert the prompt text into the journal entry
    // You can customize this behavior (append, prepend, replace, etc.)
    if (journalEntry.trim() === '') {
      setJournalEntry(promptText + '\n\n');
    } else {
      setJournalEntry(journalEntry + '\n\n' + promptText + '\n\n');
    }
  };

  const handleSave = async () => {
    // Save journal entry to database
    console.log('Saving entry:', { title, entry: journalEntry });
    // TODO: Call your API/Supabase to save the entry
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Journal Entry</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Daily Prompt Card */}
          <PromptCard
            onUsePrompt={handleUsePrompt}
            showUseButton={true}
          />

          {/* Title Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title (optional)</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What's on your mind?"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={COLORS.secondaryGray}
            />
          </View>

          {/* Journal Entry Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your thoughts</Text>
            <TextInput
              style={styles.journalInput}
              placeholder="Start writing..."
              value={journalEntry}
              onChangeText={setJournalEntry}
              multiline
              textAlignVertical="top"
              placeholderTextColor={COLORS.secondaryGray}
            />
          </View>

          {/* Helper text */}
          <Text style={styles.helperText}>
            Tap the prompt above to add it to your journal, or shuffle for a different one.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  journalInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.black,
    minHeight: 300,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  helperText: {
    fontSize: 13,
    color: COLORS.secondaryGray,
    textAlign: 'center',
    marginTop: 8,
  },
});

// =============================================================================
// EXAMPLE 2: Home Screen with Compact Prompt
// =============================================================================

export function HomeScreenExample() {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={{ padding: 16 }}>
        <Text style={styles.headerTitle}>Welcome Back!</Text>

        {/* Compact prompt for inspiration */}
        <PromptCard compact={true} />

        {/* Rest of home screen content */}
        <Text>Your recent entries...</Text>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// EXAMPLE 3: Settings Screen with Prompt Preferences
// =============================================================================

import { usePrompt } from '~/hooks/usePrompt';
import { getCategories, getCategoryDisplayName } from '~/utils/prompts';

export function PromptSettingsExample() {
  const {
    language,
    categoryFilter,
    promptsEnabled,
    setLanguage,
    setCategoryFilter,
    setPromptsEnabled,
  } = usePrompt();

  const categories = getCategories();

  return (
    <ScrollView style={styles.scrollView}>
      <View style={{ padding: 16 }}>
        <Text style={styles.headerTitle}>Prompt Settings</Text>

        {/* Enable/Disable Prompts */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Daily Prompts</Text>
          <TouchableOpacity
            onPress={() => setPromptsEnabled(!promptsEnabled)}
            style={[
              styles.toggle,
              promptsEnabled && styles.toggleActive,
            ]}
          >
            <Text style={styles.toggleText}>
              {promptsEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Language Selection */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Language</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              onPress={() => setLanguage('en')}
              style={[
                styles.langButton,
                language === 'en' && styles.langButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.langButtonText,
                  language === 'en' && styles.langButtonTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLanguage('es')}
              style={[
                styles.langButton,
                language === 'es' && styles.langButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.langButtonText,
                  language === 'es' && styles.langButtonTextActive,
                ]}
              >
                Español
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Category Filter</Text>
          <Text style={styles.settingDescription}>
            Choose a category to only see prompts from that category
          </Text>

          <TouchableOpacity
            onPress={() => setCategoryFilter(undefined)}
            style={[
              styles.categoryButton,
              !categoryFilter && styles.categoryButtonActive,
            ]}
          >
            <Text
              style={[
                styles.categoryButtonText,
                !categoryFilter && styles.categoryButtonTextActive,
              ]}
            >
              All Categories
            </Text>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setCategoryFilter(category)}
              style={[
                styles.categoryButton,
                categoryFilter === category && styles.categoryButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  categoryFilter === category && styles.categoryButtonTextActive,
                ]}
              >
                {getCategoryDisplayName(category, language)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const settingsStyles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingSection: {
    paddingVertical: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.secondaryGray,
    marginBottom: 12,
  },
  toggle: {
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  langButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: COLORS.white,
  },
  langButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  langButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  langButtonTextActive: {
    color: COLORS.white,
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#F0F9FF',
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.black,
  },
  categoryButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
