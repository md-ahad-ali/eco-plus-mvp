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



export const getEnergyLogs = (q: EnergyLogQuery, signal?: AbortSignal) => {
  console.log(q);

  const params = new URLSearchParams();

  if (q.building_id !== undefined && q.building_id !== null) {
    params.set("building_id", String(q.building_id));
  }

  if (q.start !== undefined && q.start !== null) {
    params.set("start", String(q.start));
  }

  if (q.end !== undefined && q.end !== null) {
    params.set("end", String(q.end));
  }

  params.set("skip", String(q.skip ?? 0));
  params.set("limit", String(q.limit ?? 200));

  return apiGet<EnergyLogPage>(
    `/api/energy-logs?${params.toString()}`,
    undefined,
    signal,
  );
};

