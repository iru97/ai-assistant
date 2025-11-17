import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';

import { useAuth } from '~/providers/AuthProvider';
import { MoodType, JournalPrompt } from '~/types/journal';
import { saveJournalEntryLocally } from '~/utils/journalStorage';

// Import prompts
import promptsData from '~/content/prompts.json';

export default function NewJournalEntry() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [currentPrompt, setCurrentPrompt] = useState<JournalPrompt | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-save draft every 30 seconds
  const autoSaveDraft = () => {
    if (content.trim()) {
      // Save draft to AsyncStorage
      const draft = { title, content, mood, photoUri };
      // Note: In production, implement proper draft saving
      console.log('Auto-saving draft...', draft);
    }
  };

  useEffect(() => {
    // Set up auto-save timer
    const timer = setInterval(autoSaveDraft, 30000); // 30 seconds
    setAutoSaveTimer(timer);

    // Load a random prompt on mount
    loadRandomPrompt();

    // Cleanup
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [content, title, mood, photoUri]);

  const loadRandomPrompt = () => {
    const prompts = promptsData.prompts;
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setCurrentPrompt(prompts[randomIndex]);
  };

  const handleMoodSelect = (selectedMood: MoodType) => {
    setMood(mood === selectedMood ? undefined : selectedMood);
  };

  const handlePickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setPhotoUri(undefined) },
    ]);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Content Required', 'Please write something before saving.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to save your entry.');
      return;
    }

    try {
      setIsSaving(true);

      // Save locally first (offline-first approach)
      await saveJournalEntryLocally(user.id, content.trim(), title.trim() || undefined, mood, photoUri);

      // Show success message
      Alert.alert('Entry Saved', 'Your journal entry has been saved and will sync when online.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() || title.trim()) {
      Alert.alert('Discard Entry', 'Are you sure you want to discard this entry?', [
        { text: 'Keep Writing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const moods: { type: MoodType; emoji: string; label: string; color: string }[] = [
    { type: 'calm', emoji: '😌', label: 'Calm', color: '#7dd3fc' },
    { type: 'happy', emoji: '😊', label: 'Happy', color: '#fcd34d' },
    { type: 'anxious', emoji: '😰', label: 'Anxious', color: '#fca5a5' },
    { type: 'sad', emoji: '😢', label: 'Sad', color: '#a5b4fc' },
    { type: 'overwhelmed', emoji: '😵', label: 'Overwhelmed', color: '#d8b4fe' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Entry</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.headerButton, styles.saveButton]}
              disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Daily Prompt */}
            {currentPrompt && (
              <View style={styles.promptCard}>
                <View style={styles.promptHeader}>
                  <Ionicons name="bulb-outline" size={20} color="#7c3aed" />
                  <Text style={styles.promptLabel}>Today's Prompt</Text>
                  <TouchableOpacity onPress={loadRandomPrompt} style={styles.shuffleButton}>
                    <Feather name="refresh-cw" size={16} color="#7c3aed" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.promptText}>{currentPrompt.text_en}</Text>
              </View>
            )}

            {/* Title Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.titleInput}
                placeholder="Title (optional)"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            {/* Content Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.contentInput}
                placeholder="How are you feeling? What's on your mind?"
                placeholderTextColor="#999"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Mood Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>How are you feeling?</Text>
              <View style={styles.moodContainer}>
                {moods.map((moodItem) => (
                  <TouchableOpacity
                    key={moodItem.type}
                    style={[
                      styles.moodButton,
                      mood === moodItem.type && {
                        backgroundColor: moodItem.color,
                        borderColor: moodItem.color,
                      },
                    ]}
                    onPress={() => handleMoodSelect(moodItem.type)}>
                    <Text style={styles.moodEmoji}>{moodItem.emoji}</Text>
                    <Text
                      style={[
                        styles.moodLabel,
                        mood === moodItem.type && styles.moodLabelSelected,
                      ]}>
                      {moodItem.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Photo Attachment */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Add a photo (optional)</Text>
              {photoUri ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  <TouchableOpacity style={styles.removePhotoButton} onPress={handleRemovePhoto}>
                    <Feather name="x" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addPhotoButton} onPress={handlePickImage}>
                  <Feather name="camera" size={24} color="#7c3aed" />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Info Text */}
            <View style={styles.infoContainer}>
              <Feather name="info" size={16} color="#7c3aed" />
              <Text style={styles.infoText}>
                Your entry will be saved locally first, then synced when you're online.
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf5ff',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  saveButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  promptCard: {
    backgroundColor: '#f3e8ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c3aed',
    marginLeft: 8,
    flex: 1,
  },
  shuffleButton: {
    padding: 4,
  },
  promptText: {
    fontSize: 15,
    color: '#6b21a8',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  contentInput: {
    fontSize: 16,
    color: '#444',
    minHeight: 200,
    lineHeight: 24,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
    minWidth: 80,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  moodLabelSelected: {
    color: '#1d1d1d',
    fontWeight: '600',
  },
  addPhotoButton: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '500',
    marginTop: 8,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f3e8ff',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6b21a8',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
