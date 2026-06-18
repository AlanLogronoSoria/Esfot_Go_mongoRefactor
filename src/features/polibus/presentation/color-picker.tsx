import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { LightTheme as T, Shadows, Sizes } from '@/constants/design-system';

const BUS_COLORS = [
  '#1B6BB0', '#059669', '#DC2626', '#7C3AED',
  '#F59E0B', '#0EA5E9', '#EC4899', '#14B8A6',
  '#F97316', '#6366F1',
];

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export const ColorPicker = memo(function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Color de la ruta</Text>
      <View style={styles.row}>
        {BUS_COLORS.map((color) => {
          const isSelected = selected === color;
          return (
            <Pressable
              key={color}
              style={[styles.swatch, { backgroundColor: color }, isSelected && styles.swatchSelected]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(color);
              }}
            >
              {isSelected && <Check size={14} strokeWidth={3} color="#FFFFFF" />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 12, fontWeight: '600', color: T.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  swatch: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'transparent',
    ...Shadows.sm,
  },
  swatchSelected: {
    borderColor: T.surface, width: 44, height: 44, borderRadius: 14,
    ...Shadows.md,
  },
});
