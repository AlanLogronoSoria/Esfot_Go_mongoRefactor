import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LightTheme as T, Sizes, Typography } from '@/constants/design-system';
import { AppButton } from './app-button';

interface EmptyStateProps {
  icon: any; // Lucide Icon component
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Icon size={32} color={T.textTertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <View style={styles.actionWrap}>
          <AppButton label={actionLabel} onPress={onAction} variant="outline" size="sm" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.paddingXl,
    marginVertical: Sizes.gapLg,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: T.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.gapMd,
  },
  title: {
    ...Typography.h4,
    color: T.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    ...Typography.bodySm,
    color: T.textTertiary,
    textAlign: 'center',
    maxWidth: 250,
  },
  actionWrap: {
    marginTop: Sizes.gapLg,
  },
});
