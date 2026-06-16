import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { ResetPasswordForm } from '@/features/auth/presentation/reset-password-form';
import { LightTheme as T, Sizes, Typography, Shadows } from '@/constants/design-system';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function ResetPasswordScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      style={styles.keyboard}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top gradient band */}
        <LinearGradient
          colors={['#042c5c', '#0a4488', 'transparent']}
          style={styles.topGradient}
        />
        <View style={styles.decorCircle} />

        {/* Brand */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.brand}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🔐</Text>
          </View>
          <Text style={styles.title}>Nueva contraseña</Text>
          <Text style={styles.tagline}>
            Elige una contraseña segura para tu cuenta institucional.
          </Text>
        </Animated.View>

        {/* Form card */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.formCard}>
          <ResetPasswordForm />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: T.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Sizes.paddingXl,
    paddingTop: 80,
    paddingBottom: 48,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: -Sizes.paddingXl,
    right: -Sizes.paddingXl,
    height: 200,
    opacity: 0.08,
  },
  decorCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(235,47,38,0.05)',
    top: -60,
    right: -60,
  },
  brand: { alignItems: 'center', marginBottom: 28, gap: 10, marginTop: 20 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: T.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconText: { fontSize: 32 },
  title: { ...Typography.h2, color: T.textPrimary, fontSize: 26 },
  tagline: { ...Typography.bodySm, color: T.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  formCard: {
    backgroundColor: T.surface,
    borderRadius: Sizes.radiusXl,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: Sizes.paddingLg,
    ...Shadows.md,
  },
});
