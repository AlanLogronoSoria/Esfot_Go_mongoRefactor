import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { ExpressAuthRepository } from '@/services/express/express-repositories';
import type { ExpressUser, ExpressLoginInput } from '@/services/express/express-types';

const EXPRESS_TOKEN_KEY = 'epn_express_token';
const EXPRESS_USER_KEY = 'epn_express_user';

interface ExpressAuthState {
  expressUser: ExpressUser | null;
  expressToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  initializeExpress: () => Promise<void>;
  loginEstudiante: (input: ExpressLoginInput) => Promise<ExpressUser>;
  loginDocente: (input: ExpressLoginInput) => Promise<ExpressUser>;
  loginAdmin: (input: ExpressLoginInput) => Promise<ExpressUser>;
  logoutExpress: () => Promise<void>;
  loadStoredExpressSession: () => Promise<ExpressUser | null>;
  getExpressToken: () => string | null;
}

const authRepo = new ExpressAuthRepository();

export const useExpressAuthStore = create<ExpressAuthState>((set, get) => ({
  expressUser: null,
  expressToken: null,
  isLoading: false,
  isInitialized: false,

  initializeExpress: async () => {
    try {
      set({ isLoading: true });
      console.log('[ExpressAuth] Inicializando...');
      const user = await get().loadStoredExpressSession();
      if (user) {
        console.log('[ExpressAuth] Sesión express restaurada para:', user.email);
        set({ expressUser: user });
      } else {
        console.log('[ExpressAuth] Sin sesión express almacenada');
      }
    } catch (err) {
      console.log('[ExpressAuth] Error en initializeExpress:', (err as Error)?.message ?? err);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  loginEstudiante: async (input: ExpressLoginInput) => {
    set({ isLoading: true });
    console.log('[ExpressAuth] loginEstudiante:', input.email);
    try {
      const res = await authRepo.loginEstudiante(input);
      if (res.error || !res.data) {
        console.log('[ExpressAuth] loginEstudiante error:', res.error);
        throw new Error(res.error ?? 'Error al iniciar sesión');
      }

      const { token, user } = res.data;
      console.log('[ExpressAuth] loginEstudiante exitoso:', user.email);
      await SecureStore.setItemAsync(EXPRESS_TOKEN_KEY, token);
      await SecureStore.setItemAsync(EXPRESS_USER_KEY, JSON.stringify(user));
      set({ expressUser: user, expressToken: token });
      return user;
    } catch (err) {
      console.log('[ExpressAuth] loginEstudiante excepción:', (err as Error)?.message ?? err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loginAdmin: async (input: ExpressLoginInput) => {
    set({ isLoading: true });
    console.log('[ExpressAuth] loginAdmin:', input.email);
    try {
      const res = await authRepo.loginAdmin(input);
      if (res.error || !res.data) {
        console.log('[ExpressAuth] loginAdmin error:', res.error);
        throw new Error(res.error ?? 'Error al iniciar sesión');
      }

      const { token, user } = res.data;
      console.log('[ExpressAuth] loginAdmin exitoso:', user.email);
      await SecureStore.setItemAsync(EXPRESS_TOKEN_KEY, token);
      await SecureStore.setItemAsync(EXPRESS_USER_KEY, JSON.stringify(user));
      set({ expressUser: user, expressToken: token });
      return user;
    } catch (err) {
      console.log('[ExpressAuth] loginAdmin excepción:', (err as Error)?.message ?? err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loginDocente: async (input: ExpressLoginInput) => {
    set({ isLoading: true });
    console.log('[ExpressAuth] loginDocente:', input.email);
    try {
      const res = await authRepo.loginDocente(input);
      if (res.error || !res.data) {
        console.log('[ExpressAuth] loginDocente error:', res.error);
        throw new Error(res.error ?? 'Error al iniciar sesión');
      }

      const { token, user } = res.data;
      console.log('[ExpressAuth] loginDocente exitoso:', user.email);
      await SecureStore.setItemAsync(EXPRESS_TOKEN_KEY, token);
      await SecureStore.setItemAsync(EXPRESS_USER_KEY, JSON.stringify(user));
      set({ expressUser: user, expressToken: token });
      return user;
    } catch (err) {
      console.log('[ExpressAuth] loginDocente excepción:', (err as Error)?.message ?? err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logoutExpress: async () => {
    console.log('[ExpressAuth] logoutExpress...');
    try {
      await SecureStore.deleteItemAsync(EXPRESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(EXPRESS_USER_KEY);
    } catch (err) {
      console.log('[ExpressAuth] Error limpiando SecureStore:', (err as Error)?.message ?? err);
    }
    set({ expressUser: null, expressToken: null });
  },

  loadStoredExpressSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(EXPRESS_TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(EXPRESS_USER_KEY);

      if (token && userJson) {
        const user = JSON.parse(userJson) as ExpressUser;
        set({ expressToken: token });
        return user;
      }
      return null;
    } catch {
      return null;
    }
  },

  getExpressToken: () => {
    return get().expressToken;
  },
}));
