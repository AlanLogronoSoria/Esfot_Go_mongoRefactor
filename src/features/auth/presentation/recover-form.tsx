import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  View, Text, TextInput as RNTextInput, Pressable,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Mail } from 'lucide-react-native';
import { recoverPasswordSchema } from '@/features/auth/domain/auth.schema';
import type { RecoverPasswordInput } from '@/features/auth/domain/auth.schema';
import { useAuthStore } from '@/store/auth.store';
import { AppError } from '@/core/errors/app-error';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

export function RecoverForm() {
  const recoverPassword = useAuthStore((s) => s.recoverPassword);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverPasswordInput>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: RecoverPasswordInput) => {
    setServerError(null);
    try {
      await recoverPassword(data.email);
      setEmailSent(true);
    } catch (error) {
      if (error instanceof AppError) {
        setServerError(error.toUserMessage());
      } else {
        setServerError('Error al enviar el correo de recuperación. Intenta de nuevo.');
      }
    }
  };

  if (emailSent) {
    return (
      <Animated.View entering={ZoomIn.duration(400)} style={styles.sentContainer}>
        <View style={styles.sentIcon}>
          <Mail size={36} strokeWidth={1.5} color={T.primary} />
        </View>
        <Text style={styles.sentTitle}>Correo enviado</Text>
        <Text style={styles.sentDescription}>
          Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu
          contraseña. Revisa tu bandeja de entrada y la carpeta de spam.
        </Text>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>
        Ingresa tu correo institucional y te enviaremos un enlace para crear una nueva
        contraseña.
      </Text>

      {serverError && (
        <Animated.View entering={FadeIn} style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{serverError}</Text>
        </Animated.View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Correo institucional</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <RNTextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="usuario@epn.edu.ec"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={onBlur}
              onChangeText={(text) => onChange(text.toLowerCase().trim())}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Animated.Text entering={FadeIn} style={styles.errorText}>
            {errors.email.message}
          </Animated.Text>
        )}
      </View>

      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          handleSubmit(onSubmit)();
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Enviar enlace</Text>
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
  errorBanner: {
    backgroundColor: T.errorBg, borderRadius: Sizes.radiusSm,
    padding: 14, borderLeftWidth: 4, borderLeftColor: T.error,
  },
  errorBannerText: { ...Typography.bodySm, color: T.error },
  field: { gap: 6 },
  label: { ...Typography.bodySm, fontWeight: '600', color: T.textPrimary },
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
  sentContainer: {
    alignItems: 'center', paddingVertical: 40, gap: 16,
  },
  sentIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: T.primaryMuted,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.md,
  },
  sentTitle: { ...Typography.h3, color: T.success },
  sentDescription: {
    ...Typography.body, color: T.textSecondary,
    textAlign: 'center', lineHeight: 20, maxWidth: 320,
  },
});
