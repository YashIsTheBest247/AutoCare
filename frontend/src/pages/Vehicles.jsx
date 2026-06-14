import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listVehicles, createVehicle, deleteVehicle } from "../api/client.js";
import RiskBadge from "../components/RiskBadge.jsx";
import Select from "../components/Select.jsx";
import { Spinner, EmptyState, SectionTitle, formatDate } from "../components/common.jsx";

const VEHICLE_TYPES = ["car", "truck", "van", "bus", "motorcycle"];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(null);
  const [form, setForm] = useState({ name: "", model: "", type: "car" });
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "name", dir: 1 });

  const load = () => listVehicles().then(setVehicles);
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.model) return;
    setSaving(true);
    try {
      await createVehicle(form);
      setForm({ name: "", model: "", type: "car" });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await deleteVehicle(id);
    load();
  };

  const RANK = { Low: 1, Medium: 2, High: 3 };
  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }));

  const display = (() => {
    if (!vehicles) return null;
    const q = query.trim().toLowerCase();
    let list = q
      ? vehicles.filter((v) => [v.name, v.model, v.type].some((s) => (s || "").toLowerCase().includes(q)))
      : [...vehicles];
    list.sort((a, b) => {
      let av, bv;
      if (sort.key === "health") { av = a.health_score; bv = b.health_score; }
      else if (sort.key === "risk") { av = RANK[a.latest_risk_level] || 0; bv = RANK[b.latest_risk_level] || 0; }
      else { av = (a.name || "").toLowerCase(); bv = (b.name || "").toLowerCase(); }
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
    return list;
  })();

  const sortArrow = (key) => (sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : "");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-5 h-fit">
        <SectionTitle>Add Vehicle</SectionTitle>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Vehicle Name</label>
            <input className="input" value={form.name} placeholder="Fleet Truck 02"
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Model</label>
            <input className="input" value={form.model} placeholder="Volvo FH16"
              onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </div>
          <div>
            <label className="label">Type</label>
            <Select
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              options={VEHICLE_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
            />
          </div>
          <button className="btn-primary w-full" disabled={saving}>
            {saving ? "Adding..." : "Add Vehicle"}
          </button>
        </form>
      </div>

      <div className="card p-5 lg:col-span-2">
        <SectionTitle
          action={
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter fleet..."
              className="text-xs bg-paper border border-line rounded-full px-3 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-brand/40" />
          }
        >
          Fleet ({display ? display.length : 0})
        </SectionTitle>
        {!display ? (
          <Spinner />
        ) : display.length === 0 ? (
          <EmptyState title="No vehicles" hint="Add a vehicle or clear the filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-subtle border-b border-line">
                  <th className="py-2 pr-4 font-semibold cursor-pointer select-none hover:text-ink" onClick={() => toggleSort("name")}>Name{sortArrow("name")}</th>
                  <th className="py-2 pr-4 font-semibold">Model</th>
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 pr-4 font-semibold cursor-pointer select-none hover:text-ink" onClick={() => toggleSort("health")}>Health{sortArrow("health")}</th>
                  <th className="py-2 pr-4 font-semibold cursor-pointer select-none hover:text-ink" onClick={() => toggleSort("risk")}>Risk{sortArrow("risk")}</th>
                  <th className="py-2 pr-4 font-semibold">Added</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {display.map((v) => (
                  <tr key={v.id} className="border-b border-line/70 hover:bg-slate-50">
                    <td className="py-3 pr-4">
                      <Link to={`/vehicles/${v.id}`} className="font-bold text-ink hover:text-brand transition-colors">{v.name}</Link>
                    </td>
                    <td className="py-3 pr-4 text-muted">{v.model}</td>
                    <td className="py-3 pr-4 capitalize text-muted">{v.type}</td>
                    <td className="py-3 pr-4">
                      <span className="font-bold text-ink">{v.health_score}%</span>
                    </td>
                    <td className="py-3 pr-4"><RiskBadge level={v.latest_risk_level} /></td>
                    <td className="py-3 pr-4 text-subtle text-[11px] whitespace-nowrap">{formatDate(v.created_at)}</td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <Link to={`/vehicles/${v.id}`}
                        className="text-[10px] uppercase tracking-wider font-bold text-brand hover:underline mr-3">View</Link>
                      <button onClick={() => remove(v.id)}
                        className="text-[10px] uppercase tracking-wider font-bold text-risk-high hover:underline">Delete</button>
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
