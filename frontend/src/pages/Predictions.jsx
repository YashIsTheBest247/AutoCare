import { useEffect, useState } from "react";
import { listVehicles, listPredictions, runPrediction, predictForVehicle } from "../api/client.js";
import RiskBadge from "../components/RiskBadge.jsx";
import Select from "../components/Select.jsx";
import { Spinner, EmptyState, SectionTitle, formatDate } from "../components/common.jsx";

const FIELDS = [
  { key: "temperature", label: "Engine Temp (°C)", value: 95 },
  { key: "battery_voltage", label: "Battery Voltage (V)", value: 13.6 },
  { key: "rpm", label: "RPM", value: 2400 },
  { key: "fuel_efficiency", label: "Fuel Efficiency (km/L)", value: 16 },
  { key: "vibration", label: "Vibration Level", value: 0.9 },
];

export default function Predictions() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map((f) => [f.key, f.value])));
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listVehicles().then((v) => {
      setVehicles(v);
      if (v.length) setSelected(String(v[0].id));
    });
  }, []);

  const loadHistory = () => listPredictions(selected || undefined).then(setHistory);
  useEffect(() => { if (selected) loadHistory(); }, [selected]);

  const payload = () => Object.fromEntries(Object.entries(form).map(([k, v]) => [k, Number(v)]));

  const predict = async (store) => {
    setLoading(true);
    try {
      const res = await runPrediction(payload());
      setResult(res);
      if (store && selected) {
        await predictForVehicle(Number(selected), payload());
        await loadHistory();
      }
    } finally {
      setLoading(false);
    }
  };

  const riskColor = { Low: "text-risk-low", Medium: "text-risk-medium", High: "text-risk-high" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-5 h-fit">
        <SectionTitle>Run Prediction</SectionTitle>
        <div className="space-y-4">
          <div>
            <label className="label">Vehicle (for saving)</label>
            <Select
              value={selected}
              onChange={(v) => setSelected(String(v))}
              options={vehicles.map((v) => ({ value: v.id, label: v.name }))}
              placeholder="Select a vehicle"
            />
          </div>
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input className="input" type="number" step="any" value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
          <div className="flex gap-2">
            <button className="btn-primary flex-1" disabled={loading} onClick={() => predict(false)}>
              {loading ? "..." : "Predict"}
            </button>
            <button className="btn-pill flex-1 justify-center"
              disabled={loading || !selected} onClick={() => predict(true)}>
              Predict & Save
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-2">
        {result && (
          <div className="card p-6 animate-fade-up">
            <SectionTitle>Latest Result</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <p className={`text-5xl font-extrabold ${riskColor[result.risk_level]}`}>{result.risk_score}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted mt-1">Risk Score / 100</p>
              </div>
              <div className="text-center">
                <RiskBadge level={result.risk_level} />
                <p className="text-[11px] text-muted mt-2">
                  Failure prob: {(result.failure_probability * 100).toFixed(1)}%
                </p>
              </div>
              <div className="sm:col-span-1">
                <p className="text-[10px] uppercase tracking-widest text-subtle mb-1">Recommendation</p>
                <p className="text-sm text-ink">{result.recommendation}</p>
              </div>
            </div>
            {result.anomalies && result.anomalies.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-risk-high/5 border border-risk-high/20">
                <p className="text-[10px] uppercase tracking-widest font-bold text-risk-high mb-1">Detected Anomalies</p>
                <ul className="text-xs text-ink list-disc list-inside space-y-0.5">
                  {result.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="card p-5">
          <SectionTitle>Prediction History</SectionTitle>
          {!history ? (
            <Spinner />
          ) : history.length === 0 ? (
            <EmptyState title="No predictions yet" hint="Run and save a prediction to build history." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-subtle border-b border-line">
                    <th className="py-2 pr-4 font-semibold">Time</th>
                    <th className="py-2 pr-4 font-semibold">Score</th>
                    <th className="py-2 pr-4 font-semibold">Risk</th>
                    <th className="py-2 font-semibold">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((p) => (
                    <tr key={p.id} className="border-b border-line/70 hover:bg-neutral-50">
                      <td className="py-2.5 pr-4 text-subtle text-[11px] whitespace-nowrap">{formatDate(p.created_at)}</td>
                      <td className="py-2.5 pr-4 font-bold text-ink">{p.risk_score}</td>
                      <td className="py-2.5 pr-4"><RiskBadge level={p.risk_level} /></td>
                      <td className="py-2.5 text-xs text-muted max-w-md truncate">{p.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
