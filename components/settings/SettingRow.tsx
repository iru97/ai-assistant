/**
 * Setting Row Component
 * Base component for individual setting rows
 */

import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
  const content = (
    <View style={styles.row}>
      {icon && (
        <View style={[styles.rowIcon, { backgroundColor: iconBackgroundColor }]}>
          <Feather color={iconColor} name={icon} size={20} />
        </View>
      )}
      <Text style={[styles.rowLabel, destructive && styles.destructiveLabel]}>{label}</Text>
      <View style={styles.rowSpacer} />
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {children}
      {onPress && <Feather color="#C6C6C6" name="chevron-right" size={20} />}
    </View>
  );

  return (
    <View style={[styles.rowWrapper, isFirst && styles.rowFirst]}>
      {onPress ? (
        <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowWrapper: {
    borderTopWidth: 1,
    borderColor: '#e3e3e3',
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 16,
    minHeight: 50,
    paddingVertical: 8,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000',
  },
  destructiveLabel: {
    color: '#8B0000',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  rowValue: {
    fontSize: 17,
    fontWeight: '500',
    color: '#8B8B8B',
    marginRight: 4,
  },
});
