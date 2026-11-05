import { Upload, Zap } from "lucide-react";
import PageHeader from "../components/PageHeader";

const EnergyData = () => {
  return (
    <div>
      <PageHeader
        title="Energy Data Management"
        description="Upload and manage energy consumption records."
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-3 text-green-700">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="font-semibold">Upload Energy Data</h2>
            <p className="text-sm text-gray-500">Import CSV energy records.</p>
          </div>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center hover:border-green-500">
          <Upload size={35} className="mb-3 text-green-700" />
          <p className="font-medium text-gray-700">Choose CSV file</p>
          <p className="mt-1 text-xs text-gray-400">
            Select a CSV file from your computer
          </p>
          <input type="file" accept=".csv" className="hidden" />
        </label>
      </div>
    </div>
  );
};

export default EnergyData;