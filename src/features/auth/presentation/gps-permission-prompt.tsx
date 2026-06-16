import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MapPin } from 'lucide-react-native';
import { useGpsPermission } from '@/hooks/use-gps-permission';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

export function GpsPermissionPrompt() {
  const router = useRouter();
  const { status, requestPermission } = useGpsPermission();

  useEffect(() => {
    if (status === 'granted') {
      const timer = setTimeout(() => {
        router.replace('/(drawer)/(tabs)');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  if (status === 'granted' || status === 'idle') return null;

  const handleAccept = async () => {
    const granted = await requestPermission();
    if (granted) {
      // Will auto-navigate via useEffect
    }
  };

  const handleSkip = () => {
    router.replace('/(drawer)/(tabs)');
  };

  return (
    <Animated.View
      entering={ZoomIn.duration(400)}
      exiting={FadeOut.duration(200)}
      style={styles.overlay}
    >
      <Animated.View entering={FadeIn.delay(200)} style={styles.card}>
        <View style={styles.iconContainer}>
          <MapPin size={36} strokeWidth={1.8} color={T.primary} />
        </View>

        <Text style={styles.title}>Activar ubicacion</Text>
        <Text style={styles.description}>
          Para mostrarte el mapa del campus, las rutas del Polibus en tiempo real y ayudarte a navegar por la Escuela Politecnica Nacional.
        </Text>

        <View style={styles.benefits}>
          <BenefitItem text="Mapa interactivo del campus" />
          <BenefitItem text="Rutas de Polibus en tiempo real" />
          <BenefitItem text="Ubicaciones de edificios y servicios" />
        </View>

        <Pressable
          style={styles.acceptButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleAccept();
          }}
        >
          <Text style={styles.acceptButtonText}>Permitir ubicacion</Text>
        </Pressable>

        <Pressable
          style={styles.skipButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleSkip();
          }}
        >
          <Text style={styles.skipButtonText}>Ahora no</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View style={styles.benefit}>
      <View style={styles.benefitDot} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: T.overlay,
    justifyContent: 'center', alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusXl,
    padding: 28, width: '100%', maxWidth: 380,
    alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: T.cardBorder,
    ...Shadows.xl,
  },
  iconContainer: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: T.primaryMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { ...Typography.h3, color: T.textPrimary, textAlign: 'center' },
  description: {
    ...Typography.body, color: T.textSecondary,
    textAlign: 'center', lineHeight: 21,
  },
  benefits: {
    width: '100%', gap: 10,
    backgroundColor: T.surface, borderRadius: Sizes.radiusMd,
    padding: 14, borderWidth: 1, borderColor: T.cardBorder,
  },
  benefit: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  benefitDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: T.primary,
  },
  benefitText: { ...Typography.bodySm, color: T.textSecondary },
  acceptButton: {
    backgroundColor: T.primary, borderRadius: Sizes.radiusSm,
    padding: 16, width: '100%', alignItems: 'center',
    ...Shadows.md, shadowColor: T.primary, shadowOpacity: 0.3,
  },
  acceptButtonText: { ...Typography.button, color: '#FFFFFF', fontSize: 16 },
  skipButton: { padding: 8, width: '100%', alignItems: 'center' },
  skipButtonText: { ...Typography.bodySm, color: T.textTertiary },
});
