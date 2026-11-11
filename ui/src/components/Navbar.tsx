import { Bell, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router";

import { getCurrentUser, logout } from "../lib/auth";
import type { Role } from "../api/auth";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  building_manager: "Building manager",
};

function initialsOf(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

const Navbar = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
      <div className="flex w-80 items-center gap-3 rounded-lg bg-gray-100 px-4 py-2.5">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="flex items-center gap-6">
        <button
          aria-label="Notifications"
          className="relative text-gray-500 hover:text-green-700"
        >
          <Bell size={21} />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
              {initialsOf(user.username)}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">{user.username}</p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          aria-label="Log out"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
