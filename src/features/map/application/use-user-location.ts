import { useEffect, useRef, useState, useCallback } from 'react';
import { useBatteryOptimizer } from '@/features/map/services/battery-optimizer';
import { useLocationPermission, type PermissionState } from '@/hooks/use-location-permission';
import { isDevMode } from '@/core/config/env';
import { ExpoLocationRepository } from '../infrastructure/expo-location.repository';
import type {
  GpsCoordinates,
  GpsLocationOptions,
  GpsLocationSubscription,
} from '../domain/gps-location.repository';

interface UseUserLocationOptions {
  enableHighAccuracy?: boolean;
}

interface UseUserLocationReturn {
  location: GpsCoordinates | null;
  error: string | null;
  isWatching: boolean;
  retry: () => Promise<void>;
  permissionStatus: PermissionState;
  canAskAgain: boolean;
  ensurePermission: () => Promise<boolean>;
}

const SPEED_THRESHOLD_MS = 2.78;

const DEV_MOCK_LOCATION: GpsCoordinates = {
  latitude: -0.2105,
  longitude: -78.4895,
  altitude: 2800,
  accuracy: 10,
  heading: 0,
  speed: 0,
  timestamp: Date.now(),
};

const repo = new ExpoLocationRepository();

export function useUserLocation(_options?: UseUserLocationOptions): UseUserLocationReturn {
  const [location, setLocation] = useState<GpsCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  const subRef = useRef<GpsLocationSubscription | null>(null);
  const mountedRef = useRef(true);
  const lastUpdateRef = useRef(0);
  const prevSpeedRef = useRef(0);
  const battery = useBatteryOptimizer();
  const {
    status: permissionStatus,
    canAskAgain,
    ensurePermission,
  } = useLocationPermission();

  const cleanup = useCallback(() => {
    try {
      subRef.current?.remove();
    } catch {
      // already removed
    }
    subRef.current = null;
  }, []);

  const getGpsConfig = useCallback((): Partial<GpsLocationOptions> => {
    const speed = prevSpeedRef.current ?? 0;

    if (battery.isLowPower) {
      return {
        accuracy: 'low',
        timeInterval: 5000,
        distanceInterval: 15,
      };
    }

    if (speed > SPEED_THRESHOLD_MS) {
      return {
        accuracy: 'high',
        timeInterval: 1000,
        distanceInterval: 5,
      };
    }

    return {
      accuracy: 'balanced',
      timeInterval: 2500,
      distanceInterval: 8,
    };
  }, [battery.isLowPower]);

  const startWatching = useCallback(async () => {
    if (isDevMode()) {
      if (mountedRef.current) {
        setLocation(DEV_MOCK_LOCATION);
        setIsWatching(true);
        setError(null);
      }
      return;
    }

    try {
      cleanup();

      const config = getGpsConfig();
      const loc = await repo.getCurrentPosition({ accuracy: 'balanced' });
      if (mountedRef.current) {
        setLocation(loc);
        lastUpdateRef.current = Date.now();
        if (loc.speed != null) prevSpeedRef.current = loc.speed;
      }

      subRef.current = await repo.watchPosition(config, (newLoc) => {
        const now = Date.now();
        if (now - lastUpdateRef.current < battery.throttleMs) return;
        lastUpdateRef.current = now;

        if (newLoc.speed != null) {
          prevSpeedRef.current = newLoc.speed;
        }

        if (mountedRef.current) {
          setLocation(newLoc);
        }
      });

      if (mountedRef.current) {
        setIsWatching(true);
        setError(null);
      }
    } catch (e) {
      if (mountedRef.current) {
        setError((e as Error).message ?? 'Error al obtener ubicación');
        setIsWatching(false);
      }
    }
  }, [cleanup, battery.throttleMs, getGpsConfig]);

  useEffect(() => {
    mountedRef.current = true;

    if (isDevMode()) {
      setLocation(DEV_MOCK_LOCATION);
      setIsWatching(true);
      setError(null);

      const interval = setInterval(() => {
        const jitter = 0.0001 * (Math.random() - 0.5);
        setLocation((prev) =>
          prev
            ? {
                ...prev,
                latitude: prev.latitude + jitter,
                longitude: prev.longitude + jitter * 1.3,
                timestamp: Date.now(),
              }
            : null,
        );
      }, 3000);

      return () => {
        mountedRef.current = false;
        clearInterval(interval);
        cleanup();
      };
    }

    if (permissionStatus === 'granted') {
      startWatching();
    } else if (permissionStatus === 'blocked') {
      setError('Permiso de ubicación denegado permanentemente');
    } else if (permissionStatus === 'denied') {
      setError('Permiso de ubicación denegado');
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [permissionStatus, startWatching, cleanup]);

  const retry = useCallback(async () => {
    setError(null);
    const granted = await ensurePermission();
    if (granted && mountedRef.current) {
      startWatching();
    }
  }, [ensurePermission, startWatching]);

  return {
    location,
    error,
    isWatching,
    retry,
    permissionStatus,
    canAskAgain,
    ensurePermission,
  };
}
