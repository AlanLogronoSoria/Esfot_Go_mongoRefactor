export type BulkUploadTarget = 'usuarios' | 'pois';

export type BulkRowStatus = 'valid' | 'invalid' | 'pending';

export interface BulkRow {
  index: number;
  raw: Record<string, unknown>;
  status: BulkRowStatus;
  errors: string[];
}

export interface UploadResult {
  total: number;
  inserted: number;
  failed: number;
  errors: RowError[];
}

export interface RowError {
  index: number;
  row: Record<string, unknown>;
  reason: string;
}

export type UploadPhase =
  | 'idle'
  | 'parsing'
  | 'previewing'
  | 'uploading'
  | 'success'
  | 'error';
