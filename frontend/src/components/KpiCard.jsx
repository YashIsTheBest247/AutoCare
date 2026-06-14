export default function KpiCard({ label, value, sub, accent = "blue", icon, trend, delay = 0 }) {
  const tone = {
    blue: "text-brand",
    green: "text-risk-low",
    amber: "text-risk-medium",
    red: "text-risk-high",
    ink: "text-muted",
  };
  const trendTone = trend && trend.dir === "down" ? "text-risk-high" : "text-risk-low";

  return (
    <div className="card p-4 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">{label}</p>
        {icon && (
          <svg className={`h-4 w-4 ${tone[accent]}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        )}
      </div>
      <div className="mt-2.5 flex items-end gap-2">
        <p className="text-[28px] leading-none font-bold tracking-tight text-ink tabular-nums">{value}</p>
        {trend && (
          <span className={`mb-0.5 inline-flex items-center gap-0.5 text-xs font-medium ${trendTone}`}>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={trend.dir === "down" ? "M19 14l-7 7-7-7" : "M5 10l7-7 7 7"} />
            </svg>
            {trend.value}
          </span>
        )}
      </div>
      {sub && <p className="mt-1.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}
