import type { AuthResponse, Role, User } from "../api/auth";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function saveSession({ access_token, user }: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY)) && getCurrentUser() !== null;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Only admins can add, edit and delete buildings and rooms. */
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

/** admin and building_manager can upload and manage energy data (managers: their own buildings). */
export function canManage(user: User | null): boolean {
  const manageRoles: Role[] = ["admin", "building_manager"];
  return user !== null && manageRoles.includes(user.role);
}
