/**
 * PromptCard Component
 *
 * Displays the daily/current prompt with shuffle functionality
 * and category badge. Can be used in journal entry or home screen.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePrompt } from '../hooks/usePrompt';
import { getCategoryDisplayName } from '../utils/prompts';
import { COLORS } from '../constants/theme';
import type { Language } from '../types/prompts';

export interface PromptCardProps {
  /** Callback when "Use this prompt" is pressed */
  onUsePrompt?: (promptText: string) => void;
  /** Show the "Use this prompt" button */
  showUseButton?: boolean;
  /** Custom language override (defaults to hook's language) */
  language?: Language;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

export function PromptCard({
  onUsePrompt,
  showUseButton = false,
  compact = false,
}: PromptCardProps) {
  const {
    currentPrompt,
    promptText,
    shufflePrompt,
    resetToDaily,
    isDaily,
    loading,
    language,
    promptsEnabled,
  } = usePrompt();

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          {language === 'es' ? 'Cargando prompt...' : 'Loading prompt...'}
        </Text>
      </View>
    );
  }

  if (!promptsEnabled || !currentPrompt) {
    return null;
  }

  const handleUsePrompt = () => {
    if (onUsePrompt && promptText) {
      onUsePrompt(promptText);
    }
  };

  const categoryName = getCategoryDisplayName(currentPrompt.category, language);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Header with category and shuffle button */}
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoryName}</Text>
        </View>
        <View style={styles.actions}>
          {!isDaily && (
            <TouchableOpacity onPress={resetToDaily} style={styles.iconButton}>
              <Feather name="refresh-cw" size={18} color={COLORS.secondaryGray} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={shufflePrompt} style={styles.iconButton}>
            <Feather name="shuffle" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily indicator */}
      {isDaily && (
        <View style={styles.dailyIndicator}>
          <Feather name="sun" size={14} color="#FFA500" />
          <Text style={styles.dailyText}>
            {language === 'es' ? 'Prompt del día' : 'Daily Prompt'}
          </Text>
        </View>
      )}

      {/* Prompt text */}
      <Text style={[styles.promptText, compact && styles.promptTextCompact]}>
        {promptText}
      </Text>

      {/* Use prompt button */}
      {showUseButton && onUsePrompt && (
        <TouchableOpacity onPress={handleUsePrompt} style={styles.useButton}>
          <Text style={styles.useButtonText}>
            {language === 'es' ? 'Usar este prompt' : 'Use this prompt'}
          </Text>
          <Feather name="arrow-right" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  containerCompact: {
    padding: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.secondaryGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F7F7F8',
  },
  dailyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  dailyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFA500',
  },
  promptText: {
    fontSize: 18,
    lineHeight: 26,
    color: COLORS.black,
    fontWeight: '500',
    marginBottom: 12,
  },
  promptTextCompact: {
    fontSize: 16,
    lineHeight: 22,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  useButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
