import { apiGet, apiSend } from "../lib/api";

export interface Room {
  id: number;
  building_id: number;
  room_name: string;
  occupant_id: number | null;
  occupant_username: string | null;
}

export interface OccupantOption {
  id: number;
  username: string;
  email: string;
}

export const searchOccupants = (q: string, signal?: AbortSignal) =>
  apiGet<OccupantOption[]>("/api/occupants", { q }, signal);

export interface RoomInput {
  building_id?: number;
  room_name?: string;
  occupant_id?: number | null;
}

export const listRooms = (buildingId: number, q?: string, signal?: AbortSignal) =>
  apiGet<Room[]>(`/api/buildings/${buildingId}/rooms`, { q }, signal);

export const createRoom = (input: RoomInput) => apiSend<Room>("POST", "/api/rooms", input);

export const updateRoom = (id: number, input: RoomInput) =>
  apiSend<Room>("PUT", `/api/rooms/${id}`, input);

export const deleteRoom = (id: number) => apiSend<undefined>("DELETE", `/api/rooms/${id}`);
