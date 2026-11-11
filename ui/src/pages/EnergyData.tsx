import { useRef, useState, type DragEvent } from "react";
import { CheckCircle2, FileText, Loader2, Upload, XCircle, Zap } from "lucide-react";
import EnergyLogsTable from "../components/EnergyLogsTable";
import PageHeader from "../components/PageHeader";
import AsyncState from "../components/AsyncState";
import { useApi } from "../hooks/useApi";
import { getCurrentUser, canManage } from "../lib/auth";
import {
  getUploads,
  uploadCsv,
  MAX_UPLOAD_BYTES,
  type CsvImportResult,
} from "../api/uploads";

const REQUIRED_COLUMNS = [
  "username",
  "building_name",
  "room_name",
  "timestamp",
  "energy_consumed_kwh",
  "indoor_temp",
];

const statusStyle: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  processed: "bg-green-100 text-green-700",
  processing: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function validateFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".csv")) return "Only .csv files are allowed.";
  if (file.size > MAX_UPLOAD_BYTES) return "File is larger than 50 MB.";
  if (file.size === 0) return "The file is empty.";
  return null;
}

const EnergyData = () => {
  const user = getCurrentUser();
  const allowed = canManage(user);
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);

  const uploads = useApi((s) => getUploads(s), []);

  const pickFile = (f: File | undefined) => {
    setResult(null);
    if (!f) return;
    const problem = validateFile(f);
    setError(problem);
    setFile(problem ? null : f);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

   const reset = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await uploadCsv(file));
      setRefreshKey((k) => k + 1);
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      uploads.refetch(); // also shows failed uploads in the history
    }
  };

  return (
    <div>
      <PageHeader
        title="Energy Data Management"
        description="Upload and manage energy consumption records."
      />

      <div className="space-y-6">
        {allowed && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3 text-green-700">
                <Zap size={24} />
              </div>
              <div>
                <h2 className="font-semibold">Upload Energy Data</h2>
                <p className="text-sm text-gray-500">Import CSV energy records (max 50 MB).</p>
              </div>
            </div>

            <label
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center hover:border-green-500 ${
                dragging ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"
              }`}
            >
              <Upload size={35} className="mb-3 text-green-700" />
              <p className="font-medium text-gray-700">Choose CSV file</p>
              <p className="mt-1 text-xs text-gray-400">
                Click to browse or drag and drop a file here
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                disabled={uploading}
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </label>

            {file && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText size={18} className="text-green-700" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-gray-400">{formatSize(file.size)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={reset}
                    disabled={uploading}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
                  >
                    {uploading && <Loader2 size={16} className="animate-spin" />}
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <XCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <div className="mb-2 flex items-center gap-2 font-medium">
                  <CheckCircle2 size={18} />
                  Import finished: {result.filename}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-white p-2">
                    <div className="text-lg font-semibold">{result.rows_total}</div>
                    <div className="text-xs text-gray-500">Rows in file</div>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <div className="text-lg font-semibold text-green-700">{result.rows_inserted}</div>
                    <div className="text-xs text-gray-500">Inserted</div>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <div className="text-lg font-semibold text-amber-600">{result.rows_deleted}</div>
                    <div className="text-xs text-gray-500">Skipped</div>
                  </div>
                </div>
                {result.rows_deleted > 0 && (
                  <p className="mt-3 text-xs text-gray-600">
                    Skipped rows had missing or out-of-range values, an unknown user, building or
                    room, or were duplicates of existing readings.
                  </p>
                )}
              </div>
            )}

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="mb-2 text-xs font-medium text-gray-500">Required columns</p>
              <div className="flex flex-wrap gap-2">
                {REQUIRED_COLUMNS.map((c) => (
                  <code key={c} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    {c}
                  </code>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                kWh must be 0–1000 and indoor temperature −30 to 60 °C. Users, buildings and
                rooms must already exist.
              </p>
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-800">Upload History</h3>
          <AsyncState loading={uploads.loading} error={uploads.error} onRetry={uploads.refetch}>
            {uploads.data?.length ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">ID</th>
                      <th className="px-4 py-3 font-medium">File</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {uploads.data.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3 text-gray-500">{u.id}</td>
                        <td className="px-4 py-3">{u.filename}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                              statusStyle[u.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No uploads yet.</p>
            )}
          </AsyncState>
        </div>
        <EnergyLogsTable refreshKey={refreshKey} />
      </div>
    </div>
  );
};

export default EnergyData;