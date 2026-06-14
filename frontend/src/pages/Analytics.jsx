import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { getOverview, listSensorData, getModelInfo } from "../api/client.js";
import { Spinner, SectionTitle, formatDate } from "../components/common.jsx";

const TOOLTIP = { background: "#ffffff", color: "#111111", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 12 };

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [readings, setReadings] = useState(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    getOverview().then(setOverview);
    listSensorData().then(setReadings);
    getModelInfo().then(setModel).catch(() => setModel(null));
  }, []);

  if (!overview || !readings) return <Spinner label="Loading analytics..." />;

  const riskBars = Object.entries(overview.risk_distribution).map(([name, value]) => ({ name, value }));

  const sensorTrend = [...readings]
    .reverse()
    .slice(-25)
    .map((r) => ({
      time: formatDate(r.timestamp),
      temperature: r.temperature,
      vibration: r.vibration * 20,
      battery: r.battery_voltage,
    }));

  const importances = model && model.meta && model.meta.feature_importances
    ? Object.entries(model.meta.feature_importances).map(([name, value]) => ({
        name: name.replace("_", " "),
        value: Math.round(value * 100),
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <SectionTitle>Risk Level Distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={riskBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} />
              <YAxis stroke="#a3a3a3" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "#e5e7eb" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#111111" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <SectionTitle>Model Feature Importance</SectionTitle>
          {importances.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={importances} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#a3a3a3" fontSize={12} unit="%" />
                <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={11} width={110} />
                <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "#e5e7eb" }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#111111" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted py-10 text-center uppercase tracking-wider">Train the model to view feature importance.</p>
          )}
        </div>
      </div>

      <div className="card p-5">
        <SectionTitle>Sensor Telemetry (normalized vibration ×20)</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={sensorTrend}>
            <defs>
              <linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#a3a3a3" fontSize={10} />
            <YAxis stroke="#a3a3a3" fontSize={11} />
            <Tooltip contentStyle={TOOLTIP} />
            <Legend wrapperStyle={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }} />
            <Area type="monotone" dataKey="temperature" stroke="#dc2626" fill="url(#t)" strokeWidth={2} />
            <Area type="monotone" dataKey="vibration" stroke="#d97706" fill="url(#v)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {model && (
        <div className="card p-5">
          <SectionTitle>Model Information</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="panel p-4">
              <p className="text-[10px] uppercase tracking-widest text-subtle">Source</p>
              <p className="font-bold text-ink capitalize mt-1">{model.meta.source || "heuristic"}</p>
            </div>
            <div className="panel p-4">
              <p className="text-[10px] uppercase tracking-widest text-subtle">Accuracy</p>
              <p className="font-bold text-ink mt-1">{model.meta.accuracy ? `${(model.meta.accuracy * 100).toFixed(1)}%` : "—"}</p>
            </div>
            <div className="panel p-4">
              <p className="text-[10px] uppercase tracking-widest text-subtle">ROC-AUC</p>
              <p className="font-bold text-ink mt-1">{model.meta.roc_auc || "—"}</p>
            </div>
            <div className="panel p-4">
              <p className="text-[10px] uppercase tracking-widest text-subtle">Training Samples</p>
              <p className="font-bold text-ink mt-1">{model.meta.n_samples || "—"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
