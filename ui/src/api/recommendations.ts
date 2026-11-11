
import { apiGet, apiSend } from "../lib/api";
import {
  PAGE_SIZE,
  toRange,
  type Range,
} from "../lib/recommendations";

/** Matches the backend RecommendationResponse schema. */
export interface Recommendation {
  id: number;
  building_id: number;
  /** Naive UTC timestamp from the API (no Z). */
  created_at: string;
  recommendation_text: string;
  estimated_savings_percent: number;
}

const BASE = "/api/recommendations";

/** GET /api/recommendations/buildings/{id}: history, newest first. */
export const listRecommendations = (
  buildingId: number,
  limit = PAGE_SIZE,
  offset = 0,
  signal?: AbortSignal,
) =>
  apiGet<Recommendation[]>(
    `${BASE}/buildings/${buildingId}`,
    { limit, offset },
    signal,
  );

/**
 * POST /api/recommendations/buildings/{id}
 * Generates a new AI recommendation.
 */
export const createRecommendation = (
  buildingId: number,
  range: Range = {},
) =>
  apiSend<Recommendation>(
    "POST",
    `${BASE}/buildings/${buildingId}`,
    toRange(range),
  );

/** DELETE /api/recommendations/{id} */
export const deleteRecommendation = (id: number) =>
  apiSend<void>("DELETE", `${BASE}/${id}`);
