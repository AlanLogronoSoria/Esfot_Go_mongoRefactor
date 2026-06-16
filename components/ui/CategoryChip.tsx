import React, { useCallback } from 'react';
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LightTheme as T, Sizes, Shadows } from '@/constants/design-system';

export type Category = { key: string; label: string };

interface CategoryChipProps {
  categories: Category[];
  activeKey: string;
  onSelect: (key: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Chip({
  cat,
  isActive,
  onPress,
}: {
  cat: Category;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      style={[styles.chip, isActive && styles.chipActive, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
        {cat.label}
      </Text>
    </AnimatedPressable>
  );
}

export function CategoryChip({ categories, activeKey, onSelect }: CategoryChipProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      {categories.map((cat) => (
        <Chip
          key={cat.key}
          cat={cat}
          isActive={cat.key === activeKey}
          onPress={() => onSelect(cat.key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 10, paddingHorizontal: Sizes.paddingMd },
  chip: {
    backgroundColor: T.surface,
    borderRadius: Sizes.radiusFull,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: T.surfaceBorder,
  },
  chipActive: {
    backgroundColor: T.primary,
    borderColor: T.primary,
    ...Shadows.md,
    shadowColor: T.primary,
    shadowOpacity: 0.25,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
