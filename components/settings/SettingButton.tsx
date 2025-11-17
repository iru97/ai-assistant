/**
 * Setting Button Component
 * Renders an actionable button row
 */

import React from 'react';
import { SettingRow } from './SettingRow';

interface SettingButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
  iconColor?: string;
  iconBackgroundColor?: string;
  isFirst?: boolean;
  destructive?: boolean;
  value?: string;
}

export function SettingButton({
  label,
  onPress,
  icon,
  iconColor,
  iconBackgroundColor,
  isFirst = false,
  destructive = false,
  value,
}: SettingButtonProps) {
  return (
    <SettingRow
      label={label}
      value={value}
      icon={icon}
      iconColor={iconColor}
      iconBackgroundColor={iconBackgroundColor}
      onPress={onPress}
      isFirst={isFirst}
      destructive={destructive}
    />
  );
}
