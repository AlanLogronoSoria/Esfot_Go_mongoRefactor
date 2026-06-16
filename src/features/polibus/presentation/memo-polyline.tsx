import React, { memo } from 'react';
import { Polyline } from 'react-native-maps';

interface MemoPolylineProps {
  coordinates: { latitude: number; longitude: number }[];
  color: string;
}

export const MemoPolyline = memo(
  function MemoPolyline({ coordinates, color }: MemoPolylineProps) {
    if (coordinates.length < 2) return null;
    return (
      <>
        <Polyline
          coordinates={coordinates}
          strokeColor={color + '30'}
          strokeWidth={10}
          lineCap="round"
          lineJoin="round"
          miterLimit={0}
          zIndex={0}
        />
        <Polyline
          coordinates={coordinates}
          strokeColor={color}
          strokeWidth={6}
          lineCap="round"
          lineJoin="round"
          miterLimit={0}
          zIndex={1}
        />
      </>
    );
  },
  (prev, next) =>
    prev.color === next.color &&
    prev.coordinates.length === next.coordinates.length &&
    prev.coordinates.length > 0 &&
    prev.coordinates[0]?.latitude === next.coordinates[0]?.latitude &&
    prev.coordinates[0]?.longitude === next.coordinates[0]?.longitude &&
    prev.coordinates[prev.coordinates.length - 1]?.latitude === next.coordinates[next.coordinates.length - 1]?.latitude &&
    prev.coordinates[prev.coordinates.length - 1]?.longitude === next.coordinates[next.coordinates.length - 1]?.longitude,
);
