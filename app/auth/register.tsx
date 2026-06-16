import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { RegistrationForm } from '@/features/auth/presentation/registration-form';
import { GuestGuard } from '@/core/guards/auth.guard';
import { LightTheme as T, Shadows, Sizes, Typography } from '@/constants/design-system';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const BENEFITS = [
  { icon: '🗺️', text: 'Navega el campus' },
  { icon: '📅', text: 'Eventos institucionales' },
  { icon: '🚌', text: 'Polibus en tiempo real' },
];

export default function RegisterScreen() {
  return (
    <GuestGuard>
      <View style={st.root}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={st.keyboard} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
          <ScrollView contentContainerStyle={st.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#042c5c', '#0a4488', T.background]} locations={[0, 0.25, 1]} style={st.bgGradient} />

            <Animated.View entering={FadeIn.duration(500)} style={st.brand}>
              <View style={st.iconCircle}>
                <Text style={st.iconText}>🎓</Text>
                <View style={st.iconAccent} />
              </View>
              <Text style={st.title}>Crear cuenta</Text>
              <Text style={st.tagline}>Únete a la comunidad académica y explora el campus.</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={st.benefitsRow}>
              {BENEFITS.map((b, i) => (
                <View key={i} style={st.benefitCard}>
                  <Text style={st.benefitIcon}>{b.icon}</Text>
                  <Text style={st.benefitText}>{b.text}</Text>
                </View>
              ))}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(180).duration(500)} style={st.formCard}>
              <View style={st.formHeader}>
                <Text style={st.formTitle}>Tus datos</Text>
                <Text style={st.formSubtitle}>Usa tu correo institucional @epn.edu.ec</Text>
              </View>
              <RegistrationForm />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </GuestGuard>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.background },
  keyboard: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: Sizes.paddingXl, paddingTop: 60, paddingBottom: 48, maxWidth: 440, width: '100%', alignSelf: 'center' },

  bgGradient: { position: 'absolute', top: -80, left: -Sizes.paddingXl, right: -Sizes.paddingXl, height: 420 },

  brand: { alignItems: 'center', marginBottom: 24, gap: 10 },
  iconCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: T.primaryMuted, justifyContent: 'center', alignItems: 'center', marginBottom: 4, position: 'relative' },
  iconText: { fontSize: 38 },
  iconAccent: { position: 'absolute', bottom: 5, right: 3, width: 20, height: 20, borderRadius: 10, backgroundColor: T.highlight, borderWidth: 3, borderColor: T.background },
  title: { ...Typography.h2, color: T.textPrimary, fontSize: 28 },
  tagline: { ...Typography.bodySm, color: T.textSecondary, textAlign: 'center', maxWidth: 300, lineHeight: 20 },

  benefitsRow: { flexDirection: 'row', gap: 8, marginBottom: Sizes.gapMd, paddingHorizontal: 0 },
  benefitCard: {
    flex: 1,
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusLg,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.sm,
  },
  benefitIcon: { fontSize: 22 },
  benefitText: { ...Typography.caption, color: T.primary, fontWeight: '600', textAlign: 'center', fontSize: 11 },

  formCard: { backgroundColor: T.surface, borderRadius: Sizes.radiusXl, borderWidth: 1, borderColor: T.cardBorder, padding: Sizes.paddingLg, gap: Sizes.gapMd, ...Shadows.md },
  formHeader: { gap: 4, marginBottom: 4 },
  formTitle: { ...Typography.h3, color: T.textPrimary },
  formSubtitle: { ...Typography.bodySm, color: T.textSecondary },
});
