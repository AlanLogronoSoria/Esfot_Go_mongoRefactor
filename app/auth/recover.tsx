import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { RecoverForm } from '@/features/auth/presentation/recover-form';
import { LightTheme as T, Sizes, Typography, Shadows } from '@/constants/design-system';
import { GuestGuard } from '@/core/guards/auth.guard';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function RecoverScreen() {
  return (
    <GuestGuard>
      <View style={s.root}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.keyboard} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
          <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#042c5c', '#0a4488', T.background]} locations={[0, 0.25, 1]} style={s.bgGradient} />
            <View style={s.decorCircle} />

            <Animated.View entering={FadeIn.duration(500)} style={s.brand}>
              <View style={s.iconCircle}><Text style={s.icon}>🔑</Text></View>
              <Text style={s.title}>Recuperar contraseña</Text>
              <Text style={s.tagline}>Ingresa tu correo institucional y te enviaremos un enlace.</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150).duration(500)} style={s.card}>
              <RecoverForm />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(250).duration(400)} style={s.footer}>
              <Link href="/auth/login" style={s.link}>← Volver al inicio de sesión</Link>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </GuestGuard>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.background },
  keyboard: { flex: 1 },
  container: { flexGrow: 1, padding: Sizes.paddingXl, justifyContent: 'center', maxWidth: 420, width: '100%', alignSelf: 'center', paddingTop: 80, paddingBottom: 40 },

  bgGradient: { position: 'absolute', top: -80, left: -Sizes.paddingXl, right: -Sizes.paddingXl, height: 420 },
  decorCircle: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(250,187,84,0.06)', top: -60, right: -60 },

  brand: { alignItems: 'center', marginBottom: 28, gap: 12 },
  iconCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: T.infoBg, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  icon: { fontSize: 34 },
  title: { ...Typography.h2, color: T.textPrimary, fontSize: 26 },
  tagline: { ...Typography.bodySm, color: T.textSecondary, textAlign: 'center', maxWidth: 300, lineHeight: 20 },

  card: { backgroundColor: T.surfaceGlass, borderRadius: Sizes.radiusXl, borderWidth: 1, borderColor: T.cardBorder, padding: Sizes.paddingLg, ...Shadows.lg },
  footer: { marginTop: Sizes.gapLg, alignItems: 'center' },
  link: { color: T.primary, fontSize: 14, fontWeight: '600' },
});
