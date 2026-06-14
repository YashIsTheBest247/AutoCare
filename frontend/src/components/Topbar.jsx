import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getOverview, listVehicles } from "../api/client.js";
import RiskBadge from "./RiskBadge.jsx";
import { formatDate } from "./common.jsx";

const titles = {
  "/": "Fleet Overview",
  "/vehicles": "Fleet",
  "/sensor-data": "Vehicle Diagnostics",
  "/predictions": "Predictive Intelligence",
  "/analytics": "Analytics",
  "/maintenance": "Maintenance",
  "/compare": "Fleet Comparison",
  "/reports": "Reports",
  "/settings": "Settings",
};

const PAGES = [
  { label: "Overview", path: "/" },
  { label: "Fleet", path: "/vehicles" },
  { label: "Diagnostics", path: "/sensor-data" },
  { label: "Predictions", path: "/predictions" },
  { label: "Analytics", path: "/analytics" },
  { label: "Maintenance", path: "/maintenance" },
  { label: "Compare", path: "/compare" },
  { label: "Reports", path: "/reports" },
  { label: "Settings", path: "/settings" },
];

export default function Topbar({ onMenu = () => {} }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = titles[pathname] || "AutoCare AI";

  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const bellRef = useRef(null);
  const searchRef = useRef(null);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    getOverview().then((d) => setAlerts(d.active_alerts || [])).catch(() => setAlerts([]));
    listVehicles().then(setVehicles).catch(() => setVehicles([]));
  }, [pathname]);

  useEffect(() => {
    const onDoc = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const ql = query.trim().toLowerCase();
  const vMatches = ql
    ? vehicles
        .filter((v) => [v.name, v.model, v.type].some((s) => (s || "").toLowerCase().includes(ql)))
        .slice(0, 6)
    : [];
  const pMatches = ql ? PAGES.filter((p) => p.label.toLowerCase().includes(ql)) : [];
  const hasResults = vMatches.length > 0 || pMatches.length > 0;

  const go = (path) => {
    navigate(path);
    setQuery("");
    setSearchOpen(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (vMatches.length) go(`/vehicles/${vMatches[0].id}`);
    else if (pMatches.length) go(pMatches[0].path);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-card/85 backdrop-blur border-b border-line px-6 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenu} className="md:hidden h-10 w-10 rounded-xl border border-line bg-card flex items-center justify-center text-muted shrink-0">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-ink truncate">{title}</h1>
          <p className="text-xs text-muted hidden sm:block">AI-Powered Vehicle Health Monitoring</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block" ref={searchRef}>
          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 panel px-3 py-2 w-64 max-w-[40vw] transition-colors focus-within:border-brand"
          >
            <svg className="h-4 w-4 text-subtle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search vehicles, pages..."
              className="bg-transparent text-sm text-ink placeholder:text-subtle focus:outline-none w-full"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-subtle hover:text-ink">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>

          {searchOpen && ql && (
            <div className="absolute right-0 mt-2 w-80 max-w-[88vw] bg-card border border-line rounded-2xl shadow-lift overflow-hidden animate-fade-in">
              {!hasResults ? (
                <p className="px-4 py-6 text-center text-sm text-muted">No matches for “{query}”.</p>
              ) : (
                <div className="max-h-96 overflow-auto py-1.5">
                  {pMatches.length > 0 && (
                    <div className="px-3 pt-1 pb-1 text-[10px] uppercase tracking-wide text-subtle">Pages</div>
                  )}
                  {pMatches.map((p) => (
                    <button
                      key={p.path}
                      onClick={() => go(p.path)}
                      className="w-full flex items-center gap-2.5 text-left px-3.5 py-2 text-sm text-ink hover:bg-brand/10 transition-colors"
                    >
                      <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      {p.label}
                    </button>
                  ))}
                  {vMatches.length > 0 && (
                    <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-subtle">Vehicles</div>
                  )}
                  {vMatches.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => go(`/vehicles/${v.id}`)}
                      className="w-full flex items-center justify-between gap-2 text-left px-3.5 py-2 hover:bg-brand/10 transition-colors"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink truncate">{v.name}</span>
                        <span className="block text-xs text-muted truncate">{v.model} · {v.type}</span>
                      </span>
                      <RiskBadge level={v.latest_risk_level} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          title="Toggle theme"
          className="h-10 w-10 rounded-xl border border-line bg-card flex items-center justify-center text-muted hover:text-brand hover:border-brand/60 transition-colors"
        >
          {dark ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path strokeLinecap="round" d="M12 2v2m0 16v2M4 12H2m20 0h-2m-2.5-5.5l1.5-1.5M6 18l-1.5 1.5M6 6L4.5 4.5M18 18l1.5 1.5" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
            </svg>
          )}
        </button>

        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={() => setBellOpen((o) => !o)}
            className={`relative h-10 w-10 rounded-xl border flex items-center justify-center transition-colors ${
              bellOpen ? "bg-brand text-white border-brand" : "bg-card border-line text-muted hover:text-brand hover:border-brand/60"
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

          {bellOpen && (
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
                    <li
                      key={i}
                      onClick={() => { navigate("/"); setBellOpen(false); }}
                      className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
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
