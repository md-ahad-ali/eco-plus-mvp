import { useEffect, useState } from "react";
import { Leaf, TrendingUp, Euro, Thermometer } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import AsyncState from "../components/AsyncState";
import { useApi } from "../hooks/useApi";
import {
  getAnomalies,
  getBuildingTotals,
  getBuildingTotalsByUser,
  getForecast,
  getRoomTotals,
  getSustainability,
  getTimeseries,
  type Granularity,
} from "../api/analytics";
import { getCurrentUser } from "../lib/auth";

const field = "rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-green-600";
const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 2 });
const hourLabel = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" });

const Analytics = () => {
  const user = getCurrentUser();
  const [buildingId, setBuildingId] = useState<number | undefined>();
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const range = { start: start || undefined, end: end || undefined };

  const buildings = useApi(
    (s) =>
      user
        ? getBuildingTotalsByUser(user.id, {}, s)
        : Promise.resolve([]),
    [user?.id]
  );

  useEffect(() => {
    if (buildingId === undefined && buildings.data?.length) {
      setBuildingId(buildings.data[0].building_id);
    }
  }, [buildings.data, buildingId]);

  const deps = [buildingId, start, end];
  const sustain = useApi(
    (s) => (buildingId ? getSustainability(buildingId, range, s) : Promise.resolve(null)), deps);
  const trend = useApi(
    (s) => getTimeseries({ building_id: buildingId, granularity, ...range }, s),
    [...deps, granularity]);
  const rooms = useApi(
    (s) => (buildingId ? getRoomTotals(buildingId, range, s) : Promise.resolve([])), deps);
  const anomalies = useApi(
    (s) => (buildingId ? getAnomalies(buildingId, range, 3, s) : Promise.resolve([])), deps);
  const forecast = useApi(
    (s) => (buildingId ? getForecast(buildingId, 14, s) : Promise.resolve([])), [buildingId]);

  const roomName = (id: number) => rooms.data?.find((r) => r.room_id === id)?.room_name ?? `Room ${id}`;
  const d = sustain.data;

  return (
    <div>
      <PageHeader
        title="Analytics & Sustainability"
        description="Monitor energy efficiency and sustainability performance."
      />

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <label className="text-sm font-medium">
          <span className="mb-1 block">Building</span>
          <select className={field} value={buildingId ?? ""} onChange={(e) => setBuildingId(Number(e.target.value))}>
            {buildings.data?.map((b) => (
              <option key={b.building_id} value={b.building_id}>{b.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          <span className="mb-1 block">From</span>
          <input type="date" className={field} value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="text-sm font-medium">
          <span className="mb-1 block">To</span>
          <input type="date" className={field} value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <label className="text-sm font-medium">
          <span className="mb-1 block">Group by</span>
          <select className={field} value={granularity} onChange={(e) => setGranularity(e.target.value as Granularity)}>
            <option value="hour">Hour</option>
            <option value="day">Day</option>
            <option value="month">Month</option>
          </select>
        </label>
      </div>

      <AsyncState loading={buildings.loading} error={buildings.error} onRetry={buildings.refetch}>
        {!buildings.data?.length ? (
          <p className="text-sm text-gray-500">No energy data yet. Upload a CSV file on the Energy Data page.</p>
        ) : (
          <div className="space-y-6">
            <AsyncState loading={sustain.loading} error={sustain.error} onRetry={sustain.refetch}>
              {d && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard title="Sustainability Score" value={`${d.score} / 100`} description={`Grade ${d.grade} over ${d.days} days`} icon={TrendingUp} />
                  <StatCard title="Carbon Footprint" value={`${fmt(d.carbon_kg_co2)} kg CO₂`} description={`${fmt(d.total_kwh)} kWh used`} icon={Leaf} />
                  <StatCard title="Electricity Cost" value={`€${fmt(d.cost_eur)}`} description="Selected period" icon={Euro} />
                  <StatCard title="Average Indoor Temp" value={`${d.avg_indoor_temp} °C`} description="All rooms" icon={Thermometer} />
                </div>
              )}
            </AsyncState>

            <AsyncState loading={trend.loading} error={trend.error} onRetry={trend.refetch}>
              <ChartCard
                title="Energy Consumption Trends"
                data={(trend.data ?? []).map((p) => ({ period: p.period, kwh: p.total_kwh }))}
                xKey="period"
                yKey="kwh"
              />
            </AsyncState>

            <AsyncState loading={forecast.loading} error={forecast.error} onRetry={forecast.refetch}>
              <ChartCard
                title="Forecast: Next 24 Hours"
                data={(forecast.data ?? []).map((p) => ({ time: hourLabel(p.timestamp), kwh: p.predicted_kwh }))}
                xKey="time"
                yKey="kwh"
                color="#2563eb"
              />
            </AsyncState>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">Consumption by Room</h3>
              <AsyncState loading={rooms.loading} error={rooms.error} onRetry={rooms.refetch}>
                <DataTable
                  columns={["Room", "Energy (kWh)", "Cost (€)", "CO₂ (kg)"]}
                  rows={(rooms.data ?? []).map((r) => [r.room_name, r.total_kwh, r.cost_eur, r.carbon_kg_co2])}
                />
              </AsyncState>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">Abnormal Consumption</h3>
              <AsyncState loading={anomalies.loading} error={anomalies.error} onRetry={anomalies.refetch}>
                {anomalies.data?.length ? (
                  <DataTable
                    columns={["Room", "Time", "Energy (kWh)", "Z-score"]}
                    rows={anomalies.data.map((a) => [roomName(a.room_id), new Date(a.timestamp).toLocaleString("en-GB"), a.kwh, a.z_score])}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No abnormal readings found.</p>
                )}
              </AsyncState>
            </div>
          </div>
        )}
      </AsyncState>
    </div>
  );
};

export default Analytics;
