import React from 'react';
import { View, Pressable, Text, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LocateFixed, MapPin } from 'lucide-react-native';
import type MapView from 'react-native-maps';
import { LightTheme as T, Shadows } from '@/constants/design-system';

const EPN_COORDS = {
  latitude: -0.2095,
  longitude: -78.4905,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

interface Props {
  mapRef: React.RefObject<MapView>;
  userLocation?: { coords: { latitude: number; longitude: number } } | null;
  bottom?: number;
  right?: number;
  showMyLocation?: boolean;
}

export function MapFloatingActions({
  mapRef,
  userLocation,
  bottom = 20,
  right = 20,
  showMyLocation = true,
}: Props) {
  const goToMyLocation = () => {
    if (!userLocation) {
      Alert.alert(
        'Sin ubicación',
        'No se pudo obtener tu ubicación actual. Verifica que el GPS esté activado.',
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mapRef.current?.animateToRegion({
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 600);
  };

  const goToEPN = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mapRef.current?.animateToRegion(EPN_COORDS, 600);
  };

  return (
    <View style={[styles.container, { bottom, right }]}>
      <Pressable
        style={styles.btn}
        onPress={goToEPN}
      >
        <MapPin size={18} strokeWidth={2.2} color={T.primary} />
        <Text style={styles.label}>Ir a la Poli</Text>
      </Pressable>

      {showMyLocation && (
        <Pressable
          style={styles.btn}
          onPress={goToMyLocation}
        >
          <LocateFixed size={18} strokeWidth={2.2} color={T.primary} />
          <Text style={styles.label}>Mi ubicación</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'flex-end',
    gap: 10,
    zIndex: 50,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: T.surface,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: T.textPrimary,
  },
});
