import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { LightTheme as T, Sizes, Shadows } from '@/constants/design-system';

interface AppCardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function AppCard({ 
  variant = 'elevated', 
  padding = 'md', 
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
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: T.surface,
    borderRadius: Sizes.radiusLg,
  },
  elevated: {
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: T.cardBorder,
  },
  outlined: {
    borderWidth: 1,
    borderColor: T.divider,
  },
  flat: {
    backgroundColor: 'transparent',
  },
  padding_none: { padding: 0 },
  padding_sm: { padding: Sizes.paddingSm },
  padding_md: { padding: Sizes.paddingMd },
  padding_lg: { padding: Sizes.paddingLg },
});
