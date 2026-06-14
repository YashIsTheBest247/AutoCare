import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { to: "/vehicles", label: "Vehicles", icon: "M5 11l1.5-4.5h11L19 11m-14 0h14m-14 0v6m14-6v6M7 17h2m6 0h2" },
  { to: "/sensor-data", label: "Sensor Data", icon: "M3 12h4l3 8 4-16 3 8h4" },
  { to: "/predictions", label: "Predictions", icon: "M13 2L3 14h7l-1 8 10-12h-7l1-8z" },
  { to: "/analytics", label: "Analytics", icon: "M4 19V5m0 14h16M8 17V9m4 8V6m4 11v-5" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-gradient-to-b from-brand-deep via-brand-dark to-brand text-white min-h-screen p-5">
      <div className="mb-9 rounded-xl bg-white/10 px-3 py-2.5">
        <Logo onDark markClassName="h-8 w-8" />
      </div>
      <nav className="flex flex-col gap-1.5">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? "bg-white text-brand-dark shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={l.icon} />
            </svg>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-6">
        <div className="rounded-xl bg-white/10 p-3.5 text-xs text-white/80">
          <p className="font-semibold text-white">Edge AI Engine</p>
          <p className="mt-1 leading-relaxed">Predictive maintenance running locally on-device.</p>
        </div>
        <p className="text-[10px] text-white/50 mt-3 px-1">v1.0.0 · Automotive</p>
      </div>
    </aside>
  );
}
