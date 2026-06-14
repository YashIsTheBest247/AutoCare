import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import VehicleDetail from "./pages/VehicleDetail.jsx";
import SensorData from "./pages/SensorData.jsx";
import Predictions from "./pages/Predictions.jsx";
import Analytics from "./pages/Analytics.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import Compare from "./pages/Compare.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";
import { useAuth } from "./context/auth.jsx";

export default function App() {
  const { token } = useAuth();

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route path="/sensor-data" element={<SensorData />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
