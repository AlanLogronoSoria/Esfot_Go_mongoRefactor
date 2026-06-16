import React, { memo } from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { EventDateFilter } from '../domain/event.entity';
import { LightTheme as T, Sizes, Shadows } from '@/constants/design-system';

interface EventFiltersProps {
  dateFilter: EventDateFilter;
  onDateFilterChange: (filter: EventDateFilter) => void;
}

const FILTERS: { key: EventDateFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'proximos', label: 'Próximos' },
  { key: 'este_mes', label: 'Este mes' },
  { key: 'pasados', label: 'Pasados' },
];

export const EventFilters = memo(function EventFilters({ dateFilter, onDateFilterChange }: EventFiltersProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44 }} contentContainerStyle={ss.c}>
      {FILTERS.map((f) => (
        <Pressable
          key={f.key}
          style={[ss.chip, dateFilter === f.key && ss.chipOn]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDateFilterChange(f.key);
          }}
        >
          <Text style={[ss.ct, dateFilter === f.key && ss.ctOn]}>{f.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
});

const ss = StyleSheet.create({
  c: { gap: 8, paddingHorizontal: 16 },
  chip: {
    backgroundColor: T.surface, borderRadius: Sizes.radiusFull,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  chipOn: {
    backgroundColor: T.primary, borderColor: T.primary,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.25,
  },
  ct: { fontSize: 12, fontWeight: '600', color: T.textSecondary },
  ctOn: { color: '#FFFFFF' },
});
