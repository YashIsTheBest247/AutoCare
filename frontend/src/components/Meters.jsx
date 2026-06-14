const LABELS = {
  engine: "Engine",
  battery: "Battery",
  cooling: "Cooling",
  drivetrain: "Drivetrain",
  economy: "Economy",
  temperature: "Engine Temp",
  battery_voltage: "Battery Voltage",
  rpm: "RPM",
  fuel_efficiency: "Fuel Efficiency",
  vibration: "Vibration",
};

function healthColor(v) {
  return v >= 70 ? "bg-risk-low" : v >= 40 ? "bg-risk-medium" : "bg-risk-high";
}

export function ComponentHealthBars({ data }) {
  const entries = Object.entries(data || {});
  if (!entries.length) return <p className="text-sm text-muted">No data yet.</p>;
  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted">{LABELS[key] || key}</span>
            <span className="font-semibold text-ink">{value}%</span>
          </div>
          <div className="h-2 rounded-full bg-line overflow-hidden">
            <div className={`h-full rounded-full ${healthColor(value)} transition-all duration-700`} style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ContributionBars({ items }) {
  if (!items || !items.length) return <p className="text-sm text-muted">No contributing factors.</p>;
  const max = Math.max(...items.map((i) => i.contribution), 1);
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.feature}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted">{LABELS[it.feature] || it.feature}</span>
            <span className="font-semibold text-ink">{it.contribution}%</span>
          </div>
          <div className="h-2 rounded-full bg-line overflow-hidden">
            <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${(it.contribution / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
