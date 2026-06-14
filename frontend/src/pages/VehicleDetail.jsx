import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { getVehicle, listSensorData, listPredictions, getVehicleAnalytics } from "../api/client.js";
import HealthGauge from "../components/HealthGauge.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import FleetMap from "../components/FleetMap.jsx";
import { ComponentHealthBars, ContributionBars } from "../components/Meters.jsx";
import { Spinner, EmptyState, SectionTitle, formatDate } from "../components/common.jsx";

const TOOLTIP = { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12, boxShadow: "0 8px 24px rgba(15,23,42,0.08)" };

const METRICS = [
  { key: "temperature", label: "Engine Temp", unit: "°C" },
  { key: "battery_voltage", label: "Battery", unit: "V" },
  { key: "rpm", label: "RPM", unit: "" },
  { key: "fuel_efficiency", label: "Fuel Eff.", unit: "km/L" },
  { key: "vibration", label: "Vibration", unit: "" },
];

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [readings, setReadings] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setVehicle(null);
    setError(null);
    getVehicle(id).then(setVehicle).catch(() => setError("Vehicle not found."));
    listSensorData(id).then(setReadings).catch(() => setReadings([]));
    listPredictions(id).then(setPredictions).catch(() => setPredictions([]));
    getVehicleAnalytics(id).then(setAnalytics).catch(() => setAnalytics(null));
  }, [id]);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-risk-high font-semibold">{error}</p>
        <Link to="/vehicles" className="btn-primary mt-4">Back to Vehicles</Link>
      </div>
    );
  }
  if (!vehicle) return <Spinner label="Loading vehicle..." />;

  const latest = readings[0];
  const telemetry = [...readings].reverse().slice(-25).map((r) => ({
    time: formatDate(r.timestamp),
    temperature: r.temperature,
    vibration: r.vibration * 20,
  }));

  const fc = analytics && analytics.forecast ? analytics.forecast : null;
  const forecastData = fc && fc.series && fc.series.temperature
    ? fc.series.temperature.map((t, i) => ({
        step: `+${i + 1}`,
        temperature: t,
        vibration: fc.series.vibration ? fc.series.vibration[i] : null,
      }))
    : [];

  return (
    <div className="space-y-6">
      <Link to="/vehicles" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Vehicles
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <HealthGauge score={vehicle.health_score} size={170} />
          <p className="text-lg font-bold text-ink mt-4">{vehicle.name}</p>
          <p className="text-sm text-muted">{vehicle.model} · <span className="capitalize">{vehicle.type}</span></p>
          <div className="mt-3"><RiskBadge level={vehicle.latest_risk_level} /></div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <SectionTitle>Latest Reading</SectionTitle>
          {!latest ? (
            <EmptyState title="No sensor data" hint="Record a reading on the Sensor Data page." />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {METRICS.map((m) => (
                  <div key={m.key} className="panel p-3.5 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted">{m.label}</p>
                    <p className="text-xl font-bold text-ink mt-1">{latest[m.key]}<span className="text-xs text-muted ml-0.5">{m.unit}</span></p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-subtle mt-3">Recorded {formatDate(latest.timestamp)}</p>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="panel p-3 text-center">
                  <p className="text-lg font-bold text-ink">{readings.length}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Readings</p>
                </div>
                <div className="panel p-3 text-center">
                  <p className="text-lg font-bold text-ink">{predictions.length}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Predictions</p>
                </div>
                <div className="panel p-3 text-center">
                  <p className="text-lg font-bold text-ink">{vehicle.health_score}%</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Health</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <SectionTitle>Sensor Telemetry (vibration ×20)</SectionTitle>
          {telemetry.length === 0 ? (
            <EmptyState title="No telemetry yet" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={telemetry}>
                <defs>
                  <linearGradient id="vd-t" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="vd-v" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="url(#vd-t)" strokeWidth={2} />
                <Area type="monotone" dataKey="vibration" stroke="#f59e0b" fill="url(#vd-v)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <SectionTitle>Location</SectionTitle>
          <FleetMap vehicles={[vehicle]} />
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <SectionTitle
              action={analytics.rul_days != null && (
                <span className="text-xs font-bold text-brand">{analytics.rul_days}d RUL</span>
              )}
            >
              Component Health
            </SectionTitle>
            <ComponentHealthBars data={analytics.component_health} />
          </div>

          <div className="card p-6">
            <SectionTitle>Risk Factors</SectionTitle>
            <ContributionBars items={analytics.contributions} />
          </div>

          <div className="card p-6">
            <SectionTitle>Forecast (next readings)</SectionTitle>
            {forecastData.length === 0 ? (
              <EmptyState title="Not enough data" hint="Record more readings to forecast." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="step" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={TOOLTIP} />
                    <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="vibration" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                {fc.warnings && fc.warnings.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {fc.warnings.map((w, i) => (
                      <li key={i} className="text-xs text-risk-high flex items-start gap-1.5">
                        <span>⚠</span><span>{w}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="card p-6">
        <SectionTitle>Prediction History</SectionTitle>
        {predictions.length === 0 ? (
          <EmptyState title="No predictions yet" hint="Predictions are generated when sensor data is recorded." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-subtle border-b border-line">
                  <th className="py-2 pr-4 font-semibold">Time</th>
                  <th className="py-2 pr-4 font-semibold">Score</th>
                  <th className="py-2 pr-4 font-semibold">Risk</th>
                  <th className="py-2 font-semibold">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr key={p.id} className="border-b border-line/70 hover:bg-slate-50">
                    <td className="py-2.5 pr-4 text-subtle text-[11px] whitespace-nowrap">{formatDate(p.created_at)}</td>
                    <td className="py-2.5 pr-4 font-bold text-ink">{p.risk_score}</td>
                    <td className="py-2.5 pr-4"><RiskBadge level={p.risk_level} /></td>
                    <td className="py-2.5 text-xs text-muted max-w-md truncate">{p.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
