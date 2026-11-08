import { User as UserIcon } from "lucide-react";

import { getMe } from "../api/auth";
import type { Role } from "../api/auth";
import AsyncState from "../components/AsyncState";
import PageHeader from "../components/PageHeader";
import { useApi } from "../hooks/useApi";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  building_manager: "Building manager",
  occupant: "Occupant",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none";

const Profile = () => {
  const { data: user, loading, error, refetch } = useApi(getMe, []);

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="View your personal information."
      />

      <AsyncState loading={loading} error={error} onRetry={refetch}>
        {user && (
          <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
                <UserIcon size={30} />
              </div>

              <div>
                <h2 className="font-semibold">{user.username}</h2>
                <p className="text-sm text-gray-500">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Username</label>
                <input type="text" value={user.username} readOnly className={inputClass} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email Address</label>
                <input type="email" value={user.email} readOnly className={inputClass} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Role</label>
                <input type="text" value={ROLE_LABELS[user.role]} readOnly className={inputClass} />
              </div>
            </div>
          </div>
        )}
      </AsyncState>
    </div>
  );
};

export default Profile;
