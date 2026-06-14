import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/auth.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { to: "/vehicles", label: "Vehicles", icon: "M5 11l1.5-4.5h11L19 11m-14 0h14m-14 0v6m14-6v6M7 17h2m6 0h2" },
  { to: "/sensor-data", label: "Sensor Data", icon: "M3 12h4l3 8 4-16 3 8h4" },
  { to: "/predictions", label: "Predictions", icon: "M13 2L3 14h7l-1 8 10-12h-7l1-8z" },
  { to: "/analytics", label: "Analytics", icon: "M4 19V5m0 14h16M8 17V9m4 8V6m4 11v-5" },
  { to: "/maintenance", label: "Maintenance", icon: "M14.7 6.3a4 4 0 01-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 015.4-5.4l-2.5 2.5-2-2 2.5-2.5z" },
  { to: "/compare", label: "Compare", icon: "M9 3v18M15 3v18M4 7h5M4 12h5M4 17h5M15 9h5M15 14h5" },
  { to: "/settings", label: "Settings", icon: "M10.3 3.3a1 1 0 011.4 0l1 .9 1.3-.3a1 1 0 011.2.7l.4 1.3 1.2.6a1 1 0 01.5 1.3l-.5 1.2.5 1.2a1 1 0 01-.5 1.3l-1.2.6-.4 1.3a1 1 0 01-1.2.7l-1.3-.3-1 .9a1 1 0 01-1.4 0l-1-.9-1.3.3a1 1 0 01-1.2-.7l-.4-1.3-1.2-.6a1 1 0 01-.5-1.3l.5-1.2-.5-1.2a1 1 0 01.5-1.3l1.2-.6.4-1.3a1 1 0 011.2-.7l1.3.3 1-.9zM12 15a3 3 0 100-6 3 3 0 000 6z" },
];

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { user, signOut } = useAuth();
  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 shrink-0 flex flex-col min-h-screen p-5 text-white
        bg-gradient-to-b from-brand-light via-brand to-brand-dark border-r border-white/10
        transform transition-transform duration-300 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-start justify-between gap-2 mb-7">
        <div className="flex-1 rounded-xl bg-white/15 ring-1 ring-white/20 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold uppercase text-white">
              {(user?.full_name || user?.email || "?").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.full_name || "Operator"}</p>
              <p className="text-[11px] text-white/70 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg py-2 transition-colors text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
        <button onClick={onClose} className="md:hidden h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center text-white shrink-0">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-white text-brand-dark shadow-[0_8px_20px_-8px_rgba(2,132,199,0.7)]"
                  : "text-white/80 hover:bg-white/15 hover:text-white"
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
        <div className="inline-flex rounded-xl bg-white/15 ring-1 ring-white/20 px-3 py-2.5">
          <Logo onDark showBadge={false} markClassName="h-7 w-7" />
        </div>
        <p className="text-[10px] text-white/60 mt-3 px-1">v1.0.0 · Automotive Edge AI</p>
      </div>
    </aside>
  );
}
