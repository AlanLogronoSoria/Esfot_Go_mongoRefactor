import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_W = SCREEN_W - Sizes.paddingMd * 2;

const MONTHS = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  date: string;
  imageUrl: string | null;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
  category?: string;
}

export function HeroBanner({
  title,
  subtitle,
  date,
  imageUrl,
  actionLabel,
  actionHref,
  onAction,
  category,
}: HeroBannerProps) {
  const scale = useSharedValue(1);
  const d = new Date(date);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()] ?? '';

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 24, stiffness: 360 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAction?.();
  };

  const ctaBtn = (
    <Pressable
      style={styles.cta}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onAction?.();
      }}
    >
      <Text style={styles.ctaText}>{actionLabel}</Text>
    </Pressable>
  );

  const content = (
    <Animated.View style={[styles.card, animStyle]}>
      <View style={styles.imageWrap}>
        <Image
          source={
            imageUrl
              ? { uri: imageUrl }
              : require('@/assets/images/partial-react-logo.png')
          }
          style={styles.image}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['transparent', 'rgba(4,44,92,0.45)', 'rgba(4,44,92,0.95)']}
          style={styles.gradient}
        />
      </View>

      <View style={styles.dateBadge}>
        <Text style={styles.dateMonth}>{month}</Text>
        <Text style={styles.dateDay}>{day}</Text>
      </View>

      <View style={styles.content}>
        {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.category}>{category.toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
        )}

        {actionHref ? (
          <Link href={actionHref as any} asChild>
            <Pressable
              style={styles.cta}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Text style={styles.ctaText}>{actionLabel}</Text>
            </Pressable>
          </Link>
        ) : (
          ctaBtn
        )}
      </View>
    </Animated.View>
  );

  if (onAction) {
    return (
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    width: HERO_W,
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'center',
    ...Shadows.xl,
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  dateBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    ...Shadows.md,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: T.highlight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Sizes.paddingLg,
    gap: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: T.highlight + '22',
    borderWidth: 1,
    borderColor: T.highlight + '44',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: T.highlight,
    letterSpacing: 1.5,
  },
  title: {
    ...Typography.h2,
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 32,
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.78)',
  },
  cta: {
    backgroundColor: T.accent,
    borderRadius: Sizes.radiusMd,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    ...Shadows.md,
  },
  ctaText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontSize: 15,
  },
});
