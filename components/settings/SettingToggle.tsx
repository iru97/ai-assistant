/**
 * Setting Toggle Component
 * Renders a toggle switch setting row
 * Dark mode support with theme-aware colors
 */

import React from 'react';
import { Switch } from 'react-native';
import { SettingRow } from './SettingRow';

interface SettingToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon?: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
  iconColor?: string;
  iconBackgroundColor?: string;
  isFirst?: boolean;
}

export function SettingToggle({
  label,
  value,
  onChange,
  icon,
  iconColor,
  iconBackgroundColor,
  isFirst = false,
}: SettingToggleProps) {
  return (
    <SettingRow
      label={label}
      icon={icon}
      iconColor={iconColor}
      iconBackgroundColor={iconBackgroundColor}
      isFirst={isFirst}
    >
      <Switch
        onValueChange={onChange}
        value={value}
        trackColor={{ false: '#d1d5db', true: '#a78bfa' }}
        thumbColor={value ? '#7c3aed' : '#f4f3f4'}
      />
    </SettingRow>
  );
}
