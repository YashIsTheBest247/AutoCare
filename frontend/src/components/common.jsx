import { useEffect, useState } from "react";

function readChartTheme() {
  const dark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  return {
    dark,
    grid: dark ? "#2a2a2a" : "#e5e7eb",
    axis: dark ? "#a1a1a1" : "#a3a3a3",
    series: dark ? "#f5f5f5" : "#111111",
    cursor: dark ? "#2a2a2a" : "#f5f5f5",
    tooltip: {
      background: dark ? "#1e1e1e" : "#ffffff",
      border: `1px solid ${dark ? "#2a2a2a" : "#e5e7eb"}`,
      borderRadius: 10,
      fontSize: 12,
      color: dark ? "#f5f5f5" : "#111111",
    },
  };
}

export function useChartTheme() {
  const [theme, setTheme] = useState(readChartTheme);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readChartTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted text-xs uppercase tracking-widest">
      <span className="h-5 w-5 rounded-full border-2 border-ink border-t-transparent animate-spin"></span>
      {label}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="text-center py-16">
      <p className="text-ink font-bold uppercase tracking-wider text-sm">{title}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
