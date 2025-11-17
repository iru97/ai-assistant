import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';

import { LocalJournalEntry } from '~/types/journal';
import { getAllLocalEntries, getSyncStatusIcon, getSyncStatusMessage } from '~/utils/journalStorage';

export default function JournalPage() {
  const [entries, setEntries] = useState<LocalJournalEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async () => {
    try {
      const localEntries = await getAllLocalEntries();
      setEntries(localEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const handleNewEntry = () => {
    router.push('/journal/new');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f6' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
          <TouchableOpacity style={styles.newButton} onPress={handleNewEntry}>
            <Feather name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="book-open" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No journal entries yet</Text>
              <Text style={styles.emptySubtext}>Tap the + button to create your first entry</Text>
            </View>
          ) : (
            entries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryDate}>
                    {new Date(entry.clientCreatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  <View style={styles.syncBadge}>
                    <Text style={styles.syncIcon}>{getSyncStatusIcon(entry)}</Text>
                    <Text style={styles.syncText}>{getSyncStatusMessage(entry)}</Text>
                  </View>
                </View>
                {entry.title && <Text style={styles.entryTitle}>{entry.title}</Text>}
                <Text style={styles.entryContent} numberOfLines={3}>
                  {entry.content}
                </Text>
                {entry.mood && (
                  <View style={styles.moodBadge}>
                    <Text style={styles.moodText}>{getMoodEmoji(entry.mood)}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function getMoodEmoji(mood: string): string {
  switch (mood) {
    case 'calm':
      return '😌 Calm';
    case 'happy':
      return '😊 Happy';
    case 'anxious':
      return '😰 Anxious';
    case 'sad':
      return '😢 Sad';
    case 'overwhelmed':
      return '😵 Overwhelmed';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
  },
  newButton: {
    backgroundColor: '#7c3aed',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  entryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  syncText: {
    fontSize: 11,
    color: '#666',
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1d',
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  moodBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  moodText: {
    fontSize: 14,
  },
});
