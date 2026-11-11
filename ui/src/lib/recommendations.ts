
import { ApiError } from "./api";

export const PAGE_SIZE = 20;

/** Optional analysis period. Dates are YYYY-MM-DD, same as the analytics API. */
export interface Range {
  start?: string;
  end?: string;
}

/** Backend end is exclusive, so use the last second of the selected day. */
export const toRange = ({ start, end }: Range) => ({
  start: start ? `${start}T00:00:00` : undefined,
  end: end ? `${end}T23:59:59` : undefined,
});

/** User-facing message for a failed recommendation request. */
export function recommendationErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) {
      return "The daily limit for recommendations has been reached. Try again tomorrow.";
    }

    if (err.status === 503) {
      return "Recommendations are temporarily unavailable. Try again in a moment.";
    }

    return err.message;
  }

  return err instanceof Error
    ? err.message
    : "Something went wrong.";
}
