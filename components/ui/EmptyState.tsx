import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LightTheme as T, Sizes, Typography, Shadows } from '@/constants/design-system';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  delay?: number;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  delay = 0,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500)}
      style={styles.container}
    >
      <View style={styles.iconWrap}>
        {typeof icon === 'string' ? <Text style={styles.iconEmoji}>{icon}</Text> : (icon ?? <Text style={styles.iconEmoji}>📭</Text>)}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Pressable style={styles.btn} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: Sizes.paddingXl,
    gap: Sizes.gapMd,
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: T.surfaceBorder,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  iconEmoji: { fontSize: 36 },
  title: { ...Typography.h4, color: T.textPrimary, textAlign: 'center' },
  subtitle: { ...Typography.bodySm, color: T.textSecondary, textAlign: 'center', lineHeight: 20 },
  btn: {
    marginTop: 8, backgroundColor: T.primary,
    borderRadius: Sizes.radiusMd, paddingHorizontal: 28, paddingVertical: 13,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  btnText: { ...Typography.button, color: '#FFFFFF', fontSize: 14 },
});
