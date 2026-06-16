import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  View, Text, TextInput as RNTextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, ScrollView, Alert,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import type { CreateManagedUserInput, ManagedUserType, ManagedUserRole } from '../domain/user-management.entity';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

const createUserSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
  apellido: z.string().max(60, 'Máximo 60 caracteres').optional().or(z.literal('')),
  email: z.string().min(1, 'El correo es requerido').email('Formato de correo inválido'),
  telefono: z.string().regex(/^[0-9]{0,10}$/, 'Máximo 10 dígitos').optional().or(z.literal('')),
  direccion: z.string().max(120, 'Máximo 120 caracteres').optional().or(z.literal('')),
  type: z.enum(['estudiante', 'docente'] as const),
  rol: z.enum(['estudiante', 'docente', 'administrador'] as const),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface UserCreateModalProps {
  visible: boolean;
  isLoading: boolean;
  onCreate: (input: CreateManagedUserInput) => Promise<void>;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: ManagedUserType; label: string }[] = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'docente', label: 'Docente' },
];

const ROLE_OPTIONS: { value: ManagedUserRole; label: string; color: string }[] = [
  { value: 'estudiante', label: 'Estudiante', color: '#1B6BB0' },
  { value: 'docente', label: 'Docente', color: '#7C3AED' },
  { value: 'administrador', label: 'Administrador', color: '#DC2626' },
];

export function UserCreateModal({ visible, isLoading, onCreate, onClose }: UserCreateModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      type: 'estudiante',
      rol: 'estudiante',
    },
  });

  useEffect(() => {
    if (visible) {
      reset();
      setServerError(null);
    }
  }, [visible, reset]);

  const onSubmit = useCallback(async (data: CreateUserForm) => {
    setServerError(null);
    try {
      await onCreate({
        nombre: data.nombre,
        apellido: data.apellido || undefined,
        email: data.email.toLowerCase().trim(),
        telefono: data.telefono || undefined,
        direccion: data.direccion || undefined,
        rol: data.rol,
        type: data.type,
      });
      onClose();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Error al crear el usuario');
    }
  }, [onCreate, onClose]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Crear usuario</Text>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={T.primary} />
            ) : (
              <Text style={styles.saveText}>Crear</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {serverError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{serverError}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Tipo de usuario</Text>
            <Controller control={control} name="type"
              render={({ field: { onChange, value } }) => (
                <View style={styles.chipRow}>
                  {TYPE_OPTIONS.map((opt) => (
                    <TouchableOpacity key={opt.value}
                      style={[styles.chip, value === opt.value && styles.chipOn]}
                      onPress={() => onChange(opt.value)} activeOpacity={0.7}>
                      <Text style={[styles.chipText, value === opt.value && styles.chipTextOn]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre *</Text>
            <Controller control={control} name="nombre"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput style={[styles.input, errors.nombre && styles.inputErr]}
                  placeholder="Ej: Juan" placeholderTextColor={T.inputPlaceholder}
                  autoCapitalize="words" onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.nombre && <Text style={styles.fieldErr}>{errors.nombre.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Apellido</Text>
            <Controller control={control} name="apellido"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput style={[styles.input, errors.apellido && styles.inputErr]}
                  placeholder="Ej: Pérez" placeholderTextColor={T.inputPlaceholder}
                  autoCapitalize="words" onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo *</Text>
            <Controller control={control} name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput style={[styles.input, errors.email && styles.inputErr]}
                  placeholder="usuario@epn.edu.ec" placeholderTextColor={T.inputPlaceholder}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                  onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
            {errors.email && <Text style={styles.fieldErr}>{errors.email.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Teléfono</Text>
            <Controller control={control} name="telefono"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput style={[styles.input, errors.telefono && styles.inputErr]}
                  placeholder="09XXXXXXXX" placeholderTextColor={T.inputPlaceholder}
                  keyboardType="phone-pad" maxLength={10} onBlur={onBlur}
                  onChangeText={(t: string) => onChange(t.replace(/[^0-9]/g, ''))} value={value} />
              )} />
            {errors.telefono && <Text style={styles.fieldErr}>{errors.telefono.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Dirección</Text>
            <Controller control={control} name="direccion"
              render={({ field: { onChange, onBlur, value } }) => (
                <RNTextInput style={[styles.input, errors.direccion && styles.inputErr]}
                  placeholder="Ej: Quito, Av. Principal" placeholderTextColor={T.inputPlaceholder}
                  onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Rol</Text>
            <Controller control={control} name="rol"
              render={({ field: { onChange, value } }) => (
                <View style={styles.chipRow}>
                  {ROLE_OPTIONS.map((opt) => (
                    <TouchableOpacity key={opt.value}
                      style={[styles.chip, value === opt.value && { backgroundColor: opt.color + '20', borderColor: opt.color }]}
                      onPress={() => onChange(opt.value)} activeOpacity={0.7}>
                      <View style={[styles.roleDot, { backgroundColor: opt.color }]} />
                      <Text style={[styles.chipText, value === opt.value && { color: opt.color, fontWeight: '700' }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: T.divider,
    backgroundColor: T.surfaceGlass,
  },
  title: { ...Typography.h4, color: T.textPrimary },
  cancelText: { ...Typography.body, color: T.textSecondary },
  saveText: { ...Typography.body, fontWeight: '700', color: T.primary },
  form: { padding: 16, gap: 18, paddingBottom: 40 },
  errorBanner: {
    backgroundColor: T.errorBg, borderRadius: Sizes.radiusSm,
    padding: 12, borderLeftWidth: 3, borderLeftColor: T.error,
  },
  errorText: { ...Typography.bodySm, color: T.error },
  field: { gap: 5 },
  label: { ...Typography.overline, color: T.textSecondary },
  input: {
    backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder,
    borderRadius: Sizes.radiusSm, padding: 14, fontSize: 15, color: T.inputText,
  },
  inputErr: { borderColor: T.error },
  fieldErr: { ...Typography.caption, color: T.error },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: T.surface, borderRadius: Sizes.radiusSm,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: T.inputBorder,
    ...Shadows.sm,
  },
  chipOn: {
    backgroundColor: T.primaryMuted, borderColor: T.primary,
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.15,
  },
  chipText: { ...Typography.bodySm, fontWeight: '600', color: T.textSecondary },
  chipTextOn: { color: T.primary },
  roleDot: { width: 10, height: 10, borderRadius: 5 },
});
