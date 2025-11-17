/**
 * Floating Crisis Button Component
 * Persistent access to crisis resources from any screen
 */

import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

interface FloatingCrisisButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  compact?: boolean;
}

export const FloatingCrisisButton: React.FC<FloatingCrisisButtonProps> = ({
  position = 'bottom-right',
  compact = false,
}) => {
  const handlePress = () => {
    router.push('/(tabs)/help');
  };

  const positionStyles = getPositionStyles(position);

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, positionStyles]}
        onPress={handlePress}
        activeOpacity={0.8}>
        <MaterialIcons name="favorite" size={24} color="#fff" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, positionStyles]}
      onPress={handlePress}
      activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="favorite" size={20} color="#fff" />
      </View>
      <Text style={styles.buttonText}>Need Help?</Text>
    </TouchableOpacity>
  );
};

const getPositionStyles = (position: string) => {
  switch (position) {
    case 'bottom-right':
      return { bottom: 24, right: 16 };
    case 'bottom-left':
      return { bottom: 24, left: 16 };
    case 'top-right':
      return { top: 24, right: 16 };
    case 'top-left':
      return { top: 24, left: 16 };
    default:
      return { bottom: 24, right: 16 };
  }
};

const styles = {
  button: {
    position: 'absolute' as const,
    backgroundColor: '#DC2626',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    // Large touch target for accessibility
    minHeight: 48,
    minWidth: 140,
  },
  compactButton: {
    position: 'absolute' as const,
    backgroundColor: '#DC2626',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
  },
};
