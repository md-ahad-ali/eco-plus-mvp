import { Bell, Search } from "lucide-react";

const Navbar = () => {
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

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
            AA
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">Ahad Ali</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;