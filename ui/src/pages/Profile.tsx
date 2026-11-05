import { User } from "lucide-react";
import PageHeader from "../components/PageHeader";

const Profile = () => {
  return (
    <div>
      <PageHeader
        title="My Profile"
        description="View and manage your personal information."
      />

      <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
            <User size={30} />
          </div>

          <div>
            <h2 className="font-semibold">Ahad Ali</h2>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Full Name</label>
            <input
              type="text"
              defaultValue="Ahad Ali"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email Address</label>
            <input
              type="email"
              defaultValue="ahad@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            />
          </div>

          <button className="rounded-lg bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;