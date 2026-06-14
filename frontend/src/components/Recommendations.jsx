import { EmptyState } from "./common.jsx";

const levelStyle = {
  High: "bg-risk-high/10 text-risk-high",
  Medium: "bg-risk-medium/10 text-risk-medium",
  Low: "bg-risk-low/10 text-risk-low",
};

export default function Recommendations({ items }) {
  if (!items || items.length === 0) {
    return <EmptyState title="No actions needed" hint="All vehicles are operating within healthy parameters." />;
  }
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li
          key={i}
          className="flex items-center gap-3 panel px-3.5 py-3 animate-fade-up"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <span className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${levelStyle[it.level] || levelStyle.Low}`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{it.title}</p>
            <p className="text-xs text-muted truncate">{it.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
