import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LightTheme as T, Sizes, Typography } from '@/constants/design-system';
import { AppButton } from './app-button';

interface EmptyStateProps {
  icon: any;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Icon size={28} color={T.textTertiary} />
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
    alignItems: 'center', justifyContent: 'center',
    padding: Sizes.paddingXl, marginVertical: Sizes.gapXl,
  },
  iconBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: T.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Sizes.gapMd,
  },
  title: {
    ...Typography.h4, color: T.textSecondary,
    marginBottom: 4, textAlign: 'center',
  },
  description: {
    ...Typography.bodySm, color: T.textTertiary,
    textAlign: 'center', maxWidth: 280, lineHeight: 20,
  },
  actionWrap: {
    marginTop: Sizes.gapLg,
  },
});
