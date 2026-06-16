import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'epn_session_meta';
const CACHE_PREFIX = 'epn_cache_';

export interface SessionMetadata {
  lastActiveAt: string;
  deviceId: string | null;
  loginMethod: 'email' | 'sso';
  rememberMe: boolean;
}

export class SessionManager {
  static async persistMetadata(metadata: SessionMetadata): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(metadata));
    } catch {
      // Non-critical, silently fail
    }
  }

  static async getMetadata(): Promise<SessionMetadata | null> {
    try {
      const data = await AsyncStorage.getItem(SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as SessionMetadata;
    } catch {
      return null;
    }
  }

  static async updateLastActive(): Promise<void> {
    try {
      const meta = await this.getMetadata();
      if (meta) {
        meta.lastActiveAt = new Date().toISOString();
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(meta));
      }
    } catch {
      // Non-critical
    }
  }

  static async isSessionTimedOut(timeoutMinutes: number = 30): Promise<boolean> {
    try {
      const meta = await this.getMetadata();
      if (!meta) return false;
      const lastActive = new Date(meta.lastActiveAt).getTime();
      const now = Date.now();
      const effectiveTimeout = meta.rememberMe ? timeoutMinutes : Math.min(timeoutMinutes, 30);
      const isTimedOut = now - lastActive > effectiveTimeout * 60 * 1000;
      if (isTimedOut) {
        console.log('[SessionManager] Sesión expirada por timeout — última actividad:', new Date(lastActive).toISOString());
      }
      return isTimedOut;
    } catch {
      return false;
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);

      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch {
      // Best effort
    }
  }

  static async clearSecureTokens(): Promise<void> {
    const secureKeys = [
      'epn_jwt_token',
      'esfotgo_jwt_token',
      'esfotgo_jwt_user',
      'esfotgo_jwt_refresh',
      'epn_express_token',
      'epn_express_user',
    ];

    for (const key of secureKeys) {
      try { await SecureStore.deleteItemAsync(key); } catch { /* may not exist */ }
    }
  }

  static async performFullCleanup(): Promise<void> {
    await Promise.all([
      this.clearAll(),
      this.clearSecureTokens(),
    ]);
  }
}
