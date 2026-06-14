import axios, { AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { env } from '@/core/config/env';
import { useAuthStore } from '@/store/auth.store';

// ─── Tipos ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface HttpConfig {
  baseURL: string;
  timeout: number;
  tokenKey: string;
  refreshTokenKey: string;
  refreshEndpoint: string;
  onUnauthorized?: () => void;
}

// ─── Cliente HTTP ─────────────────────────────────────────────

export class HttpClient {
  private instance: AxiosInstance;
  private config: HttpConfig;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(config: HttpConfig) {
    this.config = config;

    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: { 'Content-Type': 'application/json' },
    });

    // Interceptor JWT
    this.instance.interceptors.request.use(
      async (req) => {
        try {
          const token = await SecureStore.getItemAsync(config.tokenKey);
          if (token && req.headers) {
            req.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          console.log('[HttpClient] No se pudo obtener el token del SecureStore');
        }
        return req;
      },
      (error) => {
        console.log('[HttpClient] Error en interceptor de request:', error?.message ?? error);
        return Promise.reject(error);
      }
    );

    // Interceptor de refresh token (respuesta 401)
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        console.log('[HttpClient] Respuesta con error:', {
          status: error.response?.status,
          url: originalRequest?.url,
          method: originalRequest?.method,
          message: error.message,
        });

        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('[HttpClient] 401 detectado — intentando refresh de token...');
          originalRequest._retry = true;

          const newToken = await this.refreshAuthToken();

          if (newToken && originalRequest.headers) {
            console.log('[HttpClient] Token refrescado exitosamente, reintentando petición');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.instance(originalRequest);
          }

          console.log('[HttpClient] Refresh de token fallido — disparando onUnauthorized');
          this.config.onUnauthorized?.();
        }

        return Promise.reject(error);
      }
    );
  }

  // ─── Métodos HTTP ───────────────────────────────────────────

  async get<T>(path: string, token?: string | null): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, token);
  }

  async post<T>(path: string, body?: unknown, token?: string | null): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, token);
  }

  async put<T>(path: string, body?: unknown, token?: string | null): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, token);
  }

  async delete<T>(path: string, token?: string | null): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, token);
  }

  // ─── Core ────────────────────────────────────────────────────

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
    overrideToken?: string | null
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`[HttpClient] ${method} ${path}`);
      const headers: Record<string, string> = {};
      if (overrideToken) {
        headers.Authorization = `Bearer ${overrideToken}`;
      }

      const response = await this.instance.request<T>({
        method,
        url: path,
        data: body,
        headers: overrideToken ? headers : undefined,
      });

      console.log(`[HttpClient] ${method} ${path} → ${response.status}`);
      return {
        data: response.data,
        error: null,
        status: response.status,
      };
    } catch (err) {
      console.log(`[HttpClient] ${method} ${path} → ERROR:`, (err as Error)?.message ?? err);
      return this.handleError<T>(err);
    }
  }

  private handleError<T>(error: unknown): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const responseData = error.response?.data as Record<string, unknown> | undefined;

      const message =
        (responseData?.msg as string) ??
        (responseData?.message as string) ??
        (responseData?.error as string) ??
        error.message;

      if (error.code === 'ECONNABORTED') {
        return { data: null, error: 'La solicitud excedió el tiempo de espera.', status: 0 };
      }

      if (!error.response) {
        return { data: null, error: 'Error de conexión. Verifica tu internet.', status: 0 };
      }

      return { data: null, error: message, status };
    }

    return { data: null, error: 'Error inesperado al comunicarse con el servidor.', status: 0 };
  }

  // ─── Refresh token ──────────────────────────────────────────

  private async refreshAuthToken(): Promise<string | null> {
    // Evitar múltiples refresh simultáneos
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = this._doRefresh();
    const token = await this.refreshPromise;
    this.refreshPromise = null;
    return token;
  }

  private async _doRefresh(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(this.config.refreshTokenKey);
      if (!refreshToken) {
        console.log('[HttpClient] _doRefresh: no hay refreshToken almacenado');
        return null;
      }

      console.log('[HttpClient] _doRefresh: llamando endpoint de refresh...');
      const response = await axios.post<{ token: string; refreshToken?: string }>(
        `${this.config.baseURL}${this.config.refreshEndpoint}`,
        { refreshToken }
      );

      const newToken = response.data.token;
      await SecureStore.setItemAsync(this.config.tokenKey, newToken);
      if (response.data.refreshToken) {
        await SecureStore.setItemAsync(this.config.refreshTokenKey, response.data.refreshToken);
      }

      console.log('[HttpClient] _doRefresh: token renovado exitosamente');
      return newToken;
    } catch (err) {
      console.log('[HttpClient] _doRefresh: error al refrescar token:', (err as Error)?.message ?? err);
      return null;
    }
  }

  // ─── Utilidades ─────────────────────────────────────────────

  /** Permite acceder a la instancia Axios para configuraciones avanzadas */
  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// ─── Instancia por defecto ────────────────────────────────────

export const httpClient = new HttpClient({
  baseURL: env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 15000,
  tokenKey: 'esfotgo_jwt_token',
  refreshTokenKey: 'esfotgo_jwt_refresh',
  refreshEndpoint: '/auth/refresh',
  onUnauthorized: () => {
    const { secureLogout } = useAuthStore.getState();
    secureLogout();
  },
});
