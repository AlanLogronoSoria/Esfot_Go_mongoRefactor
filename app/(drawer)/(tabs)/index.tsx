import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useAnimatedScrollHandler, useSharedValue, FadeInDown,
  useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/store/auth.store';
import { UserEntity } from '@/features/auth/domain/user.entity';
import { useInfiniteEvents } from '@/features/events/application/event.hooks';
import { useBusRoutes } from '@/features/polibus/application/bus.hooks';
import { useLocation } from '@/hooks/useLocation';
import { GpsPermissionPrompt } from '@/features/auth/presentation/gps-permission-prompt';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';
import { Map, Bus, Calendar, User, MapPin, CalendarDays, Building2 } from 'lucide-react-native';
import { GlassHeader } from '@/components/ui/GlassHeader';
import { CategoryChip, type Category } from '@/components/ui/CategoryChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { EventCard } from '@/components/ui/EventCard';
import { TransportCard } from '@/components/ui/TransportCard';
import { LocationCard } from '@/components/ui/LocationCard';

const CATEGORIES: Category[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'academico', label: 'Academicos' },
  { key: 'deportivo', label: 'Deportes' },
  { key: 'cultural', label: 'Cultura' },
];

const QUICK_ACTIONS = [
  { Icon: Map, label: 'Mapa', route: '/map', color: T.success },
  { Icon: Bus, label: 'Polibus', route: '/polibus', color: T.highlight },
  { Icon: Calendar, label: 'Eventos', route: '/events', color: T.info },
  { Icon: User, label: 'Perfil', route: '/profile', color: T.accent },
] as const;

