import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Building2,
  Zap,
  ChartNoAxesCombined,
  Lightbulb,
  FileText,
  User,
  Leaf,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Buildings & Rooms", path: "/buildings", icon: Building2 },
  { name: "Energy Data", path: "/energy-data", icon: Zap },
  { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
  { name: "AI Recommendations", path: "/recommendations", icon: Lightbulb },
  { name: "Reports", path: "/reports", icon: FileText },
  { name: "My Profile", path: "/profile", icon: User },
];

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-green-950 px-4 py-6 text-white">
      <div className="mb-10 flex items-center gap-3 px-3">
        <div className="rounded-xl bg-green-600 p-2">
          <Leaf size={25} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">EcoPulse</h1>
          <p className="text-xs text-green-300">Smart Energy Management</p>
        </div>
      </div>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-green-400">
        Main Menu
      </p>

      <nav className="flex flex-col gap-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-green-700 text-white shadow-lg"
                    : "text-green-100 hover:bg-green-900"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-green-800 bg-green-900/60 p-4">
        <p className="text-sm font-semibold">EcoPulse MVP</p>
        <p className="mt-1 text-xs text-green-300">
          AI-Powered Smart Energy Management
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;