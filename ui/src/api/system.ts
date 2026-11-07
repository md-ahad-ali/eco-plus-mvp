import { apiGet } from "../lib/api";

export const getHealth = (signal?: AbortSignal) =>
  apiGet<{ status: string }>("/health", {}, signal);
