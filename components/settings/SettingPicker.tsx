/**
 * Setting Picker Component
 * Renders a picker setting row (opens action sheet on press)
 */

import React from 'react';
import { ActionSheetIOS, Platform, Alert } from 'react-native';
import { SettingRow } from './SettingRow';
import { PickerOption } from '~/types/settings';

interface SettingPickerProps<T = string> {
  label: string;
  value: T;
  options: PickerOption<T>[];
  onChange: (value: T) => void;
  icon?: keyof typeof import('@expo/vector-icons').Feather.glyphMap;
  iconColor?: string;
  iconBackgroundColor?: string;
  isFirst?: boolean;
}

export function SettingPicker<T = string>({
  label,
  value,
  options,
  onChange,
  icon,
  iconColor,
  iconBackgroundColor,
  isFirst = false,
}: SettingPickerProps<T>) {
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || 'Select';

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      // Use ActionSheet on iOS
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: label,
          options: [...options.map((opt) => opt.label), 'Cancel'],
          cancelButtonIndex: options.length,
        },
        (buttonIndex) => {
          if (buttonIndex < options.length) {
            onChange(options[buttonIndex].value);
          }
        }
      );
    } else {
      // Use Alert on Android
      Alert.alert(
        label,
        'Select an option:',
        [
          ...options.map((opt) => ({
            text: opt.label,
            onPress: () => onChange(opt.value),
          })),
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <SettingRow
      label={label}
      value={displayValue}
      icon={icon}
      iconColor={iconColor}
      iconBackgroundColor={iconBackgroundColor}
      onPress={handlePress}
      isFirst={isFirst}
    />
  );
}
