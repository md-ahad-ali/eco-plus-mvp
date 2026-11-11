import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import AsyncState from "../components/AsyncState";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import ManagerPicker from "../components/ManagerPicker";
import type { SelectedManager } from "../components/ManagerPicker";
import { useApi } from "../hooks/useApi";
import {
  listBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from "../api/buildings";
import type { Building, BuildingInput } from "../api/buildings";
import { ApiError } from "../lib/api";
import { getCurrentUser, isAdmin } from "../lib/auth";

interface BuildingFormProps {
  initial?: Building;
  onSubmit: (input: BuildingInput) => Promise<void>;
  onCancel: () => void;
}

const BuildingForm = ({ initial, onSubmit, onCancel }: BuildingFormProps) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [area, setArea] = useState(initial ? String(initial.area_sqm) : "");
  const [manager, setManager] = useState<SelectedManager | null>(
    initial ? { id: initial.user_id, username: initial.manager_username } : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!manager) {
      setError("Please select a building manager.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name, area_sqm: Number(area), user_id: manager.id });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Building name" value={name} onChange={(e) => setName(e.target.value)} required />
      <FormField
        label="Area (m²)"
        type="number"
        min={0}
        step="any"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        required
      />
      <ManagerPicker label="Building manager" value={manager} onChange={setManager} />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

type ModalState = { mode: "create" } | { mode: "edit"; building: Building } | null;

const Buildings = () => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const user = getCurrentUser();
  const showActions = isAdmin(user);

  const { data, loading, error, refetch } = useApi(
    (signal) => listBuildings(search, signal),
    [search],
  );

  const handleCreate = async (input: BuildingInput) => {
    await createBuilding(input);
    setModal(null);
    refetch();
  };

  const handleUpdate = async (id: number, input: BuildingInput) => {
    await updateBuilding(id, input);
    setModal(null);
    refetch();
  };

  const handleDelete = async (building: Building) => {
    if (!window.confirm(`Delete "${building.name}"? Its rooms and energy logs will be deleted too.`)) {
      return;
    }
    await deleteBuilding(building.id);
    refetch();
  };

  const rows = (data ?? []).map((building) => [
    <Link to={`/buildings/${building.id}`} className="font-medium text-green-700 hover:underline">
      {building.name}
    </Link>,
    building.area_sqm,
    building.manager_username,
    showActions ? (
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Edit"
          onClick={() => setModal({ mode: "edit", building })}
          className="text-gray-500 hover:text-green-700"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          aria-label="Delete"
          onClick={() => handleDelete(building)}
          className="text-gray-500 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ) : null,
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Buildings & Rooms"
          description={showActions ? "Manage buildings and their rooms." : "Buildings you manage and their rooms."}
        />

        {showActions ? (
          <button
            onClick={() => setModal({ mode: "create" })}
            className="mb-7 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
          >
            <Plus size={18} />
            Add Building
          </button>
        ) : null}
      </div>

      <div className="mb-4 flex w-full max-w-sm items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <AsyncState loading={loading} error={error} onRetry={refetch}>
        <DataTable columns={["Building Name", "Area (m²)", "Manager", ""]} rows={rows} />
      </AsyncState>

      {modal?.mode === "create" ? (
        <Modal title="Add building" onClose={() => setModal(null)}>
          <BuildingForm onSubmit={handleCreate} onCancel={() => setModal(null)} />
        </Modal>
      ) : null}

      {modal?.mode === "edit" ? (
        <Modal title="Edit building" onClose={() => setModal(null)}>
          <BuildingForm
            initial={modal.building}
            onSubmit={(input) => handleUpdate(modal.building.id, input)}
            onCancel={() => setModal(null)}
          />
        </Modal>
      ) : null}
    </div>
  );
};

export default Buildings;
