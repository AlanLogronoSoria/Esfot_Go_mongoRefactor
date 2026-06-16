import React from 'react';
import { View, StyleSheet, type ViewProps, ActivityIndicator } from 'react-native';
import { LightTheme as T, Sizes, Shadows } from '@/constants/design-system';

interface AppCardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function AppCard({
  variant = 'elevated',
  padding = 'md',
  loading,
  style,
  children,
  ...props
}: AppCardProps) {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`padding_${padding}`],
        style,
      ]}
      {...props}
    >
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={T.primary} />
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: T.surface,
    borderRadius: Sizes.radiusLg,
  },
  elevated: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.md,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: T.cardBorder,
  },
  flat: {
    backgroundColor: 'transparent',
  },
  glass: {
    backgroundColor: T.surfaceGlass,
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.md,
  },
  padding_none: { padding: 0 },
  padding_sm: { padding: Sizes.paddingSm },
  padding_md: { padding: Sizes.paddingMd },
  padding_lg: { padding: Sizes.paddingLg },
  loader: {
    padding: Sizes.paddingXl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
