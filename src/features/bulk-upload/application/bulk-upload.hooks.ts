import { useState, useCallback, useRef } from 'react';
import { pickAndParseFile, submitValidRows } from './bulk-upload.usecases';
import { bulkUploadRepository } from '../infrastructure/mongo-bulk-upload.repository';
import type { BulkRow, BulkUploadTarget, UploadPhase, UploadResult } from '../domain/bulk-upload.entity';
import { useExpressAuthStore } from '@/services/express/express-auth.store';

interface BulkUploadState {
  phase: UploadPhase;
  target: BulkUploadTarget;
  fileName: string | null;
  rows: BulkRow[];
  result: UploadResult | null;
  errorMessage: string | null;
}

export function useBulkUpload() {
  const token = useExpressAuthStore((s) => s.expressToken);
  const fileRef = useRef<{ uri: string; mimeType: string } | null>(null);

  const [state, setState] = useState<BulkUploadState>({
    phase: 'idle', target: 'usuarios', fileName: null, rows: [], result: null, errorMessage: null,
  });

  const setTarget = useCallback((target: BulkUploadTarget) => {
    setState((prev) => ({ ...prev, target, phase: 'idle' as const, fileName: null, rows: [], result: null, errorMessage: null }));
    fileRef.current = null;
  }, []);

  const handlePickFile = useCallback(async () => {
    setState((prev) => ({ ...prev, phase: 'parsing', errorMessage: null }));
    try {
      const parsed = await pickAndParseFile(state.target);
      if (!parsed) { setState((prev) => ({ ...prev, phase: 'idle' })); return; }
      fileRef.current = { uri: parsed.fileUri, mimeType: parsed.fileMimeType };
      setState((prev) => ({ ...prev, phase: 'previewing', rows: parsed.rows, fileName: parsed.fileName, result: null }));
    } catch (err) {
      setState((prev) => ({ ...prev, phase: 'error', errorMessage: err instanceof Error ? err.message : 'Error al procesar el archivo.' }));
    }
  }, [state.target]);

  const upload = useCallback(async () => {
    if (!token) { setState((prev) => ({ ...prev, phase: 'error', errorMessage: 'No hay sesión de administrador activa.' })); return; }
    const file = fileRef.current;
    if (!file) { setState((prev) => ({ ...prev, phase: 'error', errorMessage: 'No hay archivo seleccionado.' })); return; }
    setState((prev) => ({ ...prev, phase: 'uploading', errorMessage: null }));
    try {
      const result = await submitValidRows(state.rows, state.target, token, bulkUploadRepository, file.uri, state.fileName ?? 'data.xlsx', file.mimeType);
      setState((prev) => ({ ...prev, phase: 'success', result }));
    } catch (err) {
      setState((prev) => ({ ...prev, phase: 'error', errorMessage: err instanceof Error ? err.message : 'Error al enviar los datos.' }));
    }
  }, [state.rows, state.target, state.fileName, token]);

  const reset = useCallback(() => {
    fileRef.current = null;
    setState({ phase: 'idle', target: state.target, fileName: null, rows: [], result: null, errorMessage: null });
  }, [state.target]);

  const validCount = state.rows.filter((r) => r.status === 'valid').length;
  const invalidCount = state.rows.filter((r) => r.status === 'invalid').length;

  return { ...state, validCount, invalidCount, setTarget, pickFile: handlePickFile, upload, reset };
}
