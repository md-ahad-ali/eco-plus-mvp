import { apiGet, apiSend } from "../lib/api";

export type Role = "admin" | "building_manager" | "occupant";

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  building_name?: string | null;
  room_name?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const login = (username: string, password: string) =>
  apiSend<AuthResponse>("POST", "/api/auth/login", { username, password });

export const register = (username: string, email: string, password: string, role: Role) =>
  apiSend<AuthResponse>("POST", "/api/auth/register", { username, email, password, role });

export const forgotPassword = (email: string) =>
  apiSend<{ message: string }>("POST", "/api/auth/forgot-password", { email });

export const resetPassword = (token: string, newPassword: string) =>
  apiSend<{ message: string }>("POST", "/api/auth/reset-password", {
    token,
    new_password: newPassword,
  });

export const getMe = (signal?: AbortSignal) => apiGet<User>("/api/auth/me", {}, signal);
