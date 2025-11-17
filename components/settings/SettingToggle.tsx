/**
 * Setting Toggle Component
 * Renders a toggle switch setting row
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
      <Switch onValueChange={onChange} value={value} />
    </SettingRow>
  );
}
