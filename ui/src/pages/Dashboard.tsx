import { Building2, Zap, Leaf, Activity, Thermometer } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import AsyncState from "../components/AsyncState";
import { useApi } from "../hooks/useApi";
import { getBuildingTotals, getSummary, getTimeseries } from "../api/analytics";
import { getHealth } from "../api/system";

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 2 });

const Dashboard = () => {
  // Four API calls run in parallel when the page opens.
  const summary = useApi((s) => getSummary({}, s), []); // GET /api/analytics/summary
  const buildings = useApi((s) => getBuildingTotals({}, s), []); // GET /api/analytics/buildings
  const monthly = useApi((s) => getTimeseries({ granularity: "month" }, s), []); // GET /api/analytics/timeseries
  const health = useApi((s) => getHealth(s), []); // GET /health

  const loading = summary.loading || buildings.loading || monthly.loading;
  const error = summary.error ?? buildings.error ?? monthly.error;
  const retry = () => {
    summary.refetch();
    buildings.refetch();
    monthly.refetch();
    health.refetch();
  };

  const status = health.loading ? "Checking" : health.data?.status === "healthy" ? "Active" : "Offline";
  console.log(summary);
  console.log(buildings);
  console.log(monthly);
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your smart energy management system." />

      <AsyncState loading={loading} error={error} onRetry={retry}>
        {summary.data && (
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Buildings" value={String(buildings.data?.length ?? 0)} description="Buildings with energy logs" icon={Building2} />
            <StatCard title="Energy Consumption" value={`${fmt(summary.data.total_kwh)} kWh`} description={`Cost: €${fmt(summary.data.cost_eur)}`} icon={Zap} />
            <StatCard title="CO₂ Emissions" value={`${fmt(summary.data.carbon_kg_co2 / 1000)} Tons`} description="Estimated emissions" icon={Leaf} />
            <StatCard title="Average Indoor Temperature" value={`${summary.data.avg_indoor_temp} °C`} description="Average across all rooms" icon={Thermometer}/>
            {/* <StatCard title="System Status" value={status} description="Backend connection" icon={Activity} /> */}
          </div>
        )}

        <ChartCard
          title="Monthly Energy Consumption"
          data={(monthly.data ?? []).map((p) => ({ period: p.period, kwh: p.total_kwh }))}
          xKey="period"
          yKey="kwh"
        />
      </AsyncState>
    </div>
  );
};

export default Dashboard;
