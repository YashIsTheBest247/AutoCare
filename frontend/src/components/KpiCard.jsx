export default function KpiCard({ label, value, sub, accent = "ink", icon, delay = 0 }) {
  const accents = {
    ink: "bg-brand/10 text-brand",
    blue: "bg-brand/10 text-brand",
    green: "bg-risk-low/10 text-risk-low",
    amber: "bg-risk-medium/10 text-risk-medium",
    red: "bg-risk-high/10 text-risk-high",
  };
  return (
    <div className="card p-5 flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${accents[accent]}`}>
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted">{label}</p>
        <p className="text-2xl font-extrabold text-ink">{value}</p>
        {sub && <p className="text-[11px] text-subtle mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
