import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import type { ManagedUserRole } from '@/features/admin/domain/user-management.entity';
import { LightTheme as T, Shadows, Sizes, Typography } from '@/constants/design-system';

const ROLES: { key: ManagedUserRole; label: string; color: string }[] = [
  { key: 'estudiante', label: 'Estudiante', color: '#1B6BB0' },
  { key: 'docente', label: 'Docente', color: '#7C3AED' },
  { key: 'administrador', label: 'Administrador', color: '#DC2626' },
];

interface RoleDropdownProps {
  value: ManagedUserRole;
  onChange: (role: ManagedUserRole) => void;
}

export function RoleDropdown({ value, onChange }: RoleDropdownProps) {
  const [open, setOpen] = useState(false);
  const current = ROLES.find((r) => r.key === value) ?? ROLES[0];

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.trigger, { borderColor: current.color }]}
        onPress={() => setOpen(true)}
      >
        <View style={[styles.dot, { backgroundColor: current.color }]} />
        <Text style={styles.triggerText}>{current.label}</Text>
        <ChevronDown size={14} strokeWidth={2.2} color={T.textTertiary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={styles.overlay}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Seleccionar rol</Text>
            {ROLES.map((role) => (
              <Pressable
                key={role.key}
                style={[styles.option, value === role.key && styles.optionActive]}
                onPress={() => {
                  onChange(role.key);
                  setOpen(false);
                }}
              >
                <View style={[styles.dot, { backgroundColor: role.color }]} />
                <Text style={styles.optionText}>{role.label}</Text>
                {value === role.key && (
                  <Check size={16} strokeWidth={2.5} color={T.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { zIndex: 10 },
  trigger: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.surface, borderRadius: Sizes.radiusSm,
    padding: 12, borderWidth: 1.5,
    ...Shadows.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  triggerText: {
    flex: 1, ...Typography.bodySm, fontWeight: '600', color: T.textPrimary,
  },
  overlay: {
    flex: 1, backgroundColor: T.overlay,
    justifyContent: 'center', alignItems: 'center',
    padding: 24,
  },
  dropdown: {
    backgroundColor: T.surfaceGlass, borderRadius: Sizes.radiusXl,
    padding: 18, width: '100%', maxWidth: 280, gap: 4,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.xl,
  },
  dropdownTitle: {
    ...Typography.h4, color: T.textPrimary, marginBottom: 8,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: Sizes.radiusSm,
  },
  optionActive: {
    backgroundColor: T.primaryMuted,
  },
  optionText: {
    flex: 1, ...Typography.body, fontWeight: '600', color: T.textPrimary,
  },
});
