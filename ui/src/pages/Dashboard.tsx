import {
  Building2,
  Zap,
  Leaf,
  Activity,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { energyData } from "../data/mockData";

const Dashboard = () => {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your smart energy management system."
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Buildings" value="12" description="Registered buildings" icon={Building2} />
        <StatCard title="Energy Consumption" value="24,580 kWh" description="Current reporting period" icon={Zap} />
        <StatCard title="CO₂ Emissions" value="8.4 Tons" description="Estimated emissions" icon={Leaf} />
        <StatCard title="System Status" value="Active" description="Monitoring operational" icon={Activity} />
      </div>

      <ChartCard title="Monthly Energy Consumption" data={energyData} />
    </div>
  );
};

export default Dashboard;