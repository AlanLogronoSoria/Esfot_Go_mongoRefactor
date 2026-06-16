import React, { memo } from 'react';
import { View, Text, Switch, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ManagedUser } from '@/features/admin/domain/user-management.entity';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

interface UserRowProps {
  user: ManagedUser;
  onEdit: (user: ManagedUser) => void;
  onToggleStatus: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
  isToggling?: boolean;
}

export const UserRow = memo(function UserRow({
  user, onEdit, onToggleStatus, onDelete, isToggling,
}: UserRowProps) {
  const isActive = user.status === 'activo';
  const initials = user.nombre.charAt(0).toUpperCase() + (user.apellido?.charAt(0)?.toUpperCase() ?? '');

  const roleColor =
    user.rol === 'administrador' ? '#DC2626' : user.rol === 'docente' ? '#7C3AED' : '#1B6BB0';

  return (
    <View style={[styles.card, !isActive && styles.cardInactive]}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: roleColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>
            {user.nombre} {user.apellido ?? ''}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.meta}>
            <View style={[styles.roleBadge, { backgroundColor: roleColor + '15' }]}>
              <Text style={[styles.roleBadgeText, { color: roleColor }]}>{user.rol}</Text>
            </View>
            <Text style={styles.type}>{user.type}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{isActive ? 'Activo' : 'Inactivo'}</Text>
          <Switch
            value={isActive}
            onValueChange={() => onToggleStatus(user)}
            disabled={isToggling}
            trackColor={{ false: T.textMuted, true: T.successBg }}
            thumbColor={isActive ? T.success : T.textTertiary}
          />
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.editBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onEdit(user);
            }}
          >
            <Text style={styles.editBtnText}>Editar</Text>
          </Pressable>
          <Pressable
            style={styles.deleteBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onDelete(user);
            }}
          >
            <Text style={styles.deleteBtnText}>Eliminar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusLg,
    padding: 14, gap: 12, marginBottom: 10,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  cardInactive: { opacity: 0.55, backgroundColor: T.surface },
  row: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  info: { flex: 1, gap: 2 },
  name: { ...Typography.body, color: T.textPrimary, fontWeight: '700' },
  email: { ...Typography.caption, color: T.textSecondary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  roleBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  roleBadgeText: {
    ...Typography.caption, fontWeight: '700', textTransform: 'capitalize',
  },
  type: { ...Typography.caption, color: T.textTertiary, textTransform: 'capitalize' },
  actions: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: T.divider, paddingTop: 10,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchLabel: { ...Typography.caption, color: T.textSecondary },
  buttonRow: { flexDirection: 'row', gap: 8 },
  editBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Sizes.radiusSm, backgroundColor: T.infoBg,
    borderWidth: 1, borderColor: T.info + '20',
  },
  editBtnText: { ...Typography.caption, fontWeight: '600', color: T.info },
  deleteBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Sizes.radiusSm, backgroundColor: T.errorBg,
    borderWidth: 1, borderColor: T.error + '20',
  },
  deleteBtnText: { ...Typography.caption, fontWeight: '600', color: T.error },
});
