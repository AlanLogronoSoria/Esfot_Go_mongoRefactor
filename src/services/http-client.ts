// ============================================================
// Unified HTTP Client — Single export for all repositories
// ============================================================
// Migrate imports gradually:
//   import { httpClient } from '@/services/http-client';
// Legacy code still works with:
//   import { expressClient } from '@/services/express/api-client';
// ============================================================

import { HttpClient } from '@/services/express/http-client';
import { env } from '@/core/config/env';

export const httpClient = new HttpClient({
  baseURL: env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 15000,
  tokenKey: 'esfotgo_jwt_token',
  refreshTokenKey: 'esfotgo_jwt_refresh',
  refreshEndpoint: '/auth/refresh',
});

export type { ApiResponse } from '@/services/express/http-client';
