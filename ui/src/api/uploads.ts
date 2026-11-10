import { apiGet, apiUpload } from "../lib/api";

export interface CsvUpload {
  id: number;
  filename: string;
  status: string; // completed | processing | failed | processed
}

export interface CsvImportResult {
  upload_id: number;
  filename: string;
  status: string;
  rows_total: number;
  rows_inserted: number;
  rows_deleted: number;
}

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export const uploadCsv = (file: File) => {
  const form = new FormData();
  form.append("file", file); // field name must be "file"
  return apiUpload<CsvImportResult>("/api/uploads/file", form);
};

export const getUploads = (signal?: AbortSignal) =>
  apiGet<CsvUpload[]>("/api/uploads", {}, signal);