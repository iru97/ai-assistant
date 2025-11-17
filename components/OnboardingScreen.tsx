import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OnboardingScreenProps {
  title: string;
  subtitle?: string;
  illustration?: string; // emoji or icon
  children?: React.ReactNode;
  onNext: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  nextButtonText?: string;
  backgroundColor?: string;
}

/**
 * OnboardingScreen Component
 * Reusable template for onboarding screens
 * Provides consistent layout and styling
 */
export function OnboardingScreen({
  title,
  subtitle,
  illustration,
  children,
  onNext,
  onSkip,
  showSkip = false,
  nextButtonText = 'Next',
  backgroundColor = 'bg-white',
}: OnboardingScreenProps) {
  return (
    <SafeAreaView className={`flex-1 ${backgroundColor}`}>
      {/* Skip Button */}
      {showSkip && onSkip && (
        <View className="items-end px-6 pt-4">
          <TouchableOpacity onPress={onSkip} className="px-4 py-2">
            <Text className="text-base font-semibold text-purple-600">Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8">
        {/* Illustration/Icon */}
        {illustration && (
          <View className="mt-12 items-center">
            <Text style={{ fontSize: 80 }}>{illustration}</Text>
          </View>
        )}

        {/* Title */}
        <View className="mt-8">
          <Text className="text-center text-3xl font-bold text-gray-900">{title}</Text>
        </View>

        {/* Subtitle */}
        {subtitle && (
          <View className="mt-4">
            <Text className="text-center text-lg leading-relaxed text-gray-600">
              {subtitle}
            </Text>
          </View>
        )}

        {/* Custom Content */}
        {children && <View className="mt-8">{children}</View>}
      </ScrollView>

      {/* Next Button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={onNext}
          className="items-center rounded-full bg-purple-600 px-8 py-4 shadow-md"
          activeOpacity={0.8}>
          <Text className="text-lg font-semibold text-white">{nextButtonText}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
