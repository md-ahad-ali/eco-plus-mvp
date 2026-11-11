import { apiGet, apiSend } from "../lib/api";

export interface Building {
  id: number;
  user_id: number;
  manager_username: string;
  name: string;
  area_sqm: number;
}

export interface BuildingInput {
  name?: string;
  area_sqm?: number;
  /** Id of the building manager who manages the building. */
  user_id?: number;
}

export interface ManagerOption {
  id: number;
  username: string;
  email: string;
}

export const searchManagers = (q: string, signal?: AbortSignal) =>
  apiGet<ManagerOption[]>("/api/buildings/managers", { q }, signal);

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
