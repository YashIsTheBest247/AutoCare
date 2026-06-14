import { useEffect, useState } from "react";
import { listVehicles, getVehicleAnalytics } from "../api/client.js";
import HealthGauge from "../components/HealthGauge.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import { ComponentHealthBars } from "../components/Meters.jsx";
import { Spinner, EmptyState, SectionTitle } from "../components/common.jsx";

export default function Compare() {
  const [vehicles, setVehicles] = useState(null);
  const [selected, setSelected] = useState([]);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    listVehicles().then(setVehicles);
  }, []);

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      if (!analytics[id]) getVehicleAnalytics(id).then((a) => setAnalytics((m) => ({ ...m, [id]: a })));
      return [...prev, id];
    });
  };

  if (!vehicles) return <Spinner label="Loading vehicles..." />;

  const chosen = vehicles.filter((v) => selected.includes(v.id));

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <SectionTitle action={<span className="text-xs text-muted">Pick up to 3</span>}>Select Vehicles to Compare</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {vehicles.map((v) => {
            const active = selected.includes(v.id);
            return (
              <button key={v.id} onClick={() => toggle(v.id)}
                className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${active ? "bg-brand text-accentfg border-brand" : "bg-card border-line text-muted hover:border-brand/60"}`}>
                {v.name}
              </button>
            );
          })}
        </div>
      </div>

      {chosen.length === 0 ? (
        <div className="card p-6"><EmptyState title="No vehicles selected" hint="Choose vehicles above to compare them side by side." /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {chosen.map((v) => {
            const a = analytics[v.id];
            return (
              <div key={v.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-ink">{v.name}</p>
                    <p className="text-xs text-muted">{v.model} · <span className="capitalize">{v.type}</span></p>
                  </div>
                  <RiskBadge level={v.latest_risk_level} />
                </div>
                <div className="flex justify-center"><HealthGauge score={v.health_score} size={150} /></div>
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="panel p-3 text-center">
                    <p className="text-lg font-bold text-ink">{v.sensor_count}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted">Readings</p>
                  </div>
                  <div className="panel p-3 text-center">
                    <p className="text-lg font-bold text-ink">{a && a.rul_days != null ? `${a.rul_days}d` : "—"}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted">RUL</p>
                  </div>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-subtle mb-2">Component Health</p>
                {a ? <ComponentHealthBars data={a.component_health} /> : <Spinner label="" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
