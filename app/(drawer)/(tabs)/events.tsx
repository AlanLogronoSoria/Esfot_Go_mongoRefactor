import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, FlatList, Modal, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  FadeInDown,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useInfiniteEvents } from '@/features/events/application/event.hooks';
import { EventCardSkeleton } from '@/features/events/presentation/event-skeleton';
import { EventForm } from '@/features/events/presentation/event-form';
import { EventDetailModal } from '@/features/events/presentation/event-detail';
import type { Event, EventDateFilter } from '@/features/events/domain/event.entity';
import { GlassInput } from '@/shared/components/premium';
import { LightTheme as T, Sizes, Typography } from '@/constants/design-system';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { CategoryChip, type Category } from '@/components/ui/CategoryChip';
import { EventCard } from '@/components/ui/EventCard';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission } from '@/constants/roles';

const SKELETONS = 3;

const DATE_FILTERS: Category[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'proximos', label: 'Proximos' },
  { key: 'este_mes', label: 'Este mes' },
  { key: 'pasados', label: 'Pasados' },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function EventsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canCreate = user && hasPermission(user.role, 'create:events');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<EventDateFilter>('todos');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [detailEvent, setDetailEvent] = useState<Event | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);

  const {
    data: events,
    setSearch: doSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
    totalCount,
    error,
  } = useInfiniteEvents(search || undefined, filter);

  if (error) console.log('[EventsScreen] Error cargando eventos:', (error as Error)?.message ?? error);

  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const handleEventPress = useCallback((event: Event) => {
    setDetailEvent(event);
  }, []);

  const handleEditFromDetail = useCallback((event: Event) => {
    setDetailEvent(null);
    setEditEvent(event);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowCreateModal(false);
    setEditEvent(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <EventCard event={item} onPress={handleEventPress} />
    ),
    [handleEventPress]
  );

  const keyFn = useCallback((item: Event) => item.id, []);

  return (
    <View style={styles.root}>
      <GlassHeader
        scrollY={scrollY}
        onAvatarPress={() => router.push('/profile' as any)}
      />

      <AnimatedFlatList
        data={events}
        renderItem={renderItem as any}
        keyExtractor={keyFn as any}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View>
            <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Eventos</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{totalCount}</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>
                Descubre lo que esta pasando en el campus
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100)} style={styles.searchWrap}>
              <GlassInput
                icon="🔍"
                placeholder="Buscar eventos..."
                value={search}
                onChangeText={(t: string) => {
                  setSearch(t);
                  doSearch(t);
                }}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150)} style={styles.filterWrap}>
              <CategoryChip
                categories={DATE_FILTERS}
                activeKey={filter}
                onSelect={(key) => setFilter(key as EventDateFilter)}
              />
            </Animated.View>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <Text style={styles.footer}>Cargando mas...</Text>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skels}>
              {Array.from({ length: SKELETONS }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No se encontraron eventos</Text>
              <Text style={styles.emptySubtext}>
                Intenta con otros filtros o terminos de busqueda
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={T.primary}
            colors={[T.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={5}
        windowSize={7}
        initialNumToRender={5}
      />

      {canCreate && (
        <FloatingActionButton icon="+" onPress={() => setShowCreateModal(true)} bottom={90} right={20} />
      )}

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crear evento</Text>
            <TouchableOpacity onPress={handleCloseForm} activeOpacity={0.7}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <EventForm onClose={handleCloseForm} />
        </View>
      </Modal>

      <Modal
        visible={!!editEvent}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar evento</Text>
            <TouchableOpacity onPress={handleCloseForm} activeOpacity={0.7}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          {editEvent && <EventForm onClose={handleCloseForm} editEvent={editEvent} />}
        </View>
      </Modal>

      <Modal
        visible={!!detailEvent}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailEvent(null)}
      >
        {detailEvent && (
          <EventDetailModal
            event={detailEvent}
            onClose={() => setDetailEvent(null)}
            onEdit={handleEditFromDetail}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.background },
  list: { paddingBottom: 100 },

  header: {
    paddingHorizontal: Sizes.paddingMd,
    paddingTop: 72,
    paddingBottom: Sizes.gapSm,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: { ...Typography.h2, color: T.textPrimary },
  countBadge: {
    backgroundColor: T.primaryMuted,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: T.primary,
  },
  subtitle: { ...Typography.body, color: T.textSecondary },

  searchWrap: { paddingHorizontal: Sizes.paddingMd, paddingBottom: Sizes.gapSm },

  filterWrap: { marginBottom: Sizes.gapMd },

  skels: { paddingHorizontal: Sizes.paddingMd },

  footer: {
    textAlign: 'center',
    color: T.textSecondary,
    padding: Sizes.paddingMd,
    fontSize: 13,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Sizes.paddingMd,
    gap: 8,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { ...Typography.h4, color: T.textSecondary },
  emptySubtext: { ...Typography.bodySm, color: T.textTertiary, textAlign: 'center' },

  modalContainer: { flex: 1, backgroundColor: T.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Sizes.paddingLg,
    paddingTop: Sizes.paddingLg,
    paddingBottom: Sizes.paddingMd,
    borderBottomWidth: 1,
    borderBottomColor: T.divider,
  },
  modalTitle: { ...Typography.h3, color: T.textPrimary },
  modalClose: { fontSize: 22, color: T.textSecondary, fontWeight: '700' },
});
