import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  View, Text, TextInput as RNTextInput, Pressable,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { z } from 'zod';
import { strongPasswordSchema, getPasswordStrength } from '@/features/auth/domain/auth.schema';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { PasswordStrength } from '@/features/auth/domain/auth.schema';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const verifyResetToken = useAuthStore((s) => s.verifyResetToken);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const storeLoading = useAuthStore((s) => s.isLoading);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenState, setTokenState] = useState<'verifying' | 'invalid' | 'valid'>('verifying');

  useEffect(() => {
    if (!token) {
      setTokenState('invalid');
      return;
    }
    verifyResetToken(token as string).then((valid) => {
      setTokenState(valid ? 'valid' : 'invalid');
    });
  }, [token, verifyResetToken]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const password = watch('password');
  const strength: PasswordStrength | null = password ? getPasswordStrength(password) : null;

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await resetPassword(token as string, data.password, data.confirmPassword);
      setSuccess(true);
      setTimeout(() => {
        router.replace('/auth/login');
      }, 2500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar la contraseña. Intenta de nuevo.';
      if (message.includes('same as old')) {
        setServerError('La nueva contraseña no puede ser igual a la anterior');
      } else if (message.includes('weak')) {
        setServerError('La contraseña no cumple los requisitos de seguridad');
      } else {
        setServerError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Check size={32} strokeWidth={3} color={T.success} />
        </View>
        <Text style={styles.successTitle}>¡Contraseña actualizada!</Text>
        <Text style={styles.successText}>Redirigiendo al inicio de sesión...</Text>
      </Animated.View>
    );
  }

  if (tokenState === 'verifying') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={T.primary} />
        <Text style={styles.verifyingText}>Verificando enlace...</Text>
      </View>
    );
  }

  if (tokenState === 'invalid') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enlace inválido</Text>
        <Text style={styles.subtitle}>
          El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.replace('/auth/recover');
          }}
        >
          <Text style={styles.buttonText}>Solicitar nuevo enlace</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva contraseña</Text>
      <Text style={styles.subtitle}>
        Elige una contraseña segura para tu cuenta institucional.
      </Text>

      {serverError && (
        <Animated.View entering={FadeIn} style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{serverError}</Text>
        </Animated.View>
      )}

      {strength && (
        <Animated.View entering={FadeIn} style={styles.strengthContainer}>
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
        </Animated.View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Nueva contraseña</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <RNTextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Mínimo 12 caracteres, una mayúscula, una minúscula y un número"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Animated.Text entering={FadeIn} style={styles.errorText}>
            {errors.password.message}
          </Animated.Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Confirmar contraseña</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <RNTextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Repite tu nueva contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.confirmPassword && (
          <Animated.Text entering={FadeIn} style={styles.errorText}>
            {errors.confirmPassword.message}
          </Animated.Text>
        )}
      </View>

      <Pressable
        style={[styles.button, (isLoading || storeLoading) && styles.buttonDisabled]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          handleSubmit(onSubmit)();
        }}
        disabled={isLoading || storeLoading}
      >
        {isLoading || storeLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Actualizar contraseña</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  title: { ...Typography.h2, color: T.textPrimary },
  subtitle: {
    ...Typography.body, color: T.textSecondary,
    lineHeight: 20, marginTop: -12,
  },
  verifyingText: {
    ...Typography.body, textAlign: 'center', marginTop: 12, color: T.textSecondary,
  },
  errorBanner: {
    backgroundColor: T.errorBg, borderRadius: Sizes.radiusSm,
    padding: 12, borderLeftWidth: 4, borderLeftColor: T.error,
  },
  errorBannerText: { ...Typography.bodySm, color: T.error },
  strengthContainer: {
    backgroundColor: T.surface, borderRadius: Sizes.radiusMd,
    padding: 14, borderWidth: 1, borderColor: T.cardBorder,
    gap: 8,
  },
  strengthBarBg: {
    height: 6, backgroundColor: T.surfaceBorder,
    borderRadius: 3, overflow: 'hidden',
  },
  strengthBarFill: { height: '100%', borderRadius: 3 },
  strengthLabel: { ...Typography.bodySm, fontWeight: '700', textAlign: 'center' },
  field: { gap: 6 },
  label: {
    ...Typography.bodySm, fontWeight: '600', color: T.textPrimary,
  },
  input: {
    backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder,
    borderRadius: Sizes.radiusSm, padding: 16,
    fontSize: 15, color: T.inputText,
  },
  inputError: { borderColor: T.error },
  errorText: { ...Typography.caption, color: T.error },
  button: {
    backgroundColor: T.primary, borderRadius: Sizes.radiusSm,
    padding: 16, alignItems: 'center', marginTop: 8,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...Typography.button, color: '#FFFFFF', fontSize: 16 },
  successContainer: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  successIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: T.successBg,
    justifyContent: 'center', alignItems: 'center',
  },
  successTitle: { ...Typography.h2, color: T.success },
  successText: { ...Typography.body, color: T.textSecondary },
});
