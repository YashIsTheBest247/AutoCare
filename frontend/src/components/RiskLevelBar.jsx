export default function RiskLevelBar({ score = 0, level }) {
  const pct = Math.max(0, Math.min(100, score));
  const computed = level || (pct < 33 ? "Low" : pct < 66 ? "Medium" : "High");
  const labelColor = { Low: "text-risk-low", Medium: "text-risk-medium", High: "text-risk-high" };

  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <p className="text-3xl font-extrabold text-ink">{Math.round(pct)}</p>
        <span className={`text-sm font-bold ${labelColor[computed]}`}>{computed} Risk</span>
      </div>
      <div className="relative h-3 rounded-full bg-gradient-to-r from-risk-low via-risk-medium to-risk-high">
        <div
          className="absolute -top-1 h-5 w-5 rounded-full border-[3px] border-white bg-ink shadow-md"
          style={{ left: `calc(${pct}% - 10px)`, transition: "left 0.8s ease-out" }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wide text-subtle">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}
