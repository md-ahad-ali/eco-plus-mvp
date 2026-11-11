
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import AsyncState from "../components/AsyncState";
import { useApi } from "../hooks/useApi";
import { getBuildingTotals } from "../api/analytics";

import {
  createRecommendation,
  deleteRecommendation,
  listRecommendations,
  type Recommendation,
} from "../api/recommendations";

import {
  PAGE_SIZE,
  recommendationErrorMessage,
} from "../lib/recommendations";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const field =
  "rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-green-600";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2";

// The API returns naive UTC timestamps (without Z).
const parseUtc = (iso: string) =>
  new Date(
    /(Z|[+-]\d\d:?\d\d)$/.test(iso)
      ? iso
      : `${iso}Z`,
  );

const formatDate = (iso: string) =>
  parseUtc(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatPercent = (n: number) =>
  n.toLocaleString("en-GB", {
    maximumFractionDigits: 1,
  });

// Convert AI recommendation text into readable list items.
const toItems = (text: string) =>
  text
    .split(/\n+/)
    .map((line) =>
      line.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, "").trim(),
    )
    .filter(Boolean);

/* ------------------------------------------------------------------ */
/* Recommendation Body                                                 */
/* ------------------------------------------------------------------ */

const RecommendationBody = ({
  text,
}: {
  text: string;
}) => {
  const items = toItems(text);

  if (items.length <= 1) {
    return (
      <p className="max-w-prose text-sm leading-relaxed text-gray-700">
        {items[0] ?? text}
      </p>
    );
  }

  return (
    <ul className="max-w-prose space-y-3">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-3 text-sm leading-relaxed text-gray-700"
        >
          <span
            aria-hidden
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

/* ------------------------------------------------------------------ */
/* Delete Control                                                      */
/* ------------------------------------------------------------------ */

const DeleteControl = ({
  busy,
  onConfirm,
}: {
  busy: boolean;
  onConfirm: () => void;
}) => {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="flex items-center gap-3 text-sm">
        <span className="text-gray-600">
          Delete this recommendation?
        </span>

        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`rounded font-medium text-red-700 hover:underline disabled:opacity-60 ${focusRing}`}
        >
          {busy ? "Deleting…" : "Delete"}
        </button>

        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={busy}
          className={`rounded text-gray-600 hover:underline ${focusRing}`}
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={`flex items-center gap-1.5 rounded text-sm text-gray-500 hover:text-red-700 ${focusRing}`}
    >
      <Trash2 size={15} aria-hidden />
      Delete
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Recommendations Page                                                */
/* ------------------------------------------------------------------ */

const Recommendations = () => {
  const [buildingId, setBuildingId] = useState<number | undefined>();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [limit, setLimit] = useState(PAGE_SIZE);
  const [generating, setGenerating] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  // Load building data.
  const buildings = useApi(
    (s) => getBuildingTotals({}, s),
    [],
  );

  // Automatically select the first building.
  useEffect(() => {
    if (
      buildingId === undefined &&
      buildings.data?.length
    ) {
      setBuildingId(buildings.data[0].building_id);
    }
  }, [buildings.data, buildingId]);

  // Load recommendation history.
  const history = useApi<Recommendation[]>(
    (s) =>
      buildingId
        ? listRecommendations(buildingId, limit, 0, s)
        : Promise.resolve([]),
    [buildingId, limit],
  );

  const invalidRange = Boolean(
    start && end && end < start,
  );

  /* ---------------------------------------------------------------- */
  /* Generate Recommendation                                          */
  /* ---------------------------------------------------------------- */

  const generate = async () => {
    if (!buildingId || invalidRange || generating) return;

    setGenerating(true);
    setNotice(null);

    try {
      await createRecommendation(buildingId, {
        start: start || undefined,
        end: end || undefined,
      });

      setLimit(PAGE_SIZE);
      setOpenId(null);

      history.refetch();
    } catch (err) {
      setNotice(recommendationErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Delete Recommendation                                            */
  /* ---------------------------------------------------------------- */

  const remove = async (id: number) => {
    setDeletingId(id);
    setNotice(null);

    try {
      await deleteRecommendation(id);
      history.refetch();
    } catch (err) {
      setNotice(recommendationErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const items = history.data ?? [];
  const [latest, ...older] = items;

  const canLoadMore = items.length === limit;

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div>
      <PageHeader
        title="AI Recommendations"
        description="Get practical, data-based ways to reduce energy use in your buildings."
      />

      <AsyncState
        loading={buildings.loading}
        error={buildings.error}
        onRetry={buildings.refetch}
      >
        {!buildings.data?.length ? (
          <p className="text-sm text-gray-500">
            No energy data yet. Upload a CSV file on the
            Energy Data page to get recommendations.
          </p>
        ) : (
          <div className="space-y-6">

            {/* Controls */}

            <div>
              <div className="flex flex-wrap items-end gap-4">

                {/* Building selection */}

                <label className="text-sm font-medium">
                  <span className="mb-1 block">
                    Building
                  </span>

                  <select
                    className={field}
                    value={buildingId ?? ""}
                    onChange={(e) => {
                      setBuildingId(Number(e.target.value));
                      setLimit(PAGE_SIZE);
                      setOpenId(null);
                      setNotice(null);
                    }}
                  >
                    {buildings.data.map((b) => (
                      <option
                        key={b.building_id}
                        value={b.building_id}
                      >
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Start date */}

                <label className="text-sm font-medium">
                  <span className="mb-1 block">
                    From
                  </span>

                  <input
                    type="date"
                    className={field}
                    value={start}
                    max={end || undefined}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </label>

                {/* End date */}

                <label className="text-sm font-medium">
                  <span className="mb-1 block">
                    To
                  </span>

                  <input
                    type="date"
                    className={field}
                    value={end}
                    min={start || undefined}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </label>

                {/* Generate button */}

                <button
                  type="button"
                  onClick={generate}
                  disabled={
                    generating ||
                    invalidRange ||
                    !buildingId
                  }
                  className={`flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                >
                  {generating ? (
                    <Loader2
                      size={16}
                      className="animate-spin motion-reduce:animate-none"
                      aria-hidden
                    />
                  ) : (
                    <Sparkles size={16} aria-hidden />
                  )}

                  {generating
                    ? "Generating…"
                    : "Generate recommendations"}
                </button>
              </div>

              <p
                className="mt-2 text-xs text-gray-500"
                aria-live="polite"
              >
                {invalidRange
                  ? "The end date must be after the start date."
                  : generating
                    ? "Analysing your energy data. This can take up to a minute."
                    : "Leave the dates empty to analyse all available data."}
              </p>
            </div>

            {/* Error notification */}

            {notice && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {notice}
              </div>
            )}

            {/* Recommendation history */}

            {history.error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p>
                  Could not load recommendations: {history.error}
                </p>

                <button
                  type="button"
                  onClick={history.refetch}
                  className={`mt-2 rounded font-medium underline ${focusRing}`}
                >
                  Try again
                </button>
              </div>
            ) : !history.data && history.loading ? (
              <p className="text-sm text-gray-500">
                Loading recommendations…
              </p>
            ) : !latest ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="font-medium text-gray-900">
                  No recommendations for this building yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Choose a period, then select Generate recommendations.
                </p>
              </div>
            ) : (
              <>
                {/* Latest recommendation */}

                <section
                  aria-labelledby="latest-heading"
                  className="grid overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:grid-cols-[15rem_1fr]"
                >
                  {/* Estimated savings */}

                  <div className="flex flex-col justify-center bg-green-700 p-6 text-white">
                    <p className="text-5xl font-bold tabular-nums">
                      {formatPercent(
                        latest.estimated_savings_percent,
                      )}
                      %
                    </p>

                    <p className="mt-2 text-sm text-green-50">
                      Estimated energy saving if you act on these steps
                    </p>
                  </div>

                  {/* Recommendation content */}

                  <div className="p-6">
                    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3
                        id="latest-heading"
                        className="text-lg font-semibold text-gray-900"
                      >
                        Latest recommendations
                      </h3>

                      <time
                        dateTime={latest.created_at}
                        className="text-xs text-gray-500"
                      >
                        {formatDate(latest.created_at)}
                      </time>
                    </div>

                    <RecommendationBody
                      text={latest.recommendation_text}
                    />

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-500">
                        The saving is an AI estimate, not a measured result.
                      </p>

                      <DeleteControl
                        busy={deletingId === latest.id}
                        onConfirm={() => remove(latest.id)}
                      />
                    </div>
                  </div>
                </section>

                {/* Earlier recommendations */}

                {older.length > 0 && (
                  <section aria-labelledby="history-heading">
                    <h3
                      id="history-heading"
                      className="mb-1 text-lg font-semibold text-gray-800"
                    >
                      Earlier recommendations
                    </h3>

                    <ul className="divide-y divide-gray-200 border-y border-gray-200">
                      {older.map((rec) => {
                        const open = openId === rec.id;

                        const first =
                          toItems(rec.recommendation_text)[0] ??
                          rec.recommendation_text;

                        return (
                          <li key={rec.id}>
                            <button
                              type="button"
                              aria-expanded={open}
                              aria-controls={`rec-${rec.id}`}
                              onClick={() =>
                                setOpenId(open ? null : rec.id)
                              }
                              className={`flex w-full items-center gap-4 py-3 text-left ${focusRing}`}
                            >
                              <span className="w-16 shrink-0 font-semibold tabular-nums text-green-700">
                                {formatPercent(
                                  rec.estimated_savings_percent,
                                )}
                                %
                              </span>

                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm text-gray-800">
                                  {first}
                                </span>

                                <span className="block text-xs text-gray-500">
                                  {formatDate(rec.created_at)}
                                </span>
                              </span>

                              <ChevronDown
                                size={18}
                                aria-hidden
                                className={`shrink-0 text-gray-400 transition-transform motion-reduce:transition-none ${
                                  open ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {open && (
                              <div
                                id={`rec-${rec.id}`}
                                className="pb-5 pl-20 pr-2"
                              >
                                <RecommendationBody
                                  text={rec.recommendation_text}
                                />

                                <div className="mt-4">
                                  <DeleteControl
                                    busy={deletingId === rec.id}
                                    onConfirm={() => remove(rec.id)}
                                  />
                                </div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                {/* Pagination */}

                {canLoadMore && (
                  <button
                    type="button"
                    onClick={() =>
                      setLimit((l) => l + PAGE_SIZE)
                    }
                    disabled={history.loading}
                    className={`rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 ${focusRing}`}
                  >
                    {history.loading
                      ? "Loading…"
                      : "Show older"}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </AsyncState>
    </div>
  );
};

export default Recommendations;
