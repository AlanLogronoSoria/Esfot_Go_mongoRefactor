import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  View, Text, TextInput as RNTextInput, Pressable,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useState, useCallback } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { changePasswordSchema, getPasswordStrength } from '@/features/auth/domain/auth.schema';
import type { ChangePasswordInput, PasswordStrength } from '@/features/auth/domain/auth.schema';
import { useAuthStore } from '@/store/auth.store';
import { useMutation } from '@tanstack/react-query';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

export function ChangePasswordForm() {
  const changePasswordAction = useAuthStore((s) => s.changePassword);
  const [collapsed, setCollapsed] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
    mode: 'onChange',
  });

  const newPassword = watch('newPassword');
  const strength: PasswordStrength | null = newPassword ? getPasswordStrength(newPassword) : null;

  const mutation = useMutation({
    mutationFn: (data: ChangePasswordInput) =>
      changePasswordAction(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setSuccessMessage('Contraseña actualizada correctamente');
      reset();
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const onSubmit = useCallback(
    (data: ChangePasswordInput) => {
      mutation.reset();
      setSuccessMessage(null);
      mutation.mutate(data);
    },
    [mutation]
  );

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setCollapsed(!collapsed);
        }}
      >
        <Text style={styles.headerText}>Cambiar contraseña</Text>
        {collapsed ? (
          <ChevronRight size={18} strokeWidth={2} color={T.textTertiary} />
        ) : (
          <ChevronDown size={18} strokeWidth={2} color={T.textTertiary} />
        )}
      </Pressable>

      {!collapsed && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.form}>
          {mutation.isError && (
            <Animated.View entering={FadeIn} style={styles.errorBanner}>
              <Text style={styles.errorText}>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Error al cambiar la contraseña'}
              </Text>
            </Animated.View>
          )}

          {successMessage && (
            <Animated.View entering={FadeIn} style={styles.successBanner}>
              <Text style={styles.successText}>{successMessage}</Text>
            </Animated.View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña actual</Text>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput
                  style={[styles.input, errors.currentPassword && styles.inputError]}
                  placeholder="••••••••"
                  placeholderTextColor={T.inputPlaceholder}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.currentPassword && (
              <Text style={styles.fieldError}>{errors.currentPassword.message}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nueva contraseña</Text>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput
                  style={[styles.input, errors.newPassword && styles.inputError]}
                  placeholder="Crea una contraseña fuerte"
                  placeholderTextColor={T.inputPlaceholder}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.newPassword && (
              <Text style={styles.fieldError}>{errors.newPassword.message}</Text>
            )}
          </View>

          {strength && newPassword.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={styles.strengthBarBg}>
                <Animated.View
                  style={[
                    styles.strengthBarFill,
                    {
                      width: `${(strength.score / 4) * 100}%`,
                      backgroundColor: strength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Confirmar nueva contraseña</Text>
            <Controller
              control={control}
              name="confirmNewPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput
                  style={[styles.input, errors.confirmNewPassword && styles.inputError]}
                  placeholder="Repite tu nueva contraseña"
                  placeholderTextColor={T.inputPlaceholder}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.confirmNewPassword && (
              <Text style={styles.fieldError}>{errors.confirmNewPassword.message}</Text>
            )}
          </View>

          <Pressable
            style={[styles.button, mutation.isPending && styles.buttonDisabled]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleSubmit(onSubmit)();
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Actualizar contraseña</Text>
            )}
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 0 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 4,
  },
  headerText: { ...Typography.body, fontWeight: '600', color: T.primary },
  form: { gap: 16, marginTop: 12 },
  errorBanner: {
    backgroundColor: T.errorBg, borderRadius: Sizes.radiusSm,
    padding: 10, borderLeftWidth: 3, borderLeftColor: T.error,
  },
  errorText: { ...Typography.caption, color: T.error },
  successBanner: {
    backgroundColor: T.successBg, borderRadius: Sizes.radiusSm,
    padding: 10, borderLeftWidth: 3, borderLeftColor: T.success,
  },
  successText: { ...Typography.caption, color: T.success, fontWeight: '600' },
  field: { gap: 4 },
  label: { ...Typography.overline, color: T.textSecondary },
  input: {
    backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder,
    borderRadius: Sizes.radiusSm, padding: 12,
    fontSize: 14, color: T.inputText,
  },
  inputError: { borderColor: T.error },
  fieldError: { ...Typography.caption, color: T.error },
  strengthRow: { gap: 6 },
  strengthBarBg: {
    height: 4, backgroundColor: T.surfaceBorder,
    borderRadius: 2, overflow: 'hidden',
  },
  strengthBarFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { ...Typography.caption, fontWeight: '700', textAlign: 'right' },
  button: {
    backgroundColor: T.primary, borderRadius: Sizes.radiusSm,
    padding: 14, alignItems: 'center', marginTop: 4,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...Typography.button, color: '#FFFFFF', fontSize: 14 },
});
