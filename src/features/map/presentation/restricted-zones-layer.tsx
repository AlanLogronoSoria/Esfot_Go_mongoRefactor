import React, { memo } from 'react';
import { Polygon } from 'react-native-maps';
import type { RestrictedZone } from '@/features/admin/domain/poi.entity';

interface Props {
  zones: RestrictedZone[];
  onZonePress?: (zone: RestrictedZone) => void;
}

export const RestrictedZonesLayer = memo(function RestrictedZonesLayer({
  zones,
  onZonePress,
}: Props) {
  const activeZones = zones.filter((z) => z.isActive);

  if (activeZones.length === 0) return null;

  return (
    <>
      {activeZones.map((zone) => (
        <Polygon
          key={zone.id}
          coordinates={zone.coordinates}
          fillColor={zone.fillColor}
          strokeColor={zone.strokeColor}
          strokeWidth={2}
          tappable={!!onZonePress}
          onPress={() => onZonePress?.(zone)}
        />
      ))}
    </>
  );
});
