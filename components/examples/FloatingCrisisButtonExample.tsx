/**
 * Example: How to integrate FloatingCrisisButton into existing screens
 *
 * USAGE:
 * 1. Import the FloatingCrisisButton component
 * 2. Add it to your screen component (ideally after the main content)
 * 3. The button will float on top of your content
 *
 * NOTE: Only add to main user-facing screens (not settings, not modals)
 * Recommended screens: Assistant, Conversations, Mood tracking
 */

import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { FloatingCrisisButton } from '~/components/FloatingCrisisButton';

export default function ExampleScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Example Screen' }} />

      <ScrollView style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Your Main Content
        </Text>
        <Text>
          This is your regular screen content. The floating crisis button will
          appear on top of this content.
        </Text>

        {/* Add lots of content to test scrolling */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Text key={i} style={{ marginTop: 12 }}>
            Content item {i + 1}
          </Text>
        ))}
      </ScrollView>

      {/* Add the floating crisis button */}
      <FloatingCrisisButton position="bottom-right" />

      {/* Or use compact version */}
      {/* <FloatingCrisisButton position="bottom-right" compact /> */}
    </View>
  );
}

/**
 * INTEGRATION RECOMMENDATIONS:
 *
 * 1. Add to Assistant screen (app/(tabs)/assistant.tsx):
 *    - Users journal here, may encounter triggers
 *    - Add after the Chat component
 *
 * 2. Add to Conversations screen (app/(tabs)/conversations.tsx):
 *    - Users review past entries
 *    - May encounter difficult emotions
 *
 * 3. Consider for Mood tracking:
 *    - When logging difficult moods
 *    - Provide immediate access to support
 *
 * 4. DON'T add to:
 *    - Settings screen (not relevant)
 *    - Help screen (already has resources)
 *    - Login/auth screens (user not logged in yet)
 *
 * POSITION OPTIONS:
 * - 'bottom-right' (default, most common)
 * - 'bottom-left' (if right side has other UI)
 * - 'top-right' (less common)
 * - 'top-left' (less common)
 *
 * COMPACT MODE:
 * Use compact={true} for screens with limited space.
 * Shows just a heart icon instead of full button text.
 */
