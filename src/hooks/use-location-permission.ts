import { useEffect, useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { AppState, Linking, Platform } from 'react-native';

export type PermissionState = 'idle' | 'granted' | 'denied' | 'blocked';

export interface UseLocationPermissionReturn {
  status: PermissionState;
  canAskAgain: boolean;
  isLoading: boolean;
  checkPermission: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  retryPermission: () => Promise<boolean>;
  openSettings: () => void;
  ensurePermission: () => Promise<boolean>;
}

// ─── Module-level shared state ───────────────────────────────
let _status: PermissionState = 'idle';
let _canAskAgain = true;
let _isLoading = true;
let _mountCount = 0;
const _listeners = new Set<() => void>();
let _appSub: { remove: () => void } | null = null;

function emit() {
  _listeners.forEach((fn) => {
    try { fn(); } catch { /* ignore */ }
  });
}

function isMounted(): boolean {
  return _mountCount > 0;
}

async function internalCheck() {
  try {
    const perm = await Location.getForegroundPermissionsAsync();
    if (!isMounted()) return;
    _canAskAgain = perm.canAskAgain;
    if (perm.status === 'granted') {
      _status = 'granted';
    } else if (!perm.canAskAgain) {
      _status = 'blocked';
    } else {
      _status = 'denied';
    }
  } catch {
    if (isMounted()) {
      _status = 'idle';
    }
  } finally {
    if (isMounted()) {
      _isLoading = false;
    }
    emit();
  }
}

async function internalRequest(): Promise<boolean> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!isMounted()) return false;
    _canAskAgain = perm.canAskAgain;
    if (perm.status === 'granted') {
      _status = 'granted';
      emit();
      return true;
    }
    if (!perm.canAskAgain) {
      _status = 'blocked';
    } else {
      _status = 'denied';
    }
    emit();
    return false;
  } catch {
    if (isMounted()) {
      _status = 'denied';
    }
    emit();
    return false;
  }
}

// ─── Hook ────────────────────────────────────────────────────
export function useLocationPermission(): UseLocationPermissionReturn {
  const [, forceRender] = useState(0);

  useEffect(() => {
    _mountCount++;
    const isFirstMount = _mountCount === 1;

    if (isFirstMount) {
      _isLoading = true;
      internalCheck();
    }

    // Single global AppState listener
    if (!_appSub) {
      _appSub = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active' && isMounted()) {
          _isLoading = true;
          emit();
          internalCheck();
        }
      });
    }

    const listener = () => {
      if (isMounted()) forceRender((n) => n + 1);
    };
    _listeners.add(listener);

    return () => {
      _mountCount--;
      _listeners.delete(listener);

      if (_mountCount === 0) {
        _appSub?.remove();
        _appSub = null;
      }
    };
  }, []);

  const checkPermission = useCallback(async () => {
    _isLoading = true;
    emit();
    await internalCheck();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    return internalRequest();
  }, []);

  const retryPermission = useCallback(async (): Promise<boolean> => {
    return internalRequest();
  }, []);

  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    const perm = await Location.getForegroundPermissionsAsync();
    if (!isMounted()) return false;

    _canAskAgain = perm.canAskAgain;
    emit();

    if (perm.status === 'granted') {
      _status = 'granted';
      emit();
      return true;
    }

    if (!perm.canAskAgain) {
      _status = 'blocked';
      emit();
      return false;
    }

    return internalRequest();
  }, []);

  return {
    status: _status,
    canAskAgain: _canAskAgain,
    isLoading: _isLoading,
    checkPermission,
    requestPermission,
    retryPermission,
    openSettings,
    ensurePermission,
  };
}
