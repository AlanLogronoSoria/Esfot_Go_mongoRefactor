// ============================================================
// JWT Flow Integration Tests
// ============================================================

import { decodeJwt, validateJwt, getTokenExpiry, getTokenTimeRemaining, isTokenExpiringSoon, extractJwtClaims } from '@/core/auth/jwt';

// ─── Token Helpers ──────────────────────────────────────────

function createTestToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const sig = btoa('fakesignature');
  return `${header}.${body}.${sig}`;
}

function createExpiredToken(): string {
  const exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
  return createTestToken({ sub: 'user123', email: 'test@epn.edu.ec', role: 'estudiante', exp });
}

function createValidToken(): string {
  const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  return createTestToken({ sub: 'user123', email: 'test@epn.edu.ec', role: 'docente', exp });
}

function createExpiringToken(): string {
  const exp = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now
  return createTestToken({ sub: 'user123', exp });
}

// ─── decodeJwt ──────────────────────────────────────────────

describe('decodeJwt', () => {
  it('decodes a valid JWT payload', () => {
    const payload = decodeJwt(createValidToken());
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('user123');
    expect(payload!.email).toBe('test@epn.edu.ec');
  });

  it('returns null for invalid token format', () => {
    expect(decodeJwt('not.a.jwt.token.properly')).toBeNull();
    expect(decodeJwt('')).toBeNull();
    expect(decodeJwt('invalid')).toBeNull();
  });

  it('returns null for malformed base64', () => {
    expect(decodeJwt('x.y.z')).toBeNull();
  });
});

// ─── validateJwt ────────────────────────────────────────────

describe('validateJwt', () => {
  it('validates a valid token', () => {
    const result = validateJwt(createValidToken());
    expect(result.valid).toBe(true);
    expect(result.expired).toBe(false);
  });

  it('detects expired token', () => {
    const result = validateJwt(createExpiredToken());
    expect(result.valid).toBe(false);
    expect(result.expired).toBe(true);
    expect(result.error).toBe('Token expirado');
  });

  it('detects malformed token', () => {
    const result = validateJwt('bad');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Token malformado');
  });
});

// ─── getTokenExpiry ─────────────────────────────────────────

describe('getTokenExpiry', () => {
  it('returns Date for token with exp', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = createTestToken({ exp });
    const date = getTokenExpiry(token);
    expect(date).toBeInstanceOf(Date);
    expect(date!.getTime()).toBe(exp * 1000);
  });

  it('returns null for token without exp', () => {
    expect(getTokenExpiry(createTestToken({ sub: 'x' }))).toBeNull();
  });
});

// ─── isTokenExpiringSoon ────────────────────────────────────

describe('isTokenExpiringSoon', () => {
  it('returns true when expiring in < 5 min', () => {
    expect(isTokenExpiringSoon(createExpiringToken())).toBe(true);
  });

  it('returns false when valid for > 5 min', () => {
    expect(isTokenExpiringSoon(createValidToken())).toBe(false);
  });
});

// ─── extractJwtClaims ───────────────────────────────────────

describe('extractJwtClaims', () => {
  it('extracts userId from sub', () => {
    const claims = extractJwtClaims(createTestToken({ sub: 'abc123' }));
    expect(claims.userId).toBe('abc123');
  });

  it('extracts email', () => {
    const claims = extractJwtClaims(createTestToken({ email: 'x@epn.edu.ec' }));
    expect(claims.email).toBe('x@epn.edu.ec');
  });

  it('extracts role from payload.role (Express format)', () => {
    const claims = extractJwtClaims(createTestToken({ role: 'docente' }));
    expect(claims.role).toBe('docente');
  });

  it('extracts role from user_metadata (Supabase legacy)', () => {
    const claims = extractJwtClaims(createTestToken({ user_metadata: { role: 'administrador' } }));
    expect(claims.role).toBe('administrador');
  });
});
