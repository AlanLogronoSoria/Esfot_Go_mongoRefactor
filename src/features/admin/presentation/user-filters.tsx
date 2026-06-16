import React, { memo } from 'react';
import {
  View, TextInput, StyleSheet, ScrollView, Pressable, Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ManagedUserType, UserFiltersState } from '@/features/admin/domain/user-management.entity';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

interface UserFiltersProps {
  filters: UserFiltersState;
  onSearchChange: (search: string) => void;
  onTypeChange: (type: ManagedUserType | 'todos') => void;
  onStatusChange: (status: UserFiltersState['status']) => void;
  total: number;
}

const TYPE_CHIPS: { key: ManagedUserType | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'estudiante', label: 'Estudiantes' },
  { key: 'docente', label: 'Docentes' },
];

const STATUS_CHIPS: { key: UserFiltersState['status']; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'activo', label: 'Activos' },
  { key: 'inactivo', label: 'Inactivos' },
];

export const UserFilters = memo(function UserFilters({
  filters,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  total,
}: UserFiltersProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar usuarios..."
        placeholderTextColor={T.inputPlaceholder}
        value={filters.search}
        onChangeText={onSearchChange}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {TYPE_CHIPS.map((chip) => (
          <Pressable
            key={chip.key}
            style={[styles.chip, filters.type === chip.key && styles.chipActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTypeChange(chip.key);
            }}
          >
            <Text style={[styles.chipText, filters.type === chip.key && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {STATUS_CHIPS.map((chip) => (
          <Pressable
            key={chip.key}
            style={[styles.chip, filters.status === chip.key && styles.chipActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onStatusChange(chip.key);
            }}
          >
            <Text style={[styles.chipText, filters.status === chip.key && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.count}>{total} usuarios encontrados</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 10 },
  searchInput: {
    backgroundColor: T.surface, borderRadius: Sizes.radiusMd,
    padding: 14, fontSize: 14, color: T.textPrimary,
    borderWidth: 1.5, borderColor: T.cardBorder,
  },
  chips: { gap: 8, paddingVertical: 2 },
  chip: {
    backgroundColor: T.surfaceGlass, borderRadius: Sizes.radiusFull,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  chipActive: {
    backgroundColor: T.primary, borderColor: T.primary,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.25,
  },
  chipText: { ...Typography.caption, fontWeight: '600', color: T.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  count: { ...Typography.caption, color: T.textTertiary, textAlign: 'right' },
});
