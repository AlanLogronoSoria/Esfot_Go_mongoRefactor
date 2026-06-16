import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  Alert, Pressable, Modal,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useAulas } from '@/features/aulas/application/aulas.hooks';
import { useDeleteAula } from '@/features/aulas/application/aulas-admin.hooks';
import { AulaForm } from './aula-form';
import type { Aula } from '@/services/express/express-types';
import * as Haptics from 'expo-haptics';
import { LightTheme as T, Sizes, Typography, Shadows } from '@/constants/design-system';
import { Edit2, Trash2, DoorOpen, X } from 'lucide-react-native';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState } from '@/components/ui/empty-state';

export function AulasAdmin() {
  const { data: aulas, isLoading, isRefetching, refetch } = useAulas();
  const deleteMutation = useDeleteAula();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Aula | null>(null);

  const handleCreate = useCallback(() => {
    setEditTarget(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((aula: Aula) => {
    setEditTarget(aula);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditTarget(null);
  }, []);

  const handleDelete = useCallback((aula: Aula) => {
    Alert.alert('Eliminar aula', `¿Eliminar "${aula.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(aula._id),
      },
    ]);
  }, [deleteMutation]);

  const aulasList = aulas ?? [];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Aulas ({aulasList.length})</Text>
        <Pressable style={s.createBtn} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handleCreate();
        }}>
          <Text style={s.createBtnText}>+ Crear</Text>
        </Pressable>
      </View>

      {isLoading && (
        <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 20 }} />
      )}

      <FlashList
        data={aulasList}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <AppCard style={s.cardWrapper}>
            <View style={s.cardContent}>
              <Text style={s.cardTitle} numberOfLines={1}>{item.nombre}</Text>
              <Text style={s.cardMeta}>
                {item.ubicacion ?? 'Sin ubicación'}
                {item.capacidad ? `  ·  ${item.capacidad} personas` : ''}
              </Text>
              {item.estado && (
                <View style={[s.estadoBadge, item.estado === 'disponible' ? s.estadoDisponible : item.estado === 'ocupado' ? s.estadoOcupado : s.estadoMantenimiento]}>
                  <Text style={s.estadoText}>{item.estado}</Text>
                </View>
              )}
            </View>
            <View style={s.actions}>
              <AppButton label="" variant="ghost" size="sm" icon={<Edit2 size={16} color={T.primary} />} onPress={() => handleEdit(item)} />
              <AppButton label="" variant="ghost" size="sm" icon={<Trash2 size={16} color={T.error} />} onPress={() => handleDelete(item)} />
            </View>
          </AppCard>
        )}
        contentContainerStyle={s.list}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={DoorOpen}
              title="No hay aulas"
              description="No se han encontrado aulas registradas."
            />
          ) : null
        }
      />

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseForm}
      >
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{editTarget ? 'Editar aula' : 'Crear aula'}</Text>
          <Pressable onPress={handleCloseForm} style={s.modalCloseBtn}>
            <X size={16} strokeWidth={2.2} color={T.textSecondary} />
          </Pressable>
        </View>
        <AulaForm
          onClose={handleCloseForm}
          onSuccess={() => refetch()}
          editData={editTarget ?? undefined}
        />
      </Modal>
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
  estadoBadge: {
    alignSelf: 'flex-start', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 6,
  },
  estadoDisponible: { backgroundColor: T.successBg },
  estadoOcupado: { backgroundColor: T.errorBg },
  estadoMantenimiento: { backgroundColor: T.warningBg },
  estadoText: {
    ...Typography.caption, fontWeight: '600', textTransform: 'capitalize',
    color: T.textSecondary,
  },
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
