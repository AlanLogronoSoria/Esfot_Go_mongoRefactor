import { Shadows, Sizes, LightTheme as T, Typography } from "@/constants/design-system";
import { GuestGuard } from "@/core/guards/auth.guard";
import { LoginForm } from "@/features/auth/presentation/login-form";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function LoginScreen() {
  return (
    <GuestGuard>
      <View style={s.root}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.keyboard} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}>
          <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Background gradient */}
            <LinearGradient colors={['#042c5c', '#0a4488', T.background]} locations={[0, 0.3, 1]} style={s.bgGradient} />

            {/* Brand section */}
            <Animated.View entering={FadeIn.duration(600)} style={s.brand}>
              <View style={s.logoRing}>
                <View style={s.logoInner}>
                  <Text style={s.logoText}>EPN</Text>
                </View>
                <View style={s.accentDot} />
              </View>
              <Text style={s.appName}>ESFOT <Text style={s.appNameAccent}>Go</Text></Text>
              <Text style={s.tagline}>Tu guía inteligente para navegar el campus de la Politécnica</Text>
            </Animated.View>

            {/* Form card */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={s.formCard}>
              <View style={s.formHeader}>
                <Text style={s.formTitle}>Iniciar sesión</Text>
                <Text style={s.formSubtitle}>Usa tu correo institucional</Text>
              </View>
              <LoginForm />
            </Animated.View>

            {/* Footer */}
            <Animated.View entering={FadeInDown.delay(350).duration(400)} style={s.footer}>
              <Link href="/auth/register" style={s.linkPrimary}>Crear cuenta institucional</Link>
              <Link href="/auth/recover" style={s.linkSecondary}>¿Olvidaste tu contraseña?</Link>
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
  container: {
    flexGrow: 1,
    paddingHorizontal: Sizes.paddingXl,
    paddingBottom: 48,
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
  },

  bgGradient: {
    position: 'absolute',
    top: -200,
    left: -Sizes.paddingXl,
    right: -Sizes.paddingXl,
    height: 500,
  },

  brand: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 32,
    gap: 12,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    position: 'relative',
  },
  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: T.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.glow,
  },
  logoText: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", letterSpacing: 2 },
  accentDot: {
    position: 'absolute', bottom: 10, right: 8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: T.highlight,
    borderWidth: 3, borderColor: T.background,
  },
  appName: { ...Typography.h1, color: '#FFFFFF', fontSize: 34, letterSpacing: -0.5 },
  appNameAccent: { color: T.highlight },
  tagline: { ...Typography.bodySm, color: 'rgba(255,255,255,0.70)', textAlign: "center", maxWidth: 280, lineHeight: 20 },

  formCard: {
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusXl,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: Sizes.paddingLg,
    gap: Sizes.gapMd,
    ...Shadows.lg,
  },
  formHeader: { gap: 4, marginBottom: 4 },
  formTitle: { ...Typography.h3, color: T.textPrimary },
  formSubtitle: { ...Typography.bodySm, color: T.textSecondary },

  footer: { marginTop: 28, alignItems: "center", gap: 14 },
  linkPrimary: {
    color: T.primary,
    fontSize: 14,
    fontWeight: "700",
    backgroundColor: T.primaryMuted,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: Sizes.radiusMd,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.primary + '18',
  },
  linkSecondary: { color: T.textSecondary, fontSize: 13, textDecorationLine: "underline" },
});
