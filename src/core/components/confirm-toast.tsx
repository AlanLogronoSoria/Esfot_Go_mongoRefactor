import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

interface ConfirmToastProps {
  title: string;
  message: string;
}

export function useConfirmDelete() {
  const [state, setState] = useState<(ConfirmToastProps & { onConfirm: () => void; onCancel: () => void }) | null>(null);

  const confirmDelete = useCallback(
    (title: string, message: string) =>
      new Promise<boolean>((resolve) => {
        setState({
          title,
          message,
          onConfirm: () => { resolve(true); setState(null); },
          onCancel: () => { resolve(false); setState(null); },
        });
      }),
    [],
  );

  const ConfirmDialog = state ? (
    <Modal visible transparent animationType="fade" onRequestClose={state.onCancel}>
      <Pressable style={s.overlay} onPress={state.onCancel}>
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={s.card}>
          <Text style={s.title}>{state.title}</Text>
          <Text style={s.message}>{state.message}</Text>
          <View style={s.row}>
            <Pressable style={s.cancelBtn} onPress={state.onCancel}>
              <Text style={s.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable style={s.confirmBtn} onPress={state.onConfirm}>
              <Text style={s.confirmText}>Eliminar</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  ) : null;

  return { confirmDelete, ConfirmDialog };
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: T.overlay,
    justifyContent: 'center', alignItems: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusXl, padding: 24,
    width: '100%', maxWidth: 340, gap: 16,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.xl,
  },
  title: { ...Typography.h4, color: T.textPrimary },
  message: { ...Typography.body, color: T.textSecondary, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: Sizes.radiusSm,
    backgroundColor: T.surfaceBorder, alignItems: 'center',
  },
  cancelText: { ...Typography.body, fontWeight: '600', color: T.textSecondary },
  confirmBtn: {
    flex: 1, padding: 14, borderRadius: Sizes.radiusSm,
    backgroundColor: T.error, alignItems: 'center',
    ...Shadows.sm,
  },
  confirmText: { ...Typography.button, color: '#FFFFFF', fontSize: 14 },
});
