/**
 * Settings Section Component
 * Renders a section with a header and content
 * Dark mode support with NativeWind
 */

import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="pt-3">
      <Text className="my-2 mx-6 text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {title}
      </Text>
      <View className="pl-6 bg-white dark:bg-dark-card border-t border-b border-gray-200 dark:border-dark-border">
        {children}
      </View>
    </View>
  );
}
