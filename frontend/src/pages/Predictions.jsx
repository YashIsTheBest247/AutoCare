import { useEffect, useState } from "react";
import { listVehicles, listPredictions, runPrediction, predictForVehicle, exportPredictionCsv } from "../api/client.js";
import RiskBadge from "../components/RiskBadge.jsx";
import Select from "../components/Select.jsx";
import { ComponentHealthBars, ContributionBars } from "../components/Meters.jsx";
import { Spinner, EmptyState, SectionTitle, formatDate } from "../components/common.jsx";

const GROUPS = [
  { title: "Engine", fields: [
    { key: "temperature", label: "Temperature (°C)", value: 95 },
    { key: "rpm", label: "RPM", value: 2400 },
  ] },
  { title: "Electrical", fields: [
    { key: "battery_voltage", label: "Battery Voltage (V)", value: 13.6 },
  ] },
  { title: "Performance", fields: [
    { key: "fuel_efficiency", label: "Fuel Efficiency (km/L)", value: 16 },
    { key: "vibration", label: "Vibration Level", value: 0.9 },
  ] },
];
const ALL_FIELDS = GROUPS.flatMap((g) => g.fields);

const prioTone = { Critical: "text-risk-high", High: "text-risk-high", Medium: "text-risk-medium", Low: "text-risk-low" };

function Stat({ label, value, tone = "text-ink" }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-subtle">{label}</p>
      <p className={`text-sm font-semibold mt-1 ${tone}`}>{value}</p>
    </div>
  );
}

export default function Predictions() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState(Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f.value])));
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [riskFilter, setRiskFilter] = useState("all");

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="card p-5 h-fit">
        <SectionTitle>Diagnostic Input</SectionTitle>
        <div className="space-y-5">
          <div>
            <label className="label">Vehicle (for saving)</label>
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
                    <input className="input" type="number" step="any" value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <button className="btn-primary flex-1" disabled={loading} onClick={() => predict(false)}>
              {loading ? "Analyzing..." : "Run Diagnosis"}
            </button>
            <button className="btn-pill flex-1 justify-center" disabled={loading || !selected} onClick={() => predict(true)}>
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-2">
        {result ? (
          <>
            <div className="card p-6 animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-ink">Risk Assessment</h3>
                <RiskBadge level={result.risk_level} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 items-center">
                <div>
                  <p className={`text-5xl font-bold tabular-nums ${riskColor[result.risk_level]}`}>{result.risk_score}</p>
                  <p className="text-[10px] uppercase tracking-widest text-subtle mt-1">Risk Score / 100</p>
                </div>
                <Stat label="Risk Category" value={result.risk_level} tone={riskColor[result.risk_level]} />
                <Stat label="Failure Probability" value={`${(result.failure_probability * 100).toFixed(1)}%`} />
                <Stat label="Model Confidence" value={`${result.confidence}%`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-ink mb-4">Failure Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Predicted Component" value={result.predicted_component} tone="text-brand-light" />
                  <Stat label="Time to Failure" value={`${result.rul_days} days`} />
                  <div className="col-span-2"><Stat label="Failure Type" value={result.failure_type} /></div>
                </div>
                <p className="text-[10px] uppercase tracking-wide text-subtle mt-4 mb-2">Root Cause Indicators</p>
                <ul className="space-y-1.5">
                  {result.root_cause_indicators.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-risk-medium shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="text-sm font-semibold text-ink mb-4">Maintenance Planning</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Maintenance Priority" value={result.maintenance_priority} tone={prioTone[result.maintenance_priority]} />
                  <Stat label="Est. Downtime" value={`${result.estimated_downtime_hours} h`} />
                  <Stat label="Est. Cost Impact" value={`$${result.estimated_cost.toLocaleString()}`} />
                  <Stat label="Anomalies" value={result.anomalies.length} tone={result.anomalies.length ? "text-risk-high" : "text-risk-low"} />
                </div>
                <p className="text-[10px] uppercase tracking-wide text-subtle mt-4 mb-1.5">Recommended Action</p>
                <p className="text-sm text-ink">{result.recommendation}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-ink mb-4">Component Health</h3>
                <ComponentHealthBars data={result.component_health} />
              </div>
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-ink mb-4">Risk Contribution</h3>
                <ContributionBars items={result.contributions} />
              </div>
            </div>
          </>
        ) : (
          <div className="card p-10">
            <EmptyState title="No diagnosis yet" hint="Enter diagnostic readings and run an analysis to generate an intelligence report." />
          </div>
        )}

        <div className="card p-5">
          <SectionTitle
            action={
              <div className="flex items-center gap-1.5">
                {["all", "Low", "Medium", "High"].map((lvl) => (
                  <button key={lvl} onClick={() => setRiskFilter(lvl)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${riskFilter === lvl ? "bg-brand text-accentfg" : "bg-elevated text-muted hover:text-ink"}`}>
                    {lvl}
                  </button>
                ))}
                <button onClick={() => exportPredictionCsv(selected ? Number(selected) : undefined)}
                  className="text-xs px-2.5 py-1 rounded-md bg-elevated text-muted hover:text-ink">Export</button>
              </div>
            }
          >
            Prediction History
          </SectionTitle>
          {!history ? (
            <Spinner />
          ) : history.filter((p) => riskFilter === "all" || p.risk_level === riskFilter).length === 0 ? (
            <EmptyState title="No predictions" hint="Run and save a prediction, or change the filter." />
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
                  {history.filter((p) => riskFilter === "all" || p.risk_level === riskFilter).map((p) => (
                    <tr key={p.id} className="border-b border-line/70 hover:bg-white/[0.03]">
                      <td className="py-2.5 pr-4 text-subtle text-[11px] whitespace-nowrap">{formatDate(p.created_at)}</td>
                      <td className="py-2.5 pr-4 font-bold text-ink tabular-nums">{p.risk_score}</td>
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
