import { useParams } from "react-router";
import PageHeader from "../components/PageHeader";

const BuildingDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <PageHeader
        title="Building Details"
        description={`Manage rooms and information for building #${id}.`}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Building Information</h2>
        <p className="mt-3 text-sm text-gray-500">
          Building ID: {id}
        </p>
      </div>
    </div>
  );
};

export default BuildingDetails;