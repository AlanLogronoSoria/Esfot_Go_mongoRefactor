import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { useBusInterpolation } from '@/features/polibus/application/bus.hooks';
import type { BusLocation } from '@/features/polibus/domain/route.entity';
import { DarkTheme as T } from '@/constants/design-system';
import { Bus } from 'lucide-react-native';

interface Props {
  bus: BusLocation;
  color?: string;
}

export function BusMarker({ bus, color = T.primary }: Props) {
  const coord = useBusInterpolation(bus, true);

  if (!coord) return null;

  return (
    <Marker
      coordinate={coord}
      anchor={{ x: 0.5, y: 0.5 }}
      flat
      rotation={bus.heading}
      tracksViewChanges={false}
      zIndex={100}
    >
      <View style={[styles.container, { backgroundColor: color }]}>
        <Bus size={18} color="#FFFFFF" style={styles.icon} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  icon: {
    transform: [{ rotate: '-90deg' }], // Adjusting for flat rotation if needed
  },
});
