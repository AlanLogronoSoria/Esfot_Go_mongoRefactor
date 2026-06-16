import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LightTheme as T, Sizes, Typography } from '@/constants/design-system';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, subtitle, icon, action }: SectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      {icon && (
        <View style={styles.iconWrap}>
          {typeof icon === 'string' ? <Text style={styles.iconEmoji}>{icon}</Text> : icon}
        </View>
      )}
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            action.onPress();
          }}
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.action}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.paddingMd,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: T.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: { fontSize: 20 },
  textWrap: { flex: 1, gap: 2 },
  title: { ...Typography.h4, color: T.textPrimary },
  subtitle: { ...Typography.bodySm, color: T.textSecondary },
  actionBtn: {
    backgroundColor: T.primaryMuted,
    borderRadius: Sizes.radiusSm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  action: { ...Typography.caption, color: T.primary, fontWeight: '700' },
});
