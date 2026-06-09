import type { BulkUploadTarget, UploadResult } from './bulk-upload.entity';
import type { UserRowInput, PoiRowInput } from './bulk-upload.schema';

export interface BulkUploadRepository {
  uploadUsers(rows: UserRowInput[], token: string, fileUri: string, fileName: string, fileMimeType: string): Promise<UploadResult>;
  uploadPois(rows: PoiRowInput[], token: string, fileUri: string, fileName: string, fileMimeType: string): Promise<UploadResult>;
  upload(target: BulkUploadTarget, rows: (UserRowInput | PoiRowInput)[], token: string, fileUri: string, fileName: string, fileMimeType: string): Promise<UploadResult>;
}
