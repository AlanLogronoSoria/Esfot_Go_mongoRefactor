import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import type { Event as EventEntity } from '../domain/event.entity';
import { useDeleteEvent } from '../application/event.hooks';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission } from '@/constants/roles';
import { LightTheme as T, Sizes, Shadows, Typography, EPN_GOLD } from '@/constants/design-system';

interface EventDetailModalProps {
  event: EventEntity;
  onClose: () => void;
  onEdit: (event: EventEntity) => void;
}

export function EventDetailModal({ event, onClose, onEdit }: EventDetailModalProps) {
  const user = useAuthStore((s) => s.user);
  const deleteMutation = useDeleteEvent();
  const canEdit = user && hasPermission(user.role, 'update:events');
  const canDelete = user && hasPermission(user.role, 'delete:events');

  const handleDelete = () => {
    Alert.alert(
      'Eliminar evento',
      `¿Estás seguro de eliminar "${event.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(event.id);
              onClose();
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo eliminar el evento');
            }
          },
        },
      ]
    );
  };

  const d = new Date(event.startDate);
  const endD = event.endDate ? new Date(event.endDate) : null;
  const past = d < new Date();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}><Text style={styles.imageFallbackEmoji}>📅</Text></View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
            {past && <View style={styles.pastBadge}><Text style={styles.pastBadgeText}>Finalizado</Text></View>}
          </View>

          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText}>
                {d.toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}
                {d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            {endD && (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>🏁</Text>
                <Text style={styles.metaText}>
                  Finaliza: {endD.toLocaleDateString('es', { month: 'long', day: 'numeric' })}
                  {' · '}
                  {endD.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}

            {event.location && (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText}>{event.location}</Text>
              </View>
            )}

            {event.organizer && (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>👤</Text>
                <Text style={styles.metaText}>{event.organizer}</Text>
              </View>
            )}
          </View>

          {event.description && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>Descripción</Text>
              <Text style={styles.descText}>{event.description}</Text>
            </View>
          )}

          {(canEdit || canDelete) && (
            <View style={styles.actions}>
              {canEdit && (
                <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(event)} activeOpacity={0.8}>
                  <Text style={styles.editBtnText}>✏️ Editar</Text>
                </TouchableOpacity>
              )}
              {canDelete && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <ActivityIndicator color={T.error} size="small" />
                  ) : (
                    <Text style={styles.deleteBtnText}>🗑️ Eliminar</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.background },
  scroll: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', padding: 12 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.surface, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { fontSize: 16, color: T.textSecondary, fontWeight: '700' },
  image: { width: '100%', height: 240 },
  imageFallback: { width: '100%', height: 160, backgroundColor: T.surface, justifyContent: 'center', alignItems: 'center' },
  imageFallbackEmoji: { fontSize: 48 },
  body: { padding: Sizes.paddingMd, gap: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  title: { ...Typography.h2, color: T.textPrimary, flex: 1 },
  pastBadge: { backgroundColor: T.textMuted, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  pastBadgeText: { fontSize: 11, fontWeight: '700', color: T.text },
  meta: { gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaIcon: { fontSize: 18, width: 24 },
  metaText: { ...Typography.body, color: T.textSecondary, flex: 1 },
  descSection: { gap: 8 },
  descTitle: { ...Typography.h4, color: T.textPrimary },
  descText: { ...Typography.body, color: T.textSecondary, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  editBtn: { flex: 1, backgroundColor: T.primaryMuted, borderRadius: Sizes.radiusMd, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: T.primary },
  editBtnText: { fontSize: 14, fontWeight: '700', color: T.primary },
  deleteBtn: { flex: 1, backgroundColor: T.errorBg, borderRadius: Sizes.radiusMd, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: T.error },
  deleteBtnText: { fontSize: 14, fontWeight: '700', color: T.error },
});
