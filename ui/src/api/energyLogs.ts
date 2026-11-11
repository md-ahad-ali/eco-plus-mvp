import { apiGet } from "../lib/api";

export interface EnergyLogRow {
  id: number;
  timestamp: string;
  building_id: number;
  building_name: string;
  room_id: number;
  room_name: string;
  energy_consumed_kwh: number;
  indoor_temp: number;
}

export interface EnergyLogPage {
  items: EnergyLogRow[];
  total: number;
  skip: number;
  limit: number;
}

export interface EnergyLogQuery {
  building_id?: number;
  start?: string; // YYYY-MM-DD
  end?: string; // YYYY-MM-DD
  skip: number;
  limit: number;
}

export const getEnergyLogs = (q: EnergyLogQuery, signal?: AbortSignal) =>
  apiGet<EnergyLogPage>(
    "/api/energy-logs",
    {
      building_id: q.building_id,
      start: q.start ? `${q.start}T00:00:00` : undefined,
      end: q.end ? `${q.end}T23:59:59` : undefined,
      skip: q.skip,
      limit: q.limit,
    },
    signal,
  );