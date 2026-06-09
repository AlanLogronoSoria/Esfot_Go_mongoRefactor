import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useInfiniteEvents, useDeleteEvent } from '@/features/events/application/event.hooks';
import type { Event } from '@/features/events/domain/event.entity';
import { LightTheme as T, Shadows, Sizes, Typography } from '@/constants/design-system';
import { Edit2, Trash2, Calendar } from 'lucide-react-native';
import { AppCard } from '@/components/ui/app-card';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState } from '@/components/ui/empty-state';

export function EventsAdmin() {
  const { data: events, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, totalCount } = useInfiniteEvents();
  const deleteMutation = useDeleteEvent();

  const handleDelete = (event: Event) => {
    Alert.alert('Eliminar evento', `¿Eliminar "${event.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(event.id) },
    ]);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Eventos ({totalCount})</Text>
      </View>
      {isLoading && <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 20 }} />}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppCard style={s.cardWrapper}>
            <View style={s.cardContent}>
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.cardMeta}>{item.location ?? 'Sin ubicación'} · {new Date(item.startDate).toLocaleDateString('es')}</Text>
            </View>
            <View style={s.actions}>
              <AppButton variant="ghost" size="sm" icon={<Edit2 size={16} color={T.primary} />} onPress={() => {}} />
              <AppButton variant="ghost" size="sm" icon={<Trash2 size={16} color={T.error} />} onPress={() => handleDelete(item)} />
            </View>
          </AppCard>
        )}
        contentContainerStyle={s.list}
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.4}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
        ListEmptyComponent={!isLoading ? <EmptyState icon={Calendar} title="No hay eventos" description="No se han encontrado eventos próximos." /> : null}
        removeClippedSubviews
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { ...Typography.h3, color: T.textPrimary },
  list: { paddingBottom: 40 },
  cardWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 14 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: T.textPrimary },
  cardMeta: { fontSize: 12, color: T.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 4 },
});
