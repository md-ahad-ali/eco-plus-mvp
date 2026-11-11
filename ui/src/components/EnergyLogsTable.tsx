import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AsyncState from "./AsyncState";
import { useApi } from "../hooks/useApi";
import { getBuildingTotals } from "../api/analytics";
import { getEnergyLogs } from "../api/energyLogs";

const PAGE_SIZE = 25;
const field =
  "rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-green-600";
const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-GB");

interface Props {
  /** Change this value to reload the table (e.g. after a CSV upload). */
  refreshKey?: number;
}

const EnergyLogsTable = ({ refreshKey = 0 }: Props) => {
  const [buildingId, setBuildingId] = useState<number | undefined>();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [page, setPage] = useState(0);

  const buildings = useApi((s) => getBuildingTotals({}, s), [refreshKey]);
  const logs = useApi(
    (s) =>
      getEnergyLogs(
        {
          building_id: buildingId,
          start: start || undefined,
          end: end || undefined,
          skip: page * PAGE_SIZE,
          limit: PAGE_SIZE,
        },
        s,
      ),
    [buildingId, start, end, page, refreshKey],
  );

  const total = logs.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

  // Any filter change goes back to the first page.
  const onFilter = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
  };

  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold text-gray-800">Energy Consumption Records</h3>

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <label className="text-sm font-medium">
          <span className="mb-1 block">Building</span>
          <select
            className={field}
            value={buildingId ?? ""}
            onChange={(e) =>
              onFilter(setBuildingId)(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">All buildings</option>
            {buildings.data?.map((b) => (
              <option key={b.building_id} value={b.building_id}>{b.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          <span className="mb-1 block">From</span>
          <input type="date" className={field} value={start}
            onChange={(e) => onFilter(setStart)(e.target.value)} />
        </label>
        <label className="text-sm font-medium">
          <span className="mb-1 block">To</span>
          <input type="date" className={field} value={end}
            onChange={(e) => onFilter(setEnd)(e.target.value)} />
        </label>
      </div>

      <AsyncState loading={logs.loading} error={logs.error} onRetry={logs.refetch}>
        {logs.data?.items.length ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">Building</th>
                    <th className="px-4 py-3 font-medium">Room</th>
                    <th className="px-4 py-3 text-right font-medium">Energy (kWh)</th>
                    <th className="px-4 py-3 text-right font-medium">Indoor Temp (°C)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.data.items.map((r) => (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">{fmtTime(r.timestamp)}</td>
                      <td className="px-4 py-3">{r.building_name}</td>
                      <td className="px-4 py-3">{r.room_name}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.energy_consumed_kwh.toFixed(3)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.indoor_temp.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
              <span>
                Showing {from.toLocaleString("en-GB")}–{to.toLocaleString("en-GB")} of{" "}
                {total.toLocaleString("en-GB")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>Page {page + 1} of {pageCount}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page + 1 >= pageCount}
                  className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No energy records found.</p>
        )}
      </AsyncState>
    </div>
  );
};

export default EnergyLogsTable;