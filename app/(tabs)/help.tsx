/**
 * Crisis Resources / Help Screen
 * Always-accessible crisis support for Journal Safe MVP
 */

import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { CrisisResourceCard } from '~/components/CrisisResourceCard';
import { categoryMetadata, getResourcesByCategory } from '~/data/crisisResources';
import { CrisisResource } from '~/types/crisis';

export default function HelpScreen() {
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  const categories: Array<CrisisResource['category']> = [
    'immediate',
    'eating-disorder',
    'lgbtq',
    'international',
    'other',
  ];

  const handleEmergencyCall = () => {
    Linking.openURL('tel:911');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: language === 'es' ? 'Recursos de Crisis' : 'Crisis Resources',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setLanguage(language === 'en' ? 'es' : 'en')}
              style={{ marginRight: 16 }}>
              <Text style={{ fontSize: 16, color: '#10A37F', fontWeight: '600' }}>
                {language === 'en' ? 'ES' : 'EN'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {language === 'es' ? 'No Estás Solo' : "You're Not Alone"}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'es'
              ? 'Pedir ayuda es valiente. Estos recursos están aquí para ti las 24 horas.'
              : "Asking for help is brave. These resources are here for you 24/7."}
          </Text>
        </View>

        {/* Emergency Disclaimer */}
        <TouchableOpacity style={styles.emergencyBanner} onPress={handleEmergencyCall}>
          <MaterialIcons name="error" size={24} color="#DC2626" />
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>
              {language === 'es' ? 'Emergencia Inmediata' : 'Immediate Emergency'}
            </Text>
            <Text style={styles.emergencyText}>
              {language === 'es'
                ? 'Si estás en peligro inmediato, llama al 911'
                : "If you're in immediate danger, call 911"}
            </Text>
          </View>
          <MaterialIcons name="phone" size={24} color="#DC2626" />
        </TouchableOpacity>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <MaterialIcons name="lock" size={16} color="#6B7280" />
          <Text style={styles.privacyText}>
            {language === 'es'
              ? 'Las llamadas y mensajes no aparecen en el historial de la aplicación'
              : "Calls and texts don't appear in app history"}
          </Text>
        </View>

        {/* Crisis Resources by Category */}
        {categories.map((category) => {
          const resources = getResourcesByCategory(category);
          if (resources.length === 0) return null;

          const metadata = categoryMetadata[category];
          const categoryTitle =
            language === 'es' && metadata.title_es ? metadata.title_es : metadata.title;
          const categoryDesc =
            language === 'es' && metadata.description_es
              ? metadata.description_es
              : metadata.description;

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{metadata.icon}</Text>
                <View style={styles.categoryTitleContainer}>
                  <Text style={styles.categoryTitle}>{categoryTitle}</Text>
                  {categoryDesc && <Text style={styles.categoryDesc}>{categoryDesc}</Text>}
                </View>
              </View>

              {resources.map((resource) => (
                <CrisisResourceCard key={resource.id} resource={resource} language={language} />
              ))}
            </View>
          );
        })}

        {/* Supportive Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {language === 'es'
              ? 'Está bien no estar bien. Hay personas que quieren ayudarte.'
              : "It's okay to not be okay. There are people who want to help."}
          </Text>
          <Text style={styles.footerSubtext}>
            {language === 'es'
              ? 'Todos estos recursos son gratuitos y confidenciales.'
              : 'All of these resources are free and confidential.'}
          </Text>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#0B0B0B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#444654',
    lineHeight: 24,
  },
  emergencyBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
    // Large touch target
    minHeight: 80,
  },
  emergencyTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#DC2626',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 14,
    color: '#991B1B',
  },
  privacyNote: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#0B0B0B',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10A37F',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E3A8A',
    marginBottom: 8,
    lineHeight: 24,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
  },
};
