import { useCallback } from 'react';
import { AuthService } from '../services/auth.service';

export function useInstitutionalLookup() {
  const lookup = useCallback(async (email: string, role: 'estudiante' | 'docente') => {
    try {
      const repo = AuthService.getInstance().getRepository();
      return await repo.lookupInstitutionalUser(email, role);
    } catch {
      return null;
    }
  }, []);

  return { lookup };
}
