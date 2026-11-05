import { Download, FileText } from "lucide-react";
import PageHeader from "../components/PageHeader";

const Reports = () => {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and review energy and sustainability reports."
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">Generate Report</h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Report Type</label>
            <select className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-green-600">
              <option>Energy Consumption</option>
              <option>Sustainability</option>
              <option>Carbon Emissions</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Period</label>
            <select className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-green-600">
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
        </div>

        <button className="mt-6 flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800">
          <FileText size={18} />
          Generate Report
        </button>

        <div className="mt-8 rounded-lg bg-gray-50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-green-700" />
              <div>
                <p className="text-sm font-semibold">Monthly Energy Report</p>
                <p className="text-xs text-gray-500">Sample report</p>
              </div>
            </div>

            <button aria-label="Download report" className="text-green-700 hover:text-green-900">
              <Download size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;