import React, { memo } from 'react';
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { getAllCategories } from '@/features/map/application/map.hooks';
import { LightTheme as T, Sizes, Shadows } from '@/constants/design-system';

interface CategoryFilterProps {
  selectedCategory: string | undefined;
  onSelectCategory: (c: string | undefined) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FilterChip({
  active,
  letter,
  label,
  color,
  onPress,
}: {
  active: boolean;
  letter: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[s.chip, active && { backgroundColor: color, borderColor: color, ...Shadows.md, shadowColor: color, shadowOpacity: 0.3 }]}
      onPressIn={() => { scale.value = withSpring(0.94, { damping: 20, stiffness: 400 }); }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 300 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Animated.View style={[s.chipLetterWrap, { backgroundColor: active ? 'rgba(255,255,255,0.22)' : color + '18' }, animStyle]}>
        <Text style={[s.chipLetter, { color: active ? '#FFFFFF' : color }]}>{letter}</Text>
      </Animated.View>
      <Text style={[s.ct, active && s.ctOn]}>{label}</Text>
    </AnimatedPressable>
  );
}

export const CategoryFilter = memo(function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const cats = getAllCategories();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ maxHeight: 48 }}
      contentContainerStyle={s.row}
    >
      <FilterChip
        active={!selectedCategory}
        letter="T"
        label="Todos"
        color={T.primary}
        onPress={() => onSelectCategory(undefined)}
      />
      {cats.map((cat) => {
        const active = selectedCategory === cat.key;
        return (
          <FilterChip
            key={cat.key}
            active={active}
            letter={cat.label.charAt(0)}
            label={cat.label}
            color={cat.color}
            onPress={() => onSelectCategory(active ? undefined : cat.key)}
          />
        );
      })}
    </ScrollView>
  );
});

const s = StyleSheet.create({
  row: { gap: 10, paddingHorizontal: 14 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusFull,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  chipLetterWrap: {
    width: 24, height: 24, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  chipLetter: {
    fontSize: 12, fontWeight: '800',
  },
  ct: { fontSize: 13, fontWeight: '600', color: T.textPrimary },
  ctOn: { color: '#FFFFFF' },
});
