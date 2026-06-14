import { useEffect, useRef, useState } from "react";
import { listVehicles, listSensorData, createSensorData, importSensorCsv, exportSensorCsv } from "../api/client.js";
import Select from "../components/Select.jsx";
import { Spinner, EmptyState, SectionTitle, formatDate } from "../components/common.jsx";

const GROUPS = [
  { title: "Engine", fields: [
    { key: "temperature", label: "Temperature (°C)", placeholder: "90" },
    { key: "rpm", label: "RPM", placeholder: "2400" },
  ] },
  { title: "Electrical", fields: [
    { key: "battery_voltage", label: "Battery Voltage (V)", placeholder: "13.8" },
  ] },
  { title: "Performance", fields: [
    { key: "fuel_efficiency", label: "Fuel Efficiency (km/L)", placeholder: "16" },
    { key: "vibration", label: "Vibration Level", placeholder: "0.9" },
  ] },
];

const empty = { temperature: "", battery_voltage: "", rpm: "", fuel_efficiency: "", vibration: "" };

export default function SensorData() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState("");
  const [readings, setReadings] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [anomaliesOnly, setAnomaliesOnly] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef(null);

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

  const onImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportMsg("Importing...");
    try {
      const res = await importSensorCsv(file);
      setImportMsg(`Imported ${res.imported} rows${res.errors.length ? `, ${res.errors.length} skipped` : ""}.`);
      await load();
    } catch {
      setImportMsg("Import failed.");
    }
    if (fileRef.current) fileRef.current.value = "";
    setTimeout(() => setImportMsg(""), 4000);
  };

  const shown = readings
    ? readings.filter((r) => !anomaliesOnly || (r.anomalies && r.anomalies.length))
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-5 h-fit">
        <SectionTitle>Record Reading</SectionTitle>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Vehicle</label>
            <Select
              value={selected}
              onChange={(v) => setSelected(String(v))}
              options={vehicles.map((v) => ({ value: v.id, label: v.name }))}
              placeholder="Select a vehicle"
            />
          </div>
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-subtle mb-2 pb-1.5 border-b border-line">{g.title}</p>
              <div className="space-y-3">
                {g.fields.map((f) => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <input className="input" type="number" step="any" required placeholder={f.placeholder}
                      value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button className="btn-primary w-full" disabled={saving || !selected}>
            {saving ? "Saving..." : "Submit Reading"}
          </button>
          <p className="text-[11px] text-muted">A prediction is generated automatically for each reading.</p>
        </form>
      </div>

      <div className="card p-5 lg:col-span-2">
        <SectionTitle
          action={
            <div className="flex items-center gap-1.5">
              <button onClick={() => setAnomaliesOnly((a) => !a)}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${anomaliesOnly ? "bg-brand text-accentfg" : "bg-paper text-muted hover:text-ink"}`}>
                Anomalies
              </button>
              <button onClick={() => exportSensorCsv(selected ? Number(selected) : undefined)}
                className="text-xs px-2.5 py-1 rounded-full bg-paper text-muted hover:text-ink">Export CSV</button>
              <button onClick={() => fileRef.current && fileRef.current.click()}
                className="text-xs px-2.5 py-1 rounded-full bg-paper text-muted hover:text-ink">Import CSV</button>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onImport} />
            </div>
          }
        >
          Recent Readings
        </SectionTitle>
        {importMsg && <p className="text-xs text-brand mb-2">{importMsg}</p>}
        {!shown ? (
          <Spinner />
        ) : shown.length === 0 ? (
          <EmptyState title="No readings" hint="Submit a sensor reading or clear the anomalies filter." />
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
                {shown.map((r) => (
                  <tr key={r.id} className="border-b border-line/70 hover:bg-paper">
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
