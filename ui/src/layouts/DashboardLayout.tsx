import { Outlet } from "react-router";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <Navbar />

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;