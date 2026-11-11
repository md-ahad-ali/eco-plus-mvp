import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { searchOccupants } from "../api/rooms";
import type { OccupantOption } from "../api/rooms";

export interface SelectedOccupant {
  id: number;
  username: string;
}

interface OccupantPickerProps {
  label: string;
  value: SelectedOccupant | null;
  onChange: (value: SelectedOccupant | null) => void;
}

/** Search occupants by username/email and pick one; the parent receives the user id. */
const OccupantPicker = ({ label, value, onChange }: OccupantPickerProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<OccupantOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || value) return;
    const controller = new AbortController();
    // Debounce so we don't hit the API on every keystroke.
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      searchOccupants(query.trim(), controller.signal)
        .then((data) => {
          setOptions(data);
          setLoading(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setError("Could not load occupants");
          setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open, value]);

  const select = (option: OccupantOption) => {
    onChange({ id: option.id, username: option.username });
    setQuery("");
    setOpen(false);
  };

  const inputId = "occupant-picker";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm">
          <span className="font-medium text-gray-900">{value.username}</span>
          <button
            type="button"
            aria-label="Remove occupant"
            onClick={() => onChange(null)}
            className="text-gray-400 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3.5 py-2.5 focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600">
            <Search size={16} className="text-gray-400" />
            <input
              id={inputId}
              type="text"
              autoComplete="off"
              value={query}
              placeholder="Search by username or email..."
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                if (e.key === "Enter") {
                  // Don't submit the form; pick the first match instead.
                  e.preventDefault();
                  if (options[0]) select(options[0]);
                }
              }}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {open ? (
            <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {loading ? (
                <li className="px-3.5 py-2 text-sm text-gray-500">Searching...</li>
              ) : error ? (
                <li className="px-3.5 py-2 text-sm text-red-600">{error}</li>
              ) : options.length === 0 ? (
                <li className="px-3.5 py-2 text-sm text-gray-500">No occupants found</li>
              ) : (
                options.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      // mousedown fires before the input's blur, so the click isn't lost.
                      onMouseDown={(e) => {
                        e.preventDefault();
                        select(option);
                      }}
                      className="flex w-full flex-col items-start px-3.5 py-2 text-left hover:bg-green-50"
                    >
                      <span className="text-sm font-medium text-gray-900">{option.username}</span>
                      <span className="text-xs text-gray-500">{option.email}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>
      )}
      <p className="text-xs text-gray-500">Leave empty for no occupant</p>
    </div>
  );
};

export default OccupantPicker;
