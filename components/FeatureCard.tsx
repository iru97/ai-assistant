import React from 'react';
import { View, Text } from 'react-native';

interface FeatureCardProps {
  icon: string; // emoji or icon
  title: string;
  description: string;
}

/**
 * FeatureCard Component
 * Displays a feature with icon, title, and description
 * Used in the onboarding "What is Journal Safe?" screen
 */
export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <View className="mb-6 flex-row items-start">
      {/* Icon/Emoji */}
      <View className="mr-4">
        <Text className="text-5xl">{icon}</Text>
      </View>

      {/* Text Content */}
      <View className="flex-1">
        <Text className="mb-1 text-lg font-bold text-gray-900">{title}</Text>
        <Text className="text-base leading-relaxed text-gray-600">{description}</Text>
      </View>
    </View>
  );
}
