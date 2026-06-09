import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';

export type ParsedFile = {
  rows: Record<string, unknown>[];
  fileName: string;
  rowCount: number;
};

export type FilePickResult =
  | { ok: true; uri: string; name: string; mimeType: string }
  | { ok: false; cancelled: true }
  | { ok: false; cancelled: false; error: string };

export async function pickFile(): Promise<FilePickResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'text/csv',
        'text/comma-separated-values',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return { ok: false, cancelled: true };
    const asset = result.assets[0];
    return { ok: true, uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? '' };
  } catch {
    return { ok: false, cancelled: false, error: 'No se pudo abrir el selector de archivos.' };
  }
}

export async function parseFile(uri: string, name: string): Promise<ParsedFile> {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'csv') return parseCsv(uri, name);
  if (ext === 'xlsx' || ext === 'xls') return parseExcel(uri, name);
  throw new Error(`Formato no soportado: .${ext}. Usa archivos CSV o Excel (.xlsx).`);
}

async function parseCsv(uri: string, name: string): Promise<ParsedFile> {
  const content = await FileSystem.readAsStringAsync(uri);
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase(),
      complete: (result) => resolve({ rows: result.data, fileName: name, rowCount: result.data.length }),
      error: (err: Error) => reject(new Error(`Error al parsear CSV: ${err.message}`)),
    });
  });
}

async function parseExcel(uri: string, name: string): Promise<ParsedFile> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  const data = new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('El archivo Excel no contiene hojas.');
  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  const rows = raw.map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), v])));
  return { rows, fileName: name, rowCount: rows.length };
}
