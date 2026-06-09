import { SessionManager } from './session-manager';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class TokenCleanupService {
  static async executeServerSideSignOut(): Promise<void> {
    // Express JWT: no server-side invalidation needed. Token is removed client-side.
  }

  static async clearQueryCache(queryClient?: { clear: () => void }): Promise<void> {
    try { queryClient?.clear(); } catch { /* best effort */ }
  }

  static async clearExpressSession(): Promise<void> {
    const keys = ['epn_express_token', 'epn_express_user'];
    for (const key of keys) {
      try { await SecureStore.deleteItemAsync(key); } catch { /* may not exist */ }
    }
  }

  static async clearAuthStorage(): Promise<void> {
    const keys = ['esfotgo_jwt_token', 'esfotgo_jwt_user', 'esfotgo_jwt_refresh'];
    for (const key of keys) {
      try { await SecureStore.deleteItemAsync(key); } catch { /* may not exist */ }
    }
  }

  static async clearApplicationCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const epnKeys = keys.filter(
        (k) => k.startsWith('epn_') || k.includes('auth') || k.includes('token')
      );
      if (epnKeys.length > 0) await AsyncStorage.multiRemove(epnKeys);
    } catch { /* best effort */ }
  }

  static async invalidateRemoteSession(): Promise<void> {
    // Express JWT: invalidation is local-only
  }

  static async performSecureLogout(queryClient?: { clear: () => void }): Promise<void> {
    console.log('[TokenCleanup] Iniciando limpieza completa de tokens...');
    const tasks: Promise<void>[] = [
      this.executeServerSideSignOut(),
      this.clearAuthStorage(),
      this.clearExpressSession(),
      this.clearApplicationCache(),
      SessionManager.performFullCleanup(),
      this.clearQueryCache(queryClient),
    ];
    const results = await Promise.allSettled(tasks);
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) {
      console.log('[TokenCleanup] Limpieza completada con', failed, 'errores menores');
    } else {
      console.log('[TokenCleanup] Limpieza completada exitosamente');
    }
  }

  static async performFullInvalidation(queryClient?: { clear: () => void }): Promise<void> {
    await this.invalidateRemoteSession();
    await this.performSecureLogout(queryClient);
  }
}
