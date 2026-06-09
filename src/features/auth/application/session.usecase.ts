import { IAuthRepository } from '../domain/auth.repository';
import { validateJwt, isTokenExpiringSoon } from '@/core/auth/jwt';
import { SessionManager, SessionMetadata } from '@/core/auth/session-manager';
import { TokenCleanupService } from '@/core/auth/token-cleanup';
import type { User } from '@/core/types';

export class ValidateSessionUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<{ user: User; token: string } | null> {
    const session = await this.authRepository.getSession();

    if (!session) {
      console.log('[ValidateSession] Sin sesión');
      return null;
    }

    const jwtResult = validateJwt(session.token);

    if (!jwtResult.valid) {
      console.log('[ValidateSession] JWT inválido:', jwtResult.error);
      if (jwtResult.expired) {
        console.log('[ValidateSession] Token expirado — intentando refresh...');
        const refreshed = await this.authRepository.refreshSession();
        if (refreshed) {
          console.log('[ValidateSession] Sesión refrescada exitosamente');
          await SessionManager.updateLastActive();
          return refreshed;
        }
        console.log('[ValidateSession] Refresh fallido');
      }
      return null;
    }

    if (isTokenExpiringSoon(session.token)) {
      console.log('[ValidateSession] Token próximo a expirar — refrescando preventivamente...');
      const refreshed = await this.authRepository.refreshSession();
      if (refreshed) {
        await SessionManager.updateLastActive();
        return refreshed;
      }
    }

    await SessionManager.updateLastActive();
    return session;
  }
}

export class RefreshSessionUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<{ user: User; token: string } | null> {
    return this.authRepository.refreshSession();
  }
}

export class SecureLogoutUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(queryClient?: { clear: () => void }): Promise<void> {
    try {
      await this.authRepository.signOut();
    } catch {
      // Continue with local cleanup even if server fails
    }

    await TokenCleanupService.performSecureLogout(
      queryClient as Parameters<typeof TokenCleanupService.performSecureLogout>[0]
    );
  }
}

export class RestoreSessionUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(
    onSessionFound: (user: User, token: string) => void,
    onNoSession: () => void
  ): Promise<void> {
    const meta = await SessionManager.getMetadata();
    const isTimedOut = await SessionManager.isSessionTimedOut(
      meta?.rememberMe ? 1440 : 30
    );

    if (isTimedOut) {
      console.log('[RestoreSession] Sesión expiró por timeout — limpiando');
      await SessionManager.performFullCleanup();
      onNoSession();
      return;
    }

    console.log('[RestoreSession] Validando sesión...');
    const validator = new ValidateSessionUseCase(this.authRepository);
    const session = await validator.execute();

    if (session) {
      console.log('[RestoreSession] Sesión válida encontrada');
      onSessionFound(session.user, session.token);
    } else {
      console.log('[RestoreSession] Sesión no válida');
      onNoSession();
    }
  }
}

export class PersistSessionUseCase {
  async execute(rememberMe: boolean): Promise<void> {
    const metadata: SessionMetadata = {
      lastActiveAt: new Date().toISOString(),
      deviceId: null,
      loginMethod: 'email',
      rememberMe,
    };

    await SessionManager.persistMetadata(metadata);
  }
}
