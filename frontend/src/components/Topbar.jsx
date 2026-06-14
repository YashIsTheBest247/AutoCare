import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getOverview } from "../api/client.js";
import RiskBadge from "./RiskBadge.jsx";
import { formatDate } from "./common.jsx";

const titles = {
  "/": "Dashboard",
  "/vehicles": "Vehicle Management",
  "/sensor-data": "Sensor Data Monitoring",
  "/predictions": "Predictive Maintenance",
  "/analytics": "Analytics",
};

export default function Topbar() {
  const { pathname } = useLocation();
  const title = titles[pathname] || "AutoCare AI";
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    getOverview().then((d) => setAlerts(d.active_alerts || [])).catch(() => setAlerts([]));
  }, [pathname]);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-card/85 backdrop-blur border-b border-line px-6 py-3.5">
      <div>
        <h1 className="text-lg font-bold text-ink">{title}</h1>
        <p className="text-xs text-muted">AI-Powered Vehicle Health Monitoring</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 panel px-3 py-2 w-64 max-w-[40vw] transition-colors focus-within:border-brand">
          <svg className="h-4 w-4 text-subtle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            placeholder="Search vehicles, alerts..."
            className="bg-transparent text-sm text-ink placeholder:text-subtle focus:outline-none w-full"
          />
        </div>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`relative h-10 w-10 rounded-xl border flex items-center justify-center transition-colors ${
              open ? "bg-brand text-white border-brand" : "bg-card border-line text-muted hover:text-brand hover:border-brand/60"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1" />
            </svg>
            {alerts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-risk-high text-white text-[10px] font-bold flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 max-w-[88vw] bg-card border border-line rounded-2xl shadow-lift overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                <p className="text-sm font-bold text-ink">Notifications</p>
                <span className="text-xs text-muted">{alerts.length} active</span>
              </div>
              <ul className="max-h-80 overflow-auto divide-y divide-line">
                {alerts.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-muted">No notifications — all vehicles healthy.</li>
                ) : (
                  alerts.map((a, i) => (
                    <li key={i} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink truncate">{a.vehicle_name}</p>
                        <RiskBadge level={a.risk_level} />
                      </div>
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {a.anomalies && a.anomalies.length ? a.anomalies[0] : "Elevated failure risk detected"}
                      </p>
                      <p className="text-[10px] text-subtle mt-1">{formatDate(a.timestamp)}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
