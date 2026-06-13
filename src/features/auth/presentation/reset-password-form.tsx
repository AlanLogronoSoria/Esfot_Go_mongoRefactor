import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { z } from 'zod';
import { strongPasswordSchema, getPasswordStrength } from '@/features/auth/domain/auth.schema';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { PasswordStrength } from '@/features/auth/domain/auth.schema';

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
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>¡Contraseña actualizada!</Text>
        <Text style={styles.successText}>Redirigiendo al inicio de sesión...</Text>
      </Animated.View>
    );
  }

  if (tokenState === 'verifying') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00205B" />
        <Text style={{ textAlign: 'center', marginTop: 12, color: '#6B7280' }}>Verificando enlace...</Text>
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
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/auth/recover')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Solicitar nuevo enlace</Text>
        </TouchableOpacity>
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

      <TouchableOpacity
        style={[styles.button, (isLoading || storeLoading) && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading || storeLoading}
        activeOpacity={0.8}
      >
        {isLoading || storeLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Actualizar contraseña</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: -12,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorBannerText: {
    color: '#991B1B',
    fontSize: 14,
  },
  strengthContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  strengthBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#00205B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  successIcon: {
    fontSize: 48,
    color: '#059669',
    backgroundColor: '#D1FAE5',
    width: 80,
    height: 80,
    lineHeight: 80,
    textAlign: 'center',
    borderRadius: 40,
    overflow: 'hidden',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
  },
  successText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