function QuickActionCard({ item }: { item: (typeof QUICK_ACTIONS)[number] }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Link href={item.route as any} asChild>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.94, { damping: 20, stiffness: 400 }); }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 300 });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View style={[styles.quickCard, animStyle]}>
          <View style={[styles.quickIcon, { backgroundColor: item.color + '18' }]}>
            <item.Icon size={22} color={item.color} strokeWidth={2} />
          </View>
          <Text style={styles.quickLabel}>{item.label}</Text>
        </Animated.View>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { showGpsPrompt } = useLocalSearchParams<{ showGpsPrompt?: string }>();
  const ue = user ? new UserEntity(user) : null;
  const { data: events, isLoading: eventsLoading, error: eventsError } = useInfiniteEvents();
  const { data: routes, error: routesError } = useBusRoutes();
  const { location, error: locationError } = useLocation();

  if (eventsError) console.log('[HomeScreen] Error cargando eventos');
  if (routesError) console.log('[HomeScreen] Error cargando rutas');
  if (locationError) console.log('[HomeScreen] Error de ubicacion');

  const scrollY = useSharedValue(0);
  const [activeCategory, setActiveCategory] = React.useState('todos');
  const fabScale = useSharedValue(1);

  const onScroll = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });

  const fabAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (activeCategory === 'todos') return events;
    return events.filter((e) => (e as any).category === activeCategory);
  }, [events, activeCategory]);

  const activeRoutes = useMemo(() => (routes ?? []).filter((r) => r.isActive).length, [routes]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[T.primary, T.primaryLight, T.background]}
        locations={[0, 0.25, 1]}
        style={styles.heroBg}
      />

      <GlassHeader
        scrollY={scrollY}
        userName={ue?.displayName}
        userInitials={ue?.initials}
        userAvatar={(user as any)?.avatarUrl ?? null}
        onAvatarPress={() => router.push('/profile' as any)}
      />

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(500)} style={[styles.greeting, { paddingTop: insets.top + 56 }]}>
          <Text style={styles.greetingText}>
            {ue ? `Hola, ${ue.displayName}` : 'Bienvenido a'}
          </Text>
          <Text style={styles.appName}>ESFOTgo</Text>
          <Text style={styles.tagline}>Tu guia inteligente para navegar el campus</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.quickActions}>
          {QUICK_ACTIONS.map((item) => (
            <QuickActionCard key={item.route} item={item} />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140)} style={styles.categoriesWrap}>
          <CategoryChip categories={CATEGORIES} activeKey={activeCategory} onSelect={setActiveCategory} />
        </Animated.View>

        {filteredEvents.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180).duration(500)} style={styles.heroWrap}>
            <HeroBanner
              title={filteredEvents[0].title}
              subtitle={filteredEvents[0].description ?? undefined}
              date={filteredEvents[0].startDate}
              imageUrl={filteredEvents[0].imageUrl}
              actionLabel="Ver evento"
              actionHref="/events"
              category={(filteredEvents[0] as any).category}
            />
          </Animated.View>
        )}

        {routes && routes.length > 0 && (
          <Animated.View entering={FadeInDown.delay(220)} style={styles.section}>
            <SectionHeader
              title="Transporte"
              icon={<Bus size={20} strokeWidth={2} color={T.highlight} />}
            />
            <TransportCard routes={routes} activeRoutes={activeRoutes} />
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(260)} style={styles.section}>
          <SectionHeader
            title="Campus"
            icon={<Building2 size={20} strokeWidth={2} color={T.primary} />}
          />
          <LocationCard
            location={
              location
                ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
                : null
            }
          />
        </Animated.View>

        {filteredEvents.length > 1 && (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <SectionHeader
              title="Proximos eventos"
              subtitle="Descubre lo que esta pasando en el campus"
              icon={<CalendarDays size={20} strokeWidth={2} color={T.accent} />}
              action={{ label: 'Ver todos', onPress: () => router.push('/events' as any) }}
            />
            {filteredEvents.slice(1, 5).map((evt, i) => (
              <Animated.View
                key={evt.id}
                entering={FadeInDown.delay(320 + i * 80).duration(400)}
                style={{ marginTop: i > 0 ? Sizes.gapSm : 0 }}
              >
                <EventCard event={evt} onPress={() => router.push('/events' as any)} />
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {eventsLoading && !events?.length && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={T.primary} />
          </View>
        )}

        {!user && (
          <Animated.View entering={FadeInDown.delay(420)} style={styles.authPrompt}>
            <View style={styles.authIconWrap}>
              <User size={28} strokeWidth={1.8} color={T.primary} />
            </View>
            <Text style={styles.authText}>
              Inicia sesion para acceder a todas las funcionalidades
            </Text>
            <Link href="/auth/login" asChild>
              <Pressable
                onPressIn={() => { fabScale.value = withSpring(0.96, { damping: 20, stiffness: 400 }); }}
                onPressOut={() => {
                  fabScale.value = withSpring(1, { damping: 18, stiffness: 300 });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <Animated.View style={[styles.authBtn, fabAnimStyle]}>
                  <Text style={styles.authBtnText}>Iniciar sesion</Text>
                </Animated.View>
              </Pressable>
            </Link>
          </Animated.View>
        )}

        {showGpsPrompt === '1' && user && <GpsPermissionPrompt />}
      </Animated.ScrollView>

      <Animated.View style={[styles.fabWrap, { bottom: insets.bottom + 96 }, fabAnimStyle]}>
        <Link href="/map" asChild>
          <Pressable
            onPressIn={() => { fabScale.value = withSpring(0.88, { damping: 16, stiffness: 360 }); }}
            onPressOut={() => {
              fabScale.value = withSpring(1, { damping: 20, stiffness: 300 });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            style={styles.fab}
          >
            <MapPin size={22} strokeWidth={2.2} color="#FFFFFF" />
          </Pressable>
        </Link>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.background },
  heroBg: {
    position: 'absolute',
    top: -140,
    left: 0,
    right: 0,
    height: 480,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8 },

  greeting: {
    paddingHorizontal: Sizes.paddingMd,
    gap: 4,
    marginBottom: Sizes.gapXl,
  },
  greetingText: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  appName: {
    ...Typography.display,
    color: '#FFFFFF',
    fontSize: 40,
  },
  tagline: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 4,
  },

  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Sizes.paddingMd,
    gap: 10,
    marginBottom: Sizes.gapLg,
  },
  quickCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: Sizes.radiusLg,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    ...Shadows.md,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    ...Typography.caption,
    color: T.textSecondary,
    fontWeight: '600',
  },

  categoriesWrap: { marginBottom: Sizes.gapMd },
  heroWrap: { marginBottom: Sizes.gapMd },

  section: {
    paddingHorizontal: Sizes.paddingMd,
    marginBottom: Sizes.gapLg,
    gap: Sizes.gapSm,
  },

  loadingSection: { paddingVertical: 60, alignItems: 'center' },

  authPrompt: {
    margin: Sizes.paddingMd,
    marginTop: Sizes.gapLg,
    padding: Sizes.paddingXl,
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusXl,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.md,
  },
  authIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: T.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  authText: {
    ...Typography.body,
    color: T.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
  },
  authBtn: {
    backgroundColor: T.primary,
    borderRadius: Sizes.radiusMd,
    paddingHorizontal: 32,
    paddingVertical: 14,
    ...Shadows.md,
    shadowColor: T.primary,
    shadowOpacity: 0.3,
  },
  authBtnText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontSize: 15,
  },

  fabWrap: {
    position: 'absolute',
    right: 20,
    zIndex: 40,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: T.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.xl,
  },
});
