import { Plus } from "lucide-react";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import { buildingData } from "../data/mockData";

const Buildings = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Buildings & Rooms"
          description="Manage your buildings and their rooms."
        />

        <button className="mb-7 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800">
          <Plus size={18} />
          Add Building
        </button>
      </div>

      <DataTable
        columns={["ID", "Building Name", "Area (m²)", "Status"]}
        rows={buildingData}
      />
    </div>
  );
};

export default Buildings;