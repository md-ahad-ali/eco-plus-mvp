import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Buildings from "./pages/Buildings";
import BuildingDetails from "./pages/BuildingDetails";
import EnergyData from "./pages/EnergyData";
import Analytics from "./pages/Analytics";
import Recommendations from "./pages/Recommendations";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/buildings" element={<Buildings />} />
          <Route path="/buildings/:id" element={<BuildingDetails />} />
          <Route path="/energy-data" element={<EnergyData />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;