import { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { Calendar, MapPin, User, Clock, Pencil, Trash2, X, AlertTriangle } from 'lucide-react-native';
import type { Event as EventEntity } from '../domain/event.entity';
import { useDeleteEvent } from '../application/event.hooks';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission } from '@/constants/roles';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

interface EventDetailModalProps {
  event: EventEntity;
  onClose: () => void;
  onEdit: (event: EventEntity) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EventDetailModal({ event, onClose, onEdit }: EventDetailModalProps) {
  const user = useAuthStore((s) => s.user);
  const deleteMutation = useDeleteEvent();
  const canEdit = user && hasPermission(user.role, 'update:events');
  const canDelete = user && hasPermission(user.role, 'delete:events');

  const [showConfirm, setShowConfirm] = useState(false);
  const confirmScale = useSharedValue(0);

  const d = new Date(event.startDate);
  const endD = event.endDate ? new Date(event.endDate) : null;
  const past = d < new Date();

  const dateFormatted = d.toLocaleDateString('es', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeFormatted = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  const handleDelete = () => {
    setShowConfirm(true);
    confirmScale.value = withSpring(1, { damping: 20, stiffness: 220 });
  };

  const cancelDelete = () => {
    confirmScale.value = withTiming(0, { duration: 150 }, () => setShowConfirm(false));
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(event.id);
      Toast.show({ type: 'success', text1: 'Eliminado', text2: 'El evento ha sido eliminado' });
      onClose();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: e instanceof Error ? e.message : 'No se pudo eliminar el evento',
      });
    }
    setShowConfirm(false);
    confirmScale.value = 0;
  };

  const confirmStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confirmScale.value }],
    opacity: confirmScale.value,
  }));

  const btnScale = useSharedValue(1);
  const btnAnim = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const pressBtn = (fn: () => void) => {
    btnScale.value = withSpring(0.96, { damping: 20, stiffness: 400 }, () => {
      btnScale.value = withSpring(1, { damping: 20, stiffness: 300 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn();
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.imageWrap}>
          {event.imageUrl ? (
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.imageFallback}>
              <Calendar size={48} strokeWidth={1.2} color={T.textTertiary} />
            </View>
          )}
          <Pressable
            style={styles.closeBtn}
            onPress={() => pressBtn(onClose)}
          >
            <X size={18} strokeWidth={2.2} color={T.textPrimary} />
          </Pressable>
          {past && (
            <View style={styles.pastOverlay}>
              <Text style={styles.pastOverlayText}>Finalizado</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Calendar size={18} strokeWidth={1.8} color={T.primary} />
              <Text style={styles.metaText}>{dateFormatted}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={18} strokeWidth={1.8} color={T.primary} />
              <Text style={styles.metaText}>{timeFormatted}</Text>
            </View>

            {endD && (
              <View style={styles.metaItem}>
                <AlertTriangle size={18} strokeWidth={1.8} color={T.warning} />
                <Text style={styles.metaText}>
                  Finaliza: {endD.toLocaleDateString('es', { month: 'long', day: 'numeric' })}
                  {' · '}
                  {endD.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}

            {event.location && (
              <View style={styles.metaItem}>
                <MapPin size={18} strokeWidth={1.8} color={T.primary} />
                <Text style={styles.metaText}>{event.location}</Text>
              </View>
            )}

            {event.organizer && (
              <View style={styles.metaItem}>
                <User size={18} strokeWidth={1.8} color={T.primary} />
                <Text style={styles.metaText}>{event.organizer}</Text>
              </View>
            )}
          </View>

          {event.description && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>Descripcion</Text>
              <Text style={styles.descText}>{event.description}</Text>
            </View>
          )}

          {(canEdit || canDelete) && (
            <View style={styles.actions}>
              {canEdit && (
                <AnimatedPressable
                  style={[styles.editBtn, btnAnim]}
                  onPress={() => pressBtn(() => onEdit(event))}
                >
                  <Pencil size={16} strokeWidth={2} color={T.primary} />
                  <Text style={styles.editBtnText}>Editar</Text>
                </AnimatedPressable>
              )}
              {canDelete && (
                <AnimatedPressable
                  style={[styles.deleteBtn, btnAnim]}
                  onPress={() => pressBtn(handleDelete)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <ActivityIndicator color={T.error} size="small" />
                  ) : (
                    <>
                      <Trash2 size={16} strokeWidth={2} color={T.error} />
                      <Text style={styles.deleteBtnText}>Eliminar</Text>
                    </>
                  )}
                </AnimatedPressable>
              )}
            </View>
          )}

          {showConfirm && (
            <Animated.View style={[styles.confirmBox, confirmStyle]}>
              <Text style={styles.confirmText}>
                Seguro de eliminar "{event.title}"?
              </Text>
              <View style={styles.confirmRow}>
                <Pressable
                  style={styles.confirmCancel}
                  onPress={() => pressBtn(cancelDelete)}
                >
                  <Text style={styles.confirmCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={styles.confirmDelete}
                  onPress={() => pressBtn(confirmDelete)}
                >
                  <Text style={styles.confirmDeleteText}>Eliminar</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.background },
  scroll: { paddingBottom: 60 },

  imageWrap: { position: 'relative', width: '100%', height: 260 },
  image: { width: '100%', height: '100%' },
  imageFallback: {
    width: '100%', height: '100%', backgroundColor: T.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.md,
  },
  pastOverlay: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  pastOverlayText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  body: { padding: Sizes.paddingLg, gap: 20 },

  title: { ...Typography.h2, color: T.textPrimary },

  meta: { gap: 14, backgroundColor: T.surface, borderRadius: Sizes.radiusLg, padding: Sizes.paddingMd, borderWidth: 1, borderColor: T.cardBorder },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaText: { ...Typography.body, color: T.textSecondary, flex: 1 },

  descSection: {
    backgroundColor: T.surface, borderRadius: Sizes.radiusLg,
    padding: Sizes.paddingMd, gap: 8,
    borderWidth: 1, borderColor: T.cardBorder,
  },
  descTitle: { ...Typography.h4, color: T.textPrimary },
  descText: { ...Typography.body, color: T.textSecondary, lineHeight: 22 },

  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  editBtn: {
    flex: 1, flexDirection: 'row', gap: 8,
    backgroundColor: T.primaryMuted, borderRadius: Sizes.radiusMd,
    padding: 15, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.primary + '25',
  },
  editBtnText: { fontSize: 15, fontWeight: '700', color: T.primary },
  deleteBtn: {
    flex: 1, flexDirection: 'row', gap: 8,
    backgroundColor: T.errorBg, borderRadius: Sizes.radiusMd,
    padding: 15, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: T.error + '25',
  },
  deleteBtnText: { fontSize: 15, fontWeight: '700', color: T.error },

  confirmBox: {
    backgroundColor: T.surface, borderRadius: Sizes.radiusLg,
    padding: Sizes.paddingLg, gap: 16,
    borderWidth: 1, borderColor: T.error + '30',
    ...Shadows.lg,
  },
  confirmText: { ...Typography.body, color: T.textPrimary, fontWeight: '600' },
  confirmRow: { flexDirection: 'row', gap: 12 },
  confirmCancel: {
    flex: 1, backgroundColor: T.surfaceBorder, borderRadius: Sizes.radiusSm,
    padding: 13, alignItems: 'center',
  },
  confirmCancelText: { fontSize: 14, fontWeight: '700', color: T.textSecondary },
  confirmDelete: {
    flex: 1, backgroundColor: T.error, borderRadius: Sizes.radiusSm,
    padding: 13, alignItems: 'center',
  },
  confirmDeleteText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
