import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/auth.jsx";

const links = [
  { to: "/", label: "Overview", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { to: "/vehicles", label: "Fleet", icon: "M5 11l1.5-4.5h11L19 11m-14 0h14m-14 0v6m14-6v6M7 17h2m6 0h2" },
  { to: "/sensor-data", label: "Diagnostics", icon: "M3 12h4l3 8 4-16 3 8h4" },
  { to: "/predictions", label: "Predictions", icon: "M13 2L3 14h7l-1 8 10-12h-7l1-8z" },
  { to: "/analytics", label: "Analytics", icon: "M4 19V5m0 14h16M8 17V9m4 8V6m4 11v-5" },
  { to: "/maintenance", label: "Maintenance", icon: "M14.7 6.3a4 4 0 01-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 015.4-5.4l-2.5 2.5-2-2 2.5-2.5z" },
  { to: "/compare", label: "Compare", icon: "M9 3v18M15 3v18M4 7h5M4 12h5M4 17h5M15 9h5M15 14h5" },
  { to: "/reports", label: "Reports", icon: "M9 17v-6h2v6m4-10v10M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { to: "/settings", label: "Settings", icon: "M10.3 3.3a1 1 0 011.4 0l1 .9 1.3-.3a1 1 0 011.2.7l.4 1.3 1.2.6a1 1 0 01.5 1.3l-.5 1.2.5 1.2a1 1 0 01-.5 1.3l-1.2.6-.4 1.3a1 1 0 01-1.2.7l-1.3-.3-1 .9a1 1 0 01-1.4 0l-1-.9-1.3.3a1 1 0 01-1.2-.7l-.4-1.3-1.2-.6a1 1 0 01-.5-1.3l.5-1.2-.5-1.2a1 1 0 01.5-1.3l1.2-.6.4-1.3a1 1 0 011.2-.7l1.3.3 1-.9zM12 15a3 3 0 100-6 3 3 0 000 6z" },
];

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { user, signOut } = useAuth();
  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 flex flex-col min-h-screen
        bg-card border-r border-line text-ink
        transform transition-transform duration-200 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-line">
        <Logo showBadge={false} markClassName="h-7 w-7" />
        <button onClick={onClose} className="md:hidden h-8 w-8 rounded-md hover:bg-paper flex items-center justify-center text-subtle">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="border-b border-line p-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-paper ring-1 ring-line px-2.5 py-2">
          <div className="h-8 w-8 rounded-lg bg-ink text-white flex items-center justify-center text-[11px] font-bold uppercase">
            {(user?.full_name || user?.email || "?").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink truncate">{user?.full_name || "Operator"}</p>
            <p className="text-[10px] text-subtle truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={signOut} className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide bg-paper hover:bg-ink hover:text-white border border-line rounded-full py-2 text-muted transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-subtle">Platform</p>
        <div className="flex flex-col gap-0.5">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  isActive
                    ? "bg-ink text-white font-semibold"
                    : "text-muted hover:bg-paper hover:text-ink"
                }`
              }
            >
              <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={l.icon} />
              </svg>
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}
