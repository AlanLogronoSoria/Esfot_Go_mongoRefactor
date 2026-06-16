import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { registerSchema } from '@/features/auth/domain/auth.schema';
import type { RegisterInput } from '@/features/auth/domain/auth.schema';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { AppError } from '@/core/errors/app-error';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

type RegisterRole = 'estudiante' | 'docente';

const ROLE_LABELS: { role: RegisterRole; label: string }[] = [
  { role: 'estudiante', label: 'Estudiante' },
  { role: 'docente', label: 'Docente' },
];

export function RegisterForm() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RegisterRole>('estudiante');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      nombre: '',
      apellido: '',
      telefono: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      const result = await signUp(data, selectedRole);
      if (result.emailConfirmationRequired) {
        router.replace('/auth/verify');
      } else {
        router.replace('/(drawer)/(tabs)');
      }
    } catch (error) {
      if (error instanceof AppError) {
        setServerError(error.toUserMessage());
      } else {
        setServerError('Error al crear la cuenta. Intenta de nuevo.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {serverError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{serverError}</Text>
        </View>
      )}

      {/* Role selector — matches web registration */}
      <View style={styles.roleRow}>
        {ROLE_LABELS.map(({ role, label }) => (
          <Pressable
            key={role}
            style={[styles.roleChip, selectedRole === role && styles.roleChipActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedRole(role);
            }}
          >
            <Text style={[styles.roleChipText, selectedRole === role && styles.roleChipTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nombre</Text>
        <Controller
          control={control}
          name="nombre"
          render={({ field: { onChange, onBlur, value } }) => (
            <RNTextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              placeholder="Tu nombre"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.nombre && <Text style={styles.errorText}>{errors.nombre.message}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Apellido</Text>
        <Controller
          control={control}
          name="apellido"
          render={({ field: { onChange, onBlur, value } }) => (
            <RNTextInput
              style={[styles.input, errors.apellido && styles.inputError]}
              placeholder="Tu apellido"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.apellido && <Text style={styles.errorText}>{errors.apellido.message}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Teléfono</Text>
        <Controller
          control={control}
          name="telefono"
          render={({ field: { onChange, onBlur, value } }) => (
            <RNTextInput
              style={[styles.input, errors.telefono && styles.inputError]}
              placeholder="0991234567"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.telefono && <Text style={styles.errorText}>{errors.telefono.message}</Text>}
      </View>

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
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Contraseña</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <RNTextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Mínimo 12 caracteres, una mayúscula y un número"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Confirmar contraseña</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <RNTextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Repite tu contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
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
          <Text style={styles.buttonText}>Crear cuenta</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  roleChip: {
    flex: 1, paddingVertical: 11, borderRadius: Sizes.radiusSm,
    borderWidth: 1.5, borderColor: T.inputBorder,
    alignItems: 'center', backgroundColor: T.surface,
    ...Shadows.sm,
  },
  roleChipActive: {
    borderColor: T.primary, backgroundColor: T.primaryMuted,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.15,
  },
  roleChipText: { ...Typography.bodySm, fontWeight: '600', color: T.textSecondary },
  roleChipTextActive: { color: T.primary },
  errorBanner: {
    backgroundColor: T.errorBg, borderRadius: Sizes.radiusSm,
    padding: 12, borderLeftWidth: 4, borderLeftColor: T.error,
  },
  errorBannerText: { ...Typography.bodySm, color: T.error },
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
  errorText: { ...Typography.caption, color: T.error },
  button: {
    backgroundColor: T.primary, borderRadius: Sizes.radiusSm,
    padding: 16, alignItems: 'center', marginTop: 8,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...Typography.button, color: '#FFFFFF', fontSize: 16 },
});
