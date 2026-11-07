import { apiGet } from "../lib/api";

export interface Totals {
  total_kwh: number;
  cost_eur: number;
  carbon_kg_co2: number;
}
export interface Summary extends Totals {
  avg_indoor_temp: number;
}
export interface BuildingTotals extends Totals {
  building_id: number;
  name: string;
}
export interface RoomTotals extends Totals {
  room_id: number;
  room_name: string;
}
export interface TimePoint extends Totals {
  period: string;
}
export interface Sustainability extends Summary {
  building_id: number;
  name: string;
  days: number;
  score: number;
  grade: "A" | "B" | "C" | "D";
}
export interface Anomaly {
  room_id: number;
  timestamp: string;
  kwh: number;
  z_score: number;
}
export interface ForecastPoint {
  timestamp: string;
  predicted_kwh: number;
}

export interface Range {
  start?: string; // YYYY-MM-DD
  end?: string; // YYYY-MM-DD
}
export type Granularity = "hour" | "day" | "month";

const toRange = ({ start, end }: Range) => ({
  start: start ? `${start}T00:00:00` : undefined,
  end: end ? `${end}T23:59:59` : undefined,
});

const BASE = "/api/analytics";

export const getSummary = (range: Range & { building_id?: number }, signal?: AbortSignal) =>
  apiGet<Summary>(`${BASE}/summary`, { building_id: range.building_id, ...toRange(range) }, signal);

export const getBuildingTotals = (range: Range, signal?: AbortSignal) =>
  apiGet<BuildingTotals[]>(`${BASE}/buildings`, toRange(range), signal);

export const getRoomTotals = (buildingId: number, range: Range, signal?: AbortSignal) =>
  apiGet<RoomTotals[]>(`${BASE}/buildings/${buildingId}/rooms`, toRange(range), signal);

export const getTimeseries = (
  opts: Range & { building_id?: number; granularity: Granularity },
  signal?: AbortSignal,
) =>
  apiGet<TimePoint[]>(
    `${BASE}/timeseries`,
    { building_id: opts.building_id, granularity: opts.granularity, ...toRange(opts) },
    signal,
  );

