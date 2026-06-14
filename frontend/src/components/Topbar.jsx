import { useLocation } from "react-router-dom";

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
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-card/85 backdrop-blur border-b border-line px-6 py-3.5">
      <div>
        <h1 className="text-lg font-bold text-ink">{title}</h1>
        <p className="text-xs text-muted">AI-Powered Vehicle Health Monitoring</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 panel px-3 py-2 w-64 max-w-[40vw]">
          <svg className="h-4 w-4 text-subtle" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            placeholder="Search vehicles, alerts..."
            className="bg-transparent text-sm text-ink placeholder:text-subtle focus:outline-none w-full"
          />
        </div>
        <button className="relative h-10 w-10 rounded-xl bg-card border border-line flex items-center justify-center text-muted hover:text-brand transition-colors">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1" />
          </svg>
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-risk-high"></span>
        </button>
      </div>
    </header>
  );
}
