import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  Pressable, Modal,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Toast from 'react-native-toast-message';
import { useInfiniteEvents, useDeleteEvent } from '@/features/events/application/event.hooks';
import { EventForm } from './event-form';
import type { Event } from '@/features/events/domain/event.entity';
import * as Haptics from 'expo-haptics';
import { LightTheme as T, Shadows, Sizes, Typography } from '@/constants/design-system';
import { Edit2, Trash2, Calendar, X } from 'lucide-react-native';
import { useConfirmDelete } from '@/core/components/confirm-toast';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState } from '@/components/ui/empty-state';

export function EventsAdmin() {
  const { data: events, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, totalCount } = useInfiniteEvents();
  const deleteMutation = useDeleteEvent();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Event | null>(null);

  const { confirmDelete, ConfirmDialog } = useConfirmDelete();

  const handleCreate = useCallback(() => {
    setEditTarget(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((event: Event) => {
    setEditTarget(event);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditTarget(null);
  }, []);

  const handleDelete = useCallback(async (event: Event) => {
    const ok = await confirmDelete('Eliminar evento', `Eliminar "${event.title}"?`);
    if (ok) {
      try {
        await deleteMutation.mutateAsync(event.id);
        Toast.show({ type: 'success', text1: 'Eliminado', text2: 'El evento ha sido eliminado' });
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar el evento' });
      }
    }
  }, [deleteMutation, confirmDelete]);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Eventos ({totalCount})</Text>
        <Pressable style={s.createBtn} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handleCreate();
        }}>
          <Text style={s.createBtnText}>+ Crear</Text>
        </Pressable>
      </View>
      {isLoading && <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 20 }} />}
      <FlashList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppCard style={s.cardWrapper}>
            <View style={s.cardContent}>
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.cardMeta}>{item.location ?? 'Sin ubicación'} · {new Date(item.startDate).toLocaleDateString('es')}</Text>
            </View>
            <View style={s.actions}>
              <AppButton label="" variant="ghost" size="sm" icon={<Edit2 size={16} color={T.primary} />} onPress={() => handleEdit(item)} />
              <AppButton label="" variant="ghost" size="sm" icon={<Trash2 size={16} color={T.error} />} onPress={() => handleDelete(item)} />
            </View>
          </AppCard>
        )}
        contentContainerStyle={s.list}
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.4}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
        ListEmptyComponent={!isLoading ? <EmptyState icon={Calendar} title="No hay eventos" description="No se han encontrado eventos próximos." /> : null}
      />

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseForm}
      >
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{editTarget ? 'Editar evento' : 'Crear evento'}</Text>
          <Pressable onPress={handleCloseForm} style={s.modalCloseBtn}>
            <X size={16} strokeWidth={2.2} color={T.textSecondary} />
          </Pressable>
        </View>
        <EventForm
          onClose={handleCloseForm}
          onSuccess={() => refetch()}
          editEvent={editTarget ?? undefined}
        />
      </Modal>
      {ConfirmDialog}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  title: { ...Typography.h3, color: T.textPrimary },
  createBtn: {
    backgroundColor: T.primary, borderRadius: Sizes.radiusSm,
    paddingHorizontal: 16, paddingVertical: 10,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.25,
  },
  createBtnText: { ...Typography.caption, fontWeight: '700', color: '#FFFFFF' },
  list: { paddingBottom: 40 },
  cardWrapper: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 8, padding: 14,
  },
  cardContent: { flex: 1 },
  cardTitle: { ...Typography.body, fontWeight: '700', color: T.textPrimary },
  cardMeta: { ...Typography.caption, color: T.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 4 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  modalTitle: { ...Typography.h3, color: T.textPrimary },
  modalCloseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.surfaceBorder,
    justifyContent: 'center', alignItems: 'center',
  },
});
