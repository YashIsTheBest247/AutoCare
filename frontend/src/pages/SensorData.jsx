import { useEffect, useState } from "react";
import { listVehicles, listSensorData, createSensorData } from "../api/client.js";
import { Spinner, EmptyState, SectionTitle, formatDate } from "../components/common.jsx";

const FIELDS = [
  { key: "temperature", label: "Engine Temp (°C)", placeholder: "90" },
  { key: "battery_voltage", label: "Battery Voltage (V)", placeholder: "13.8" },
  { key: "rpm", label: "RPM", placeholder: "2400" },
  { key: "fuel_efficiency", label: "Fuel Efficiency (km/L)", placeholder: "16" },
  { key: "vibration", label: "Vibration Level", placeholder: "0.9" },
];

const empty = { temperature: "", battery_voltage: "", rpm: "", fuel_efficiency: "", vibration: "" };

export default function SensorData() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState("");
  const [readings, setReadings] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listVehicles().then((v) => {
      setVehicles(v);
      if (v.length) setSelected(String(v[0].id));
    });
  }, []);

  const load = () => listSensorData(selected || undefined).then(setReadings);
  useEffect(() => { if (selected) load(); }, [selected]);

  const submit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await createSensorData({
        vehicle_id: Number(selected),
        ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, Number(v)])),
      });
      setForm(empty);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-5 h-fit">
        <SectionTitle>Record Reading</SectionTitle>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Vehicle</label>
            <select className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input className="input" type="number" step="any" required placeholder={f.placeholder}
                value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
          <button className="btn-primary w-full" disabled={saving || !selected}>
            {saving ? "Saving..." : "Submit Reading"}
          </button>
          <p className="text-[11px] text-muted">A prediction is generated automatically for each reading.</p>
        </form>
      </div>

      <div className="card p-5 lg:col-span-2">
        <SectionTitle>Recent Readings</SectionTitle>
        {!readings ? (
          <Spinner />
        ) : readings.length === 0 ? (
          <EmptyState title="No readings yet" hint="Submit a sensor reading to begin monitoring." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-subtle border-b border-line">
                  <th className="py-2 pr-3 font-semibold">Time</th>
                  <th className="py-2 pr-3 font-semibold">Temp</th>
                  <th className="py-2 pr-3 font-semibold">Battery</th>
                  <th className="py-2 pr-3 font-semibold">RPM</th>
                  <th className="py-2 pr-3 font-semibold">Fuel</th>
                  <th className="py-2 pr-3 font-semibold">Vibration</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r) => (
                  <tr key={r.id} className="border-b border-line/70 hover:bg-neutral-50">
                    <td className="py-2.5 pr-3 text-subtle text-[11px] whitespace-nowrap">{formatDate(r.timestamp)}</td>
                    <td className="py-2.5 pr-3 text-ink">{r.temperature}</td>
                    <td className="py-2.5 pr-3 text-ink">{r.battery_voltage}</td>
                    <td className="py-2.5 pr-3 text-ink">{r.rpm}</td>
                    <td className="py-2.5 pr-3 text-ink">{r.fuel_efficiency}</td>
                    <td className="py-2.5 pr-3 text-ink">{r.vibration}</td>
                    <td className="py-2.5">
                      {r.anomalies && r.anomalies.length ? (
                        <span className="text-[11px] font-bold text-risk-high" title={r.anomalies.join("; ")}>
                          ⚠ {r.anomalies.length} anomaly{r.anomalies.length > 1 ? "ies" : ""}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-risk-low">Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
