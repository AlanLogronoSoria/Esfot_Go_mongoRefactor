import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LightTheme as T, Shadows, Sizes, Typography } from '@/constants/design-system';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmStyle?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible, title, message, confirmLabel = 'Confirmar',
  confirmStyle = 'primary', isLoading = false,
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCancel();
              }}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[
                styles.confirmBtn,
                confirmStyle === 'danger' && styles.confirmDanger,
                isLoading && styles.confirmDisabled,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onConfirm();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: T.overlay,
    justifyContent: 'center', alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusXl,
    padding: 24, width: '100%', maxWidth: 340,
    gap: 18, borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.xl,
  },
  title: { ...Typography.h4, color: T.textPrimary },
  message: { ...Typography.body, color: T.textSecondary, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: Sizes.radiusSm,
    backgroundColor: T.surfaceBorder, alignItems: 'center',
    borderWidth: 1, borderColor: T.cardBorder,
  },
  cancelText: { ...Typography.body, fontWeight: '600', color: T.textSecondary },
  confirmBtn: {
    flex: 1, padding: 14, borderRadius: Sizes.radiusSm,
    backgroundColor: T.primary, alignItems: 'center',
    ...Shadows.sm, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  confirmDanger: {
    backgroundColor: T.error,
    shadowColor: T.error,
  },
  confirmDisabled: { opacity: 0.6 },
  confirmText: { ...Typography.button, color: '#FFFFFF', fontSize: 14 },
});
