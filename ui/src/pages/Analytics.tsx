import { Leaf, TrendingUp } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ChartCard from "../components/ChartCard";
import { energyData } from "../data/mockData";

const Analytics = () => {
  return (
    <div>
      <PageHeader
        title="Analytics & Sustainability"
        description="Monitor energy efficiency and sustainability performance."
      />

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Leaf className="mb-3 text-green-600" />
          <p className="text-sm text-gray-500">Carbon Footprint</p>
          <h2 className="mt-2 text-2xl font-bold">8.4 Tons CO₂</h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <TrendingUp className="mb-3 text-green-600" />
          <p className="text-sm text-gray-500">Energy Efficiency</p>
          <h2 className="mt-2 text-2xl font-bold">87%</h2>
        </div>
      </div>

      <ChartCard title="Energy Consumption Trends" data={energyData} />
    </div>
  );
};

export default Analytics;