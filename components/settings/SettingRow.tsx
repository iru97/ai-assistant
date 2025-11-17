/**
 * Setting Row Component
 * Base component for individual setting rows
 * Dark mode support with NativeWind
 */

import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '~/themes/ThemeProvider';

interface SettingRowProps {
  label: string;
  value?: string;
  icon?: keyof typeof Feather.glyphMap;
  iconColor?: string;
  iconBackgroundColor?: string;
  onPress?: () => void;
  children?: ReactNode;
  isFirst?: boolean;
  destructive?: boolean;
}

export function SettingRow({
  label,
  value,
  icon,
  iconColor = '#fff',
  iconBackgroundColor = '#10A37F',
  onPress,
  children,
  isFirst = false,
  destructive = false,
}: SettingRowProps) {
  const { isDark } = useTheme();

  const content = (
    <View className="flex-row items-center justify-start pr-4 min-h-[50px] py-2">
      {icon && (
        <View style={[styles.rowIcon, { backgroundColor: iconBackgroundColor }]}>
          <Feather color={iconColor} name={icon} size={20} />
        </View>
      )}
      <Text
        className={`text-base font-medium ${
          destructive
            ? 'text-red-700 dark:text-red-500'
            : 'text-gray-900 dark:text-dark-text'
        }`}
      >
        {label}
      </Text>
      <View className="flex-1" />
      {value && (
        <Text className="text-base font-medium text-gray-500 dark:text-dark-text-secondary mr-1">
          {value}
        </Text>
      )}
      {children}
      {onPress && <Feather color={isDark ? '#9ca3af' : '#C6C6C6'} name="chevron-right" size={20} />}
    </View>
  );

  return (
    <View className={`border-t border-gray-200 dark:border-dark-border ${isFirst ? 'border-t-0' : ''}`}>
      {onPress ? (
        <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>
      ) : (
        content
      )}
    </View>
  );
}

// Keep icon styles in StyleSheet for dynamic backgroundColor
const styles = StyleSheet.create({
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
