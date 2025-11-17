import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { MOOD_OPTIONS } from '~/constants/moods';
import { MoodType, LastMoodCheckIn } from '~/types/mood';
import { saveMoodCheckIn, getLastMoodCheckIn } from '~/utils/moodStorage';
import { useAuth } from '~/providers/AuthProvider';

export default function MoodCheckInScreen() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastMood, setLastMood] = useState<LastMoodCheckIn | null>(null);

  // Load last mood check-in on mount
  useEffect(() => {
    loadLastMood();
  }, []);

  async function loadLastMood() {
    const last = await getLastMoodCheckIn();
    setLastMood(last);
  }

  async function handleLogMood() {
    if (!selectedMood) {
      Alert.alert('Select a mood', 'Please select how you\'re feeling');
      return;
    }

    if (!user) {
      Alert.alert('Not logged in', 'Please log in to save your mood');
      return;
    }

    setIsLoading(true);

    try {
      // Save mood check-in
      await saveMoodCheckIn(user.id, selectedMood, context);

      // Show success message
      Alert.alert(
        'Mood logged ✓',
        'Thanks for checking in with yourself',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setSelectedMood(null);
              setContext('');
              loadLastMood();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood. It will be saved locally and synced later.');
      console.error('Failed to log mood:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function formatLastMoodTime(hoursAgo: number): string {
    if (hoursAgo === 0) return 'Just now';
    if (hoursAgo === 1) return '1 hour ago';
    if (hoursAgo < 24) return `${hoursAgo} hours ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo === 1) return '1 day ago';
    return `${daysAgo} days ago`;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Mood Check-In' }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>How are you feeling?</Text>
            <Text style={styles.subtitle}>
              Take a moment to check in with yourself
            </Text>
          </View>

          {/* Last mood check-in */}
          {lastMood && (
            <View style={styles.lastMoodContainer}>
              <Text style={styles.lastMoodText}>
                Last check-in: {formatLastMoodTime(lastMood.hoursAgo)} - {lastMood.emoji}{' '}
                {MOOD_OPTIONS.find((m) => m.id === lastMood.mood)?.label}
              </Text>
            </View>
          )}

          {/* Mood buttons */}
          <View style={styles.moodsContainer}>
            {MOOD_OPTIONS.map((moodConfig) => {
              const isSelected = selectedMood === moodConfig.id;
              return (
                <TouchableOpacity
                  key={moodConfig.id}
                  style={[
                    styles.moodButton,
                    isSelected && {
                      backgroundColor: moodConfig.bgColor,
                      borderColor: moodConfig.color,
                      borderWidth: 3,
                    },
                  ]}
                  onPress={() => setSelectedMood(moodConfig.id)}
                  activeOpacity={0.7}>
                  <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      isSelected && { color: moodConfig.color, fontWeight: '700' },
                    ]}>
                    {moodConfig.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Optional context input */}
          <View style={styles.contextContainer}>
            <Text style={styles.contextLabel}>What's happening? (optional)</Text>
            <TextInput
              style={styles.contextInput}
              placeholder="Optional - add a quick note"
              placeholderTextColor="#999"
              value={context}
              onChangeText={setContext}
              maxLength={200}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{context.length}/200</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.logButton, !selectedMood && styles.logButtonDisabled]}
              onPress={handleLogMood}
              disabled={!selectedMood || isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.logButtonText}>Log Mood</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Encouragement message */}
          <View style={styles.encouragementContainer}>
            <Text style={styles.encouragementText}>
              Your feelings are valid. Thank you for checking in with yourself ❤️
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  lastMoodContainer: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4E8F7',
  },
  lastMoodText: {
    fontSize: 14,
    color: '#4A6C85',
    textAlign: 'center',
  },
  moodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  moodButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  contextContainer: {
    marginBottom: 24,
  },
  contextLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  contextInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  logButton: {
    backgroundColor: '#6B9AC4',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logButtonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  logButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  encouragementContainer: {
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  encouragementText: {
    fontSize: 14,
    color: '#C17676',
    textAlign: 'center',
    lineHeight: 20,
  },
});
