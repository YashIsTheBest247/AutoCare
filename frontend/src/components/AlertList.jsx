import RiskBadge from "./RiskBadge.jsx";
import { formatDate, EmptyState } from "./common.jsx";

export default function AlertList({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return <EmptyState title="No active alerts" hint="All vehicles operating within normal parameters." />;
  }
  return (
    <ul className="space-y-3">
      {alerts.map((a, i) => (
        <li key={i} className="flex items-start gap-3 p-3 panel">
          <div className="h-9 w-9 rounded-xl bg-risk-high/10 text-risk-high flex items-center justify-center shrink-0">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.48 14.7A1 1 0 002.67 20h18.66a1 1 0 00.86-1.44l-8.48-14.7a1 1 0 00-1.72 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-ink truncate">{a.vehicle_name}</p>
              <RiskBadge level={a.risk_level} />
            </div>
            <p className="text-xs text-muted mt-0.5">
              {a.anomalies && a.anomalies.length ? a.anomalies.join(" · ") : "Elevated failure risk detected"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-subtle mt-1 whitespace-nowrap">{formatDate(a.timestamp)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
