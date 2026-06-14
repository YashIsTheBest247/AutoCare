import { useEffect, useState } from "react";
import { getOverview, exportSensorCsv, exportPredictionCsv } from "../api/client.js";
import { Spinner, SectionTitle } from "../components/common.jsx";

const REPORTS = [
  {
    key: "sensor",
    title: "Sensor Telemetry Export",
    desc: "All recorded sensor readings across the fleet, including anomaly flags.",
    action: () => exportSensorCsv(),
    icon: "M3 12h4l3 8 4-16 3 8h4",
  },
  {
    key: "predictions",
    title: "Prediction History Export",
    desc: "Every generated risk prediction with score, level, and recommendation.",
    action: () => exportPredictionCsv(),
    icon: "M13 2L3 14h7l-1 8 10-12h-7l1-8z",
  },
];

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getOverview().then(setData).catch(() => setData(null));
  }, []);

  const stats = data
    ? [
        { label: "Vehicles", value: data.total_vehicles },
        { label: "Predictions", value: data.total_predictions },
        { label: "Active Alerts", value: data.active_alerts_count },
        { label: "Avg Health", value: `${data.average_health_score}%` },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-ink">Reports</h2>
        <p className="text-sm text-muted mt-0.5">Export operational data and review fleet summary metrics.</p>
      </div>

      <div className="card p-6">
        <SectionTitle>Fleet Summary</SectionTitle>
        {!data ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="panel p-4">
                <p className="text-[11px] uppercase tracking-wide text-subtle">{s.label}</p>
                <p className="text-2xl font-bold text-ink mt-1 tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REPORTS.map((r) => (
          <div key={r.key} className="card p-6 flex flex-col">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-brand/15 text-brand-light flex items-center justify-center">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
                </svg>
              </div>
              <p className="font-semibold text-ink">{r.title}</p>
            </div>
            <p className="text-sm text-muted mt-3 flex-1">{r.desc}</p>
            <button onClick={r.action} className="btn-primary mt-4 w-fit">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
