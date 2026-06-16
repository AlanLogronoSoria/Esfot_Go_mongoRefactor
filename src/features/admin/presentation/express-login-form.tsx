import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  View,
  Text,
  TextInput as RNTextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { z } from 'zod';
import { useExpressAuthStore } from '@/services/express/express-auth.store';
import { useRouter } from 'expo-router';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

const expressLoginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Formato inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type ExpressLoginInputForm = z.infer<typeof expressLoginSchema>;

interface ExpressLoginFormProps {
  role: 'estudiante' | 'admin';
  onSuccess?: () => void;
}

export function ExpressLoginForm({ role, onSuccess }: ExpressLoginFormProps) {
  const router = useRouter();
  const loginEstudiante = useExpressAuthStore((s) => s.loginEstudiante);
  const loginAdmin = useExpressAuthStore((s) => s.loginAdmin);
  const isLoading = useExpressAuthStore((s) => s.isLoading);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpressLoginInputForm>({
    resolver: zodResolver(expressLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: ExpressLoginInputForm) => {
    setServerError(null);
    try {
      if (role === 'admin') {
        await loginAdmin(data);
      } else {
        await loginEstudiante(data);
      }
      onSuccess?.();
      router.back();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  const title =
    role === 'admin'
      ? 'Acceso Administrador'
      : 'Acceso Estudiante';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {serverError && (
        <Animated.View entering={FadeIn} style={styles.errorBanner}>
          <Text style={styles.errorText}>{serverError}</Text>
        </Animated.View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Correo</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <RNTextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="correo@epn.edu.ec"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Contraseña</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <RNTextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}
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
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18 },
  title: {
    ...Typography.h3, color: T.textPrimary, textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: T.errorBg, borderRadius: Sizes.radiusSm,
    padding: 12, borderLeftWidth: 4, borderLeftColor: T.error,
  },
  errorText: { ...Typography.bodySm, color: T.error },
  field: { gap: 6 },
  label: {
    ...Typography.bodySm, fontWeight: '600', color: T.textPrimary,
  },
  input: {
    backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder,
    borderRadius: Sizes.radiusSm, padding: 14,
    fontSize: 15, color: T.inputText,
  },
  inputError: { borderColor: T.error },
  fieldError: { ...Typography.caption, color: T.error },
  button: {
    backgroundColor: T.primary, borderRadius: Sizes.radiusSm,
    padding: 16, alignItems: 'center', marginTop: 8,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...Typography.button, color: '#FFFFFF', fontSize: 16 },
});
