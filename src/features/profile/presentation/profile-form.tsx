import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View, Text, TextInput as RNTextInput, Pressable, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useState, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { updateProfileSchema } from '@/features/auth/domain/auth.schema';
import type { UpdateProfileInput } from '@/features/auth/domain/auth.schema';
import { UserEntity } from '@/features/auth/domain/user.entity';
import { useProfile } from '@/features/profile/application/profile.hooks';
import { useAuthStore } from '@/store/auth.store';
import { ChangePasswordForm } from './change-password-form';
import { LightTheme as T, Shadows, Sizes, Typography } from '@/constants/design-system';

const ROLE_LABELS: Record<string, string> = {
  estudiante: 'Estudiante', docente: 'Docente', administrador: 'Administrador',
};

export function ProfileForm() {
  const { user, isLoading, updateProfile } = useProfile();
  const secureLogout = useAuthStore((s) => s.secureLogout);
  const [ok, setOk] = useState<string | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(user?.avatarUrl ?? null);
  const ue = user ? new UserEntity(user) : null;

  const { control, handleSubmit, reset, formState: { errors, isDirty }, watch } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema), defaultValues: { fullName: user?.fullName ?? '', phone: user?.phone ?? '' },
  });

  useEffect(() => { if (user) { reset({ fullName: user.fullName ?? '', phone: user.phone ?? '' }); setLocalAvatar(user.avatarUrl ?? null); } }, [user, reset]);
  const phone = watch('phone');

  const onSubmit = useCallback(async (d: UpdateProfileInput) => {
    setOk(null);
    try {
      const isLocalUri = localAvatar && (localAvatar.startsWith('file://') || localAvatar.startsWith('content://'));
      await updateProfile.mutateAsync({
        fullName: d.fullName || undefined,
        phone: d.phone || undefined,
        avatarUrl: isLocalUri ? undefined : (localAvatar || undefined),
      });
      setOk('Perfil actualizado');
      setTimeout(() => setOk(null), 3000);
    } catch { /* handled by mutation */ }
  }, [updateProfile, localAvatar]);

  const logout = useCallback(() => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión? Se eliminarán todos los datos locales.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Cerrar sesión', style: 'destructive', onPress: () => secureLogout() }]);
  }, [secureLogout]);

  const handlePickAvatar = useCallback(() => {
    Alert.alert('Foto de perfil', 'Selecciona una opción', [
      {
        text: 'Cámara',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled && result.assets[0]) {
            setLocalAvatar(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la galería');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled && result.assets[0]) {
            setLocalAvatar(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
      <View style={st.root}>
        {/* Avatar */}
        <Pressable style={st.avatarSection} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handlePickAvatar();
        }}>
          {localAvatar ? (
            <Image source={{ uri: localAvatar }} style={st.avatarImage} contentFit="cover" transition={300} />
          ) : (
            <View style={st.avatar}><Text style={st.avatarText}>{ue?.initials ?? 'U'}</Text></View>
          )}
          <View style={st.avatarInfo}>
            <Text style={st.name}>{ue?.displayName ?? 'Usuario'}</Text>
            <Text style={st.email}>{user?.email}</Text>
            <View style={st.badges}>
              <View style={st.roleBadge}><Text style={st.roleBadgeText}>{ROLE_LABELS[user?.role ?? 'estudiante']}</Text></View>
              <View style={st.verifiedBadge}><Text style={st.verifiedBadgeText}>Verificado</Text></View>
            </View>
          </View>
          <Camera size={20} strokeWidth={1.8} color={T.textSecondary} />
        </Pressable>

        {updateProfile.isError && <Animated.View entering={FadeIn} style={st.err}><Text style={st.errT}>{(updateProfile.error as any)?.message ?? 'Error'}</Text></Animated.View>}
        {ok && <Animated.View entering={ZoomIn} style={st.ok}><Text style={st.okT}>{ok}</Text></Animated.View>}

        {/* Personal */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>Informacion personal</Text>
          <View style={st.field}>
            <Text style={st.label}>Nombre completo</Text>
            <Controller control={control} name="fullName" render={({ field: { onChange, onBlur, value } }) => <RNTextInput style={[st.input, errors.fullName && st.inputErr]} placeholder="Ej: Juan Pérez" placeholderTextColor={T.inputPlaceholder} autoCapitalize="words" onBlur={onBlur} onChangeText={onChange} value={value ?? ''} />} />
            {errors.fullName && <Text style={st.fieldErr}>{errors.fullName.message}</Text>}
          </View>
          <View style={st.field}>
            <Text style={st.label}>Correo institucional</Text>
            <View style={st.readOnly}><Text style={st.readOnlyT}>{user?.email}</Text><Text style={st.readOnlyBadge}>EPN</Text></View>
            <Text style={st.hint}>El correo institucional no se puede modificar</Text>
          </View>
        </View>

        {/* Contact */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>Contacto</Text>
          <View style={st.field}>
            <Text style={st.label}>Teléfono celular</Text>
            <Controller control={control} name="phone" render={({ field: { onChange, onBlur, value } }) => <RNTextInput style={[st.input, errors.phone && st.inputErr]} placeholder="09XXXXXXXX" placeholderTextColor={T.inputPlaceholder} keyboardType="phone-pad" maxLength={10} onBlur={onBlur} onChangeText={(t: string) => onChange(t.replace(/[^0-9]/g, ''))} value={value ?? ''} />} />
            {errors.phone && <Text style={st.fieldErr}>{errors.phone.message}</Text>}
            {!errors.phone && phone && phone.length > 0 && phone.length < 10 && <Text style={st.hint}>El teléfono debe tener 10 dígitos</Text>}
            {!errors.phone && phone && phone.length === 10 && <Text style={st.hintOk}>Formato valido</Text>}
          </View>
        </View>

        <Animated.View entering={FadeIn}>
          <Pressable style={[st.btn, (isLoading || updateProfile.isPending) && st.btnOff]} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleSubmit(onSubmit)();
          }} disabled={isLoading || updateProfile.isPending}>
            {isLoading || updateProfile.isPending ? <ActivityIndicator color="#FFFFFF" /> : <Text style={st.btnT}>Guardar cambios</Text>}
          </Pressable>
        </Animated.View>

        {/* Security */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>Seguridad</Text>
          <ChangePasswordForm />
        </View>

        <Pressable style={st.logout} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          logout();
        }}>
          <Text style={st.logoutT}>Cerrar sesion</Text>
        </Pressable>
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  root: { gap: 20 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: T.surfaceGlass, borderRadius: Sizes.radiusLg, padding: Sizes.paddingLg, borderWidth: 1, borderColor: T.cardBorder, ...Shadows.md },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  avatarImage: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: T.primaryMuted },
  avatarInfo: { flex: 1, gap: 3 },
  name: { ...Typography.h4, color: T.textPrimary },
  email: { ...Typography.bodySm, color: T.textSecondary },
  badges: { flexDirection: 'row', gap: 8, marginTop: 4 },
  roleBadge: {
    backgroundColor: T.infoBg, paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: 8,
  },
  roleBadgeText: {
    ...Typography.caption, fontWeight: '700',
    color: T.info, textTransform: 'capitalize',
  },
  verifiedBadge: {
    backgroundColor: T.successBg, paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: 8,
  },
  verifiedBadgeText: { ...Typography.caption, fontWeight: '700', color: T.success },
  err: {
    backgroundColor: T.errorBg, borderRadius: Sizes.radiusSm,
    padding: 12, borderLeftWidth: 3, borderLeftColor: T.error,
  },
  errT: { ...Typography.bodySm, color: T.error },
  ok: {
    backgroundColor: T.successBg, borderRadius: Sizes.radiusSm,
    padding: 12, borderLeftWidth: 3, borderLeftColor: T.success,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  okT: { ...Typography.bodySm, color: T.success, fontWeight: '600' },
  section: {
    backgroundColor: T.surfaceGlass, borderRadius: Sizes.radiusXl,
    padding: Sizes.paddingLg, gap: 16,
    borderWidth: 1, borderColor: T.cardBorder, ...Shadows.md,
  },
  sectionTitle: { ...Typography.h4, color: T.textPrimary },
  field: { gap: 5 },
  label: { ...Typography.label, color: T.textSecondary },
  input: {
    backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder,
    borderRadius: Sizes.radiusSm, padding: 14,
    fontSize: 15, color: T.inputText,
  },
  inputErr: { borderColor: T.error },
  readOnly: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.cardBorder,
    borderRadius: Sizes.radiusSm, padding: 14,
  },
  readOnlyT: { ...Typography.body, color: T.textSecondary },
  readOnlyBadge: {
    ...Typography.caption, fontWeight: '700', color: T.primary,
    backgroundColor: T.primaryMuted, paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 4,
  },
  hint: { ...Typography.caption, color: T.textTertiary },
  hintOk: { ...Typography.caption, color: T.success, fontWeight: '600' },
  fieldErr: { ...Typography.caption, color: T.error },
  btn: {
    backgroundColor: T.primary, borderRadius: Sizes.radiusSm,
    padding: 16, alignItems: 'center',
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  btnOff: { opacity: 0.5 },
  btnT: { ...Typography.button, color: '#FFFFFF' },
  logout: {
    backgroundColor: T.errorBg, borderRadius: Sizes.radiusSm,
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: T.error + '30',
    ...Shadows.sm,
  },
  logoutT: { ...Typography.button, color: T.error, fontSize: 15 },
});
