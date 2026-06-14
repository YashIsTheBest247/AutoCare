import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getOverview, listVehicles, createSensorData } from "../api/client.js";
import KpiCard from "../components/KpiCard.jsx";
import HealthGauge from "../components/HealthGauge.jsx";
import RiskLevelBar from "../components/RiskLevelBar.jsx";
import Recommendations from "../components/Recommendations.jsx";
import FleetMap from "../components/FleetMap.jsx";
import { Spinner, SectionTitle, formatDate } from "../components/common.jsx";

const RISK_COLORS = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };
const TOOLTIP = { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12, boxShadow: "0 8px 24px rgba(15,23,42,0.08)" };

function buildRecommendations(alerts) {
  if (!alerts || !alerts.length) return [];
  return alerts.slice(0, 6).map((a) => ({
    level: a.risk_level,
    title:
      a.risk_level === "High"
        ? `${a.vehicle_name}: Critical — schedule maintenance now`
        : `${a.vehicle_name}: Inspection recommended`,
    detail: a.anomalies && a.anomalies.length ? a.anomalies[0] : "Elevated failure risk detected",
  }));
}

function randomReading() {
  const degraded = Math.random() > 0.6;
  const r = (min, max) => Math.round((min + Math.random() * (max - min)) * 100) / 100;
  return degraded
    ? { temperature: r(106, 132), battery_voltage: r(11, 12.5), rpm: r(3300, 5200), fuel_efficiency: r(6, 11), vibration: r(1.9, 4.2) }
    : { temperature: r(82, 100), battery_voltage: r(13.2, 14.3), rpm: r(1600, 2900), fuel_efficiency: r(14, 20), vibration: r(0.5, 1.4) };
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [live, setLive] = useState(false);

  const refresh = () => {
    getOverview().then(setData).catch(() => setError("Unable to load dashboard data."));
    listVehicles().then(setVehicles).catch(() => setVehicles([]));
  };

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (!live || vehicles.length === 0) return;
    const id = setInterval(async () => {
      const v = vehicles[Math.floor(Math.random() * vehicles.length)];
      try {
        await createSensorData({ vehicle_id: v.id, ...randomReading() });
        refresh();
      } catch (e) {}
    }, 4000);
    return () => clearInterval(id);
  }, [live, vehicles]);

  if (error) return <div className="card p-6 text-risk-high">{error}</div>;
  if (!data) return <Spinner label="Loading dashboard..." />;

  const pieData = Object.entries(data.risk_distribution).map(([name, value]) => ({ name, value }));
  const trend = data.risk_trend.map((p) => ({ time: formatDate(p.created_at), risk: p.risk_score }));
  const aggregateRisk = Math.round(100 - data.average_health_score);
  const recommendations = buildRecommendations(data.active_alerts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted">Fleet overview · {vehicles.length} vehicles</p>
        <button
          onClick={() => setLive((l) => !l)}
          className={live ? "btn-primary" : "btn-pill"}
        >
          {live ? (
            <>
              <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              Live Feed On — Stop
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
              </svg>
              Start Live Feed
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Vehicles" value={data.total_vehicles} sub="Monitored fleet" accent="blue" delay={0}
          icon="M5 11l1.5-4.5h11L19 11m-14 0h14m-14 0v6m14-6v6M7 17h2m6 0h2" />
        <KpiCard label="Avg Health" value={`${data.average_health_score}%`} sub="Fleet health score" accent="green" delay={80}
          icon="M3.5 12h4l2 6 4-12 2 6h4.5" />
        <KpiCard label="Active Alerts" value={data.active_alerts_count} sub="Need attention" accent="red" delay={160}
          icon="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.7A1 1 0 002.67 20h18.66a1 1 0 00.86-1.44l-8.48-14.7a1 1 0 00-1.72 0z" />
        <KpiCard label="Predictions" value={data.total_predictions} sub="Total generated" accent="amber" delay={240}
          icon="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col items-center justify-center">
          <SectionTitle>Vehicle Health Score</SectionTitle>
          <HealthGauge score={data.average_health_score} />
          <p className="text-xs text-muted mt-3 text-center">Fleet-wide average across all monitored vehicles</p>
        </div>

        <div className="card p-6 flex flex-col">
          <SectionTitle>Risk Level</SectionTitle>
          <div className="my-auto">
            <RiskLevelBar score={aggregateRisk} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5">
            {["Low", "Medium", "High"].map((lvl) => (
              <div key={lvl} className="panel py-2.5 text-center">
                <p className="text-lg font-bold text-ink">{data.risk_distribution[lvl] || 0}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted">{lvl}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <SectionTitle>Risk Distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3}>
                {pieData.map((e) => <Cell key={e.name} fill={RISK_COLORS[e.name]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <SectionTitle
            action={<span className="text-xs text-muted">{vehicles.length} vehicles tracked</span>}
          >
            Live Fleet Map
          </SectionTitle>
          <FleetMap vehicles={vehicles} />
        </div>

        <div className="card p-6">
          <SectionTitle>AI Recommendations</SectionTitle>
          <Recommendations items={recommendations} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-3">
          <SectionTitle>Risk Score Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="riskArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickMargin={8} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={TOOLTIP} />
              <Area type="monotone" dataKey="risk" stroke="#2563eb" strokeWidth={2.5} fill="url(#riskArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
