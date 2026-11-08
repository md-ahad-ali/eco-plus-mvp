import { apiGet, apiSend } from "../lib/api";

export interface Building {
  id: number;
  name: string;
  area_sqm: number;
}

export interface BuildingInput {
  name?: string;
  area_sqm?: number;
}

export const listBuildings = (q?: string, signal?: AbortSignal) =>
  apiGet<Building[]>("/api/buildings", { q }, signal);

export const getBuilding = (id: number, signal?: AbortSignal) =>
  apiGet<Building>(`/api/buildings/${id}`, {}, signal);

export const createBuilding = (input: BuildingInput) =>
  apiSend<Building>("POST", "/api/buildings", input);

export const updateBuilding = (id: number, input: BuildingInput) =>
  apiSend<Building>("PUT", `/api/buildings/${id}`, input);

export const deleteBuilding = (id: number) =>
  apiSend<undefined>("DELETE", `/api/buildings/${id}`);
