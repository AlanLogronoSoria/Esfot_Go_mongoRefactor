import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LightTheme as T, Typography, Sizes, Shadows } from '@/constants/design-system';

interface ChatUserCardProps {
  user: { _id: string; nombre: string; apellido?: string; email: string; rol: string };
  isOnline?: boolean;
  onPress: () => void;
}

export function ChatUserCard({ user, isOnline, onPress }: ChatUserCardProps) {
  const initials = (user.nombre.charAt(0) + (user.apellido?.charAt(0) ?? '')).toUpperCase();
  const roleColor = user.rol === 'docente' ? T.highlight : T.primary;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { backgroundColor: T.pressed }]}
      onPress={onPress}
    >
      <View style={[styles.avatar, { backgroundColor: roleColor + '22' }]}>
        <Text style={[styles.avatarText, { color: roleColor }]}>{initials}</Text>
        {isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.nombre} {user.apellido ?? ''}
        </Text>
        <Text style={styles.role}>{user.rol === 'docente' ? 'Docente' : 'Estudiante'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
    borderRadius: Sizes.radiusSm,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 16, fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: T.success,
    borderWidth: 2, borderColor: T.background,
  },
  info: { flex: 1, gap: 2 },
  name: {
    ...Typography.body, fontWeight: '600', color: T.textPrimary,
  },
  role: { ...Typography.caption, color: T.textSecondary },
});
