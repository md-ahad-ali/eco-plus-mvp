import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Plus, Pencil, Trash2, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import AsyncState from "../components/AsyncState";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { useApi } from "../hooks/useApi";
import { getBuilding } from "../api/buildings";
import { listRooms, createRoom, updateRoom, deleteRoom } from "../api/rooms";
import type { Room, RoomInput } from "../api/rooms";
import { ApiError } from "../lib/api";
import { canManage, getCurrentUser } from "../lib/auth";

interface RoomFormProps {
  buildingId: number;
  initial?: Room;
  onSubmit: (input: RoomInput) => Promise<void>;
  onCancel: () => void;
}

const RoomForm = ({ buildingId, initial, onSubmit, onCancel }: RoomFormProps) => {
  const [roomName, setRoomName] = useState(initial?.room_name ?? "");
  const [occupantId, setOccupantId] = useState(
    initial?.occupant_id != null ? String(initial.occupant_id) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        building_id: buildingId,
        room_name: roomName,
        occupant_id: occupantId.trim() === "" ? null : Number(occupantId),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        required
      />
      <FormField
        label="Occupant ID (optional)"
        type="number"
        min={1}
        step={1}
        value={occupantId}
        onChange={(e) => setOccupantId(e.target.value)}
        placeholder="Leave empty for no occupant"
      />

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

type ModalState = { mode: "create" } | { mode: "edit"; room: Room } | null;

const BuildingDetails = () => {
  const { id } = useParams();
  const buildingId = Number(id);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const user = getCurrentUser();
  const showActions = canManage(user);

  const building = useApi((signal) => getBuilding(buildingId, signal), [buildingId]);
  const rooms = useApi(
    (signal) => listRooms(buildingId, search, signal),
    [buildingId, search],
  );

  const handleCreate = async (input: RoomInput) => {
    await createRoom(input);
    setModal(null);
    rooms.refetch();
  };

  const handleUpdate = async (roomId: number, input: RoomInput) => {
    await updateRoom(roomId, input);
    setModal(null);
    rooms.refetch();
  };

  const handleDelete = async (room: Room) => {
    if (!window.confirm(`Delete room "${room.room_name}"?`)) return;
    await deleteRoom(room.id);
    rooms.refetch();
  };

  const rows = (rooms.data ?? []).map((room) => [
    room.id,
    room.room_name,
    room.occupant_id ?? "—",
    showActions ? (
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Edit"
          onClick={() => setModal({ mode: "edit", room })}
          className="text-gray-500 hover:text-green-700"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          aria-label="Delete"
          onClick={() => handleDelete(room)}
          className="text-gray-500 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ) : null,
  ]);

  return (
    <div>
      <Link
        to="/buildings"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
      >
        <ArrowLeft size={16} />
        Back to buildings
      </Link>

      <PageHeader
        title="Building Details"
        description="Manage rooms and information for this building."
      />

      <AsyncState loading={building.loading} error={building.error} onRetry={building.refetch}>
        {building.data ? (
          <div className="mb-7 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{building.data.name}</h2>
            <p className="mt-3 text-sm text-gray-500">Area: {building.data.area_sqm} m²</p>
          </div>
        ) : null}
      </AsyncState>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Rooms</h3>

        {showActions ? (
          <button
            onClick={() => setModal({ mode: "create" })}
            className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
          >
            <Plus size={18} />
            Add Room
          </button>
        ) : null}
      </div>

      <div className="my-4 flex w-full max-w-sm items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by room name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <AsyncState loading={rooms.loading} error={rooms.error} onRetry={rooms.refetch}>
        <DataTable columns={["ID", "Room Name", "Occupant ID", ""]} rows={rows} />
      </AsyncState>

      {modal?.mode === "create" ? (
        <Modal title="Add room" onClose={() => setModal(null)}>
          <RoomForm buildingId={buildingId} onSubmit={handleCreate} onCancel={() => setModal(null)} />
        </Modal>
      ) : null}

      {modal?.mode === "edit" ? (
        <Modal title="Edit room" onClose={() => setModal(null)}>
          <RoomForm
            buildingId={buildingId}
            initial={modal.room}
            onSubmit={(input) => handleUpdate(modal.room.id, input)}
            onCancel={() => setModal(null)}
          />
        </Modal>
      ) : null}
    </div>
  );
};

export default BuildingDetails;
