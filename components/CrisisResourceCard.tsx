/**
 * Crisis Resource Card Component
 * Displays a single crisis resource with call/text actions
 */

import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Platform, Text, TouchableOpacity, View } from 'react-native';

import { CrisisResource } from '~/types/crisis';

interface CrisisResourceCardProps {
  resource: CrisisResource;
  language?: 'en' | 'es';
}

export const CrisisResourceCard: React.FC<CrisisResourceCardProps> = ({
  resource,
  language = 'en',
}) => {
  const name = language === 'es' && resource.name_es ? resource.name_es : resource.name;
  const description =
    language === 'es' && resource.description_es ? resource.description_es : resource.description;
  const hours = language === 'es' && resource.hours_es ? resource.hours_es : resource.hours;
  const textInstructions =
    language === 'es' && resource.textInstructions_es
      ? resource.textInstructions_es
      : resource.textInstructions;

  const handleCall = () => {
    if (resource.phone) {
      const phoneUrl = `tel:${resource.phone}`;
      Linking.canOpenURL(phoneUrl).then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        }
      });
    }
  };

  const handleText = () => {
    if (resource.textLine) {
      const smsUrl = Platform.select({
        ios: `sms:${resource.textLine}`,
        android: `sms:${resource.textLine}`,
      });
      if (smsUrl) {
        Linking.canOpenURL(smsUrl).then((supported) => {
          if (supported) {
            Linking.openURL(smsUrl);
          }
        });
      }
    }
  };

  const handleWebChat = () => {
    if (resource.webChatUrl) {
      Linking.canOpenURL(resource.webChatUrl).then((supported) => {
        if (supported) {
          Linking.openURL(resource.webChatUrl);
        }
      });
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {resource.category === 'immediate' && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>24/7</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={styles.description}>{description}</Text>

      {/* Metadata */}
      <View style={styles.metadata}>
        <View style={styles.metadataRow}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={styles.metadataText}>{hours}</Text>
        </View>
        {resource.languages.length > 0 && (
          <View style={styles.metadataRow}>
            <MaterialIcons name="language" size={16} color="#666" />
            <Text style={styles.metadataText}>{resource.languages.join(', ')}</Text>
          </View>
        )}
      </View>

      {/* Specialties */}
      {resource.specialties.length > 0 && (
        <View style={styles.specialtiesContainer}>
          {resource.specialties.slice(0, 3).map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {resource.phone && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleCall}>
            <FontAwesome name="phone" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>
              {language === 'es' ? 'Llamar' : 'Call'} {resource.phone}
            </Text>
          </TouchableOpacity>
        )}

        {resource.textLine && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleText}>
            <MaterialIcons name="message" size={20} color="#10A37F" />
            <Text style={styles.secondaryButtonText}>
              {language === 'es' ? 'Texto' : 'Text'}
            </Text>
          </TouchableOpacity>
        )}

        {resource.webChatUrl && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleWebChat}>
            <MaterialIcons name="chat" size={20} color="#10A37F" />
            <Text style={styles.secondaryButtonText}>
              {language === 'es' ? 'Chat Web' : 'Web Chat'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Text Instructions */}
      {textInstructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>{textInstructions}</Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626', // Red for urgency
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#0B0B0B',
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  description: {
    fontSize: 15,
    color: '#444654',
    lineHeight: 22,
    marginBottom: 16,
  },
  metadata: {
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 6,
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  specialtiesContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500' as const,
  },
  actions: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    minWidth: '100%',
    justifyContent: 'center' as const,
    // Large touch target for crisis situations
    minHeight: 56,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
    marginLeft: 12,
  },
  secondaryButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#10A37F',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    minWidth: 120,
    justifyContent: 'center' as const,
  },
  secondaryButtonText: {
    color: '#10A37F',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  instructionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  instructionsText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic' as const,
  },
};
