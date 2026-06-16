import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';
import { Mail, Check } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth.store';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

export function EmailVerificationScreen() {
  const router = useRouter();
  const registrationEmail = useAuthStore((s) => s.registrationEmail);
  const resendVerification = useAuthStore((s) => s.resendVerificationEmail);
  const resetRegistration = useAuthStore((s) => s.resetRegistration);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const envelopeScale = useSharedValue(1);
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    if (!registrationEmail) {
      router.replace('/auth/register');
      return;
    }
  }, [registrationEmail, router]);

  useEffect(() => {
    if (user) {
      router.replace('/(drawer)/(tabs)');
    }
  }, [user, router]);

  // Animated dots
  useEffect(() => {
    const animations = [
      { sv: dot1Opacity, delay: 0 },
      { sv: dot2Opacity, delay: 400 },
      { sv: dot3Opacity, delay: 800 },
    ];

    animations.forEach(({ sv, delay: d }) => {
      sv.value = withDelay(
        d,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 })
          ),
          -1,
          false
        )
      );
    });
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  // Envelope pulse animation
  useEffect(() => {
    envelopeScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, [envelopeScale]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendCooldown]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    setLocalError(null);
    setResendSuccess(false);
    try {
      await resendVerification();
      setResendCooldown(60);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Error al reenviar');
    }
  }, [resendCooldown, resendVerification]);

  const handleBackToRegister = useCallback(() => {
    resetRegistration();
    router.replace('/auth/register');
  }, [resetRegistration, router]);

  const handleGoToLogin = useCallback(() => {
    resetRegistration();
    router.replace('/auth/login');
  }, [resetRegistration, router]);

  const envelopeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: envelopeScale.value }],
  }));

  const dotStyle1 = useAnimatedStyle(() => ({ opacity: dot1Opacity.value }));
  const dotStyle2 = useAnimatedStyle(() => ({ opacity: dot2Opacity.value }));
  const dotStyle3 = useAnimatedStyle(() => ({ opacity: dot3Opacity.value }));

  return (
    <View style={styles.container}>
      <Animated.View entering={ZoomIn.delay(200).duration(500)} style={styles.iconContainer}>
        <Animated.View style={[styles.envelopeWrapper, envelopeStyle]}>
          <Mail size={44} strokeWidth={1.5} color={T.primary} />
        </Animated.View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(500)} style={styles.content}>
        <Text style={styles.title}>Verifica tu correo</Text>
        <Text style={styles.subtitle}>
          Hemos enviado un enlace de verificación a
        </Text>
        <Text style={styles.emailHighlight}>{registrationEmail}</Text>

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            Si no lo encuentras, revisa la carpeta de spam.
          </Text>
        </View>

        <View style={styles.dotsContainer}>
          <Animated.Text style={[styles.dot, dotStyle1]}>●</Animated.Text>
          <Animated.Text style={[styles.dot, dotStyle2]}>●</Animated.Text>
          <Animated.Text style={[styles.dot, dotStyle3]}>●</Animated.Text>
        </View>
        <Text style={styles.waitingText}>Esperando confirmación...</Text>

        {resendSuccess && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.successBox}>
            <Check size={14} strokeWidth={2.5} color={T.success} />
            <Text style={styles.successText}>Correo reenviado correctamente</Text>
          </Animated.View>
        )}

        {localError && (
          <Animated.View entering={FadeIn} style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{localError}</Text>
          </Animated.View>
        )}

        <Pressable
          style={[
            styles.resendButton,
            (resendCooldown > 0 || isLoading) && styles.resendButtonDisabled,
          ]}
          onPress={handleResend}
          disabled={resendCooldown > 0 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={T.primary} size="small" />
          ) : (
            <Text style={styles.resendButtonText}>
              {resendCooldown > 0
                ? `Reenviar en ${resendCooldown}s`
                : 'Reenviar correo'}
            </Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Pressable onPress={handleBackToRegister}>
            <Text style={styles.footerLink}>Corregir correo electronico</Text>
          </Pressable>
          <View style={styles.footerDivider} />
          <Pressable onPress={handleGoToLogin}>
            <Text style={styles.footerLink}>Ir al inicio de sesion</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: T.background,
    padding: 24, justifyContent: 'center',
    maxWidth: 400, width: '100%', alignSelf: 'center',
  },
  iconContainer: { alignItems: 'center', marginBottom: 32 },
  envelopeWrapper: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: T.primaryMuted,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.md,
  },
  content: { alignItems: 'center', gap: 12 },
  title: { ...Typography.h2, color: T.textPrimary, textAlign: 'center' },
  subtitle: {
    ...Typography.body, color: T.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },
  emailHighlight: {
    ...Typography.body, fontWeight: '700', color: T.primary,
    textAlign: 'center', backgroundColor: T.primaryMuted,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Sizes.radiusSm, marginTop: 4,
  },
  instructions: {
    backgroundColor: T.warningBg, borderRadius: Sizes.radiusSm,
    padding: 14, borderWidth: 1, borderColor: T.warning + '30',
    marginTop: 8, width: '100%',
  },
  instructionText: {
    ...Typography.bodySm, color: T.warning,
    lineHeight: 19, textAlign: 'center',
  },
  dotsContainer: { flexDirection: 'row', gap: 6, marginTop: 8 },
  dot: { fontSize: 10, color: T.primary },
  waitingText: { ...Typography.bodySm, color: T.textTertiary },
  successBox: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: T.successBg, borderRadius: Sizes.radiusSm,
    padding: 12, borderLeftWidth: 4, borderLeftColor: T.success,
    width: '100%',
  },
  successText: { ...Typography.bodySm, color: T.success, fontWeight: '600' },
  errorBox: {
    backgroundColor: T.errorBg, borderRadius: Sizes.radiusSm,
    padding: 12, borderLeftWidth: 4, borderLeftColor: T.error,
    width: '100%',
  },
  errorBoxText: { ...Typography.bodySm, color: T.error },
  resendButton: {
    marginTop: 16, borderWidth: 1.5, borderColor: T.primary,
    borderRadius: Sizes.radiusSm, padding: 14,
    width: '100%', alignItems: 'center',
    ...Shadows.sm,
  },
  resendButtonDisabled: { borderColor: T.textMuted, opacity: 0.6 },
  resendButtonText: { ...Typography.button, color: T.primary, fontSize: 15 },
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24,
  },
  footerDivider: {
    width: 4, height: 4, borderRadius: 2, backgroundColor: T.textMuted,
  },
  footerLink: { ...Typography.bodySm, color: T.textSecondary, fontWeight: '500' },
});
