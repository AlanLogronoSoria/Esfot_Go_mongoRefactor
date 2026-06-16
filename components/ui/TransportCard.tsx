import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { Bus, ChevronRight } from 'lucide-react-native';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';
import type { BusRoute } from '@/features/polibus/domain/route.entity';

interface TransportCardProps {
  routes: BusRoute[];
  activeRoutes: number;
}

export function TransportCard({ routes, activeRoutes }: TransportCardProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 24, stiffness: 360 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Link href="/polibus" asChild>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.card, animStyle]}>
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Bus size={20} strokeWidth={2} color={T.highlight} />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>Polibus</Text>
              <Text style={styles.subtitle}>
                {activeRoutes} ruta{activeRoutes !== 1 ? 's' : ''} activa{activeRoutes !== 1 ? 's' : ''}
              </Text>
            </View>
            <ChevronRight size={20} strokeWidth={2} color={T.textTertiary} />
          </View>

          {routes.length > 0 && (
            <View style={styles.routeList}>
              {routes.slice(0, 3).map((r) => (
                <View key={r.id} style={styles.routeItem}>
                  <View style={[styles.routeDot, { backgroundColor: r.color }]} />
                  <Text style={styles.routeName} numberOfLines={1}>{r.name}</Text>
                  <View style={[styles.routeBadge, r.isActive ? styles.routeBadgeActive : styles.routeBadgeInactive]}>
                    <Text style={[styles.routeBadgeText, r.isActive ? styles.routeBadgeTextActive : styles.routeBadgeTextInactive]}>
                      {r.isActive ? 'Activa' : 'Inactiva'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderRadius: Sizes.radiusLg,
    padding: Sizes.paddingLg,
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.md,
    gap: Sizes.gapMd,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: T.highlightMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  title: { ...Typography.h4, color: T.textPrimary },
  subtitle: { ...Typography.bodySm, color: T.textSecondary },
  routeList: {
    borderTopWidth: 1,
    borderTopColor: T.divider,
    paddingTop: Sizes.gapSm,
    gap: 10,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    ...Shadows.xs,
  },
  routeName: {
    ...Typography.bodySm,
    color: T.textPrimary,
    flex: 1,
  },
  routeBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  routeBadgeActive: {
    backgroundColor: T.successBg,
  },
  routeBadgeInactive: {
    backgroundColor: T.neutralMuted,
  },
  routeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  routeBadgeTextActive: {
    color: T.success,
  },
  routeBadgeTextInactive: {
    color: T.textTertiary,
  },
});
