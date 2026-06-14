import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listVehicles, listMaintenance, createMaintenance, updateMaintenance, deleteMaintenance } from "../api/client.js";
import Select from "../components/Select.jsx";
import { Spinner, EmptyState, SectionTitle, formatDate } from "../components/common.jsx";

const PRIORITIES = ["low", "medium", "high"];
const priorityStyle = {
  low: "bg-risk-low/10 text-risk-low",
  medium: "bg-risk-medium/10 text-risk-medium",
  high: "bg-risk-high/10 text-risk-high",
};

export default function Maintenance() {
  const [vehicles, setVehicles] = useState([]);
  const [tasks, setTasks] = useState(null);
  const [form, setForm] = useState({ vehicle_id: "", title: "", priority: "medium", notes: "" });
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  const load = () => listMaintenance().then(setTasks);
  useEffect(() => {
    listVehicles().then((v) => {
      setVehicles(v);
      if (v.length) setForm((f) => ({ ...f, vehicle_id: String(v[0].id) }));
    });
    load();
  }, []);

  const vehicleName = (id) => {
    const v = vehicles.find((x) => x.id === id);
    return v ? v.name : `Vehicle ${id}`;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.vehicle_id || !form.title) return;
    setSaving(true);
    try {
      await createMaintenance({
        vehicle_id: Number(form.vehicle_id),
        title: form.title,
        priority: form.priority,
        notes: form.notes || null,
      });
      setForm({ ...form, title: "", notes: "" });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (t) => {
    await updateMaintenance(t.id, { status: t.status === "done" ? "pending" : "done" });
    load();
  };
  const remove = async (id) => {
    await deleteMaintenance(id);
    load();
  };

  const filtered = tasks ? tasks.filter((t) => filter === "all" || t.status === filter) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-5 h-fit">
        <SectionTitle>Schedule Maintenance</SectionTitle>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Vehicle</label>
            <Select
              value={form.vehicle_id}
              onChange={(v) => setForm({ ...form, vehicle_id: String(v) })}
              options={vehicles.map((v) => ({ value: v.id, label: v.name }))}
              placeholder="Select a vehicle"
            />
          </div>
          <div>
            <label className="label">Task</label>
            <input className="input" value={form.title} placeholder="Replace brake pads"
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Priority</label>
            <Select
              value={form.priority}
              onChange={(v) => setForm({ ...form, priority: v })}
              options={PRIORITIES.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-[70px]" value={form.notes} placeholder="Optional details"
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button className="btn-primary w-full" disabled={saving || !form.vehicle_id}>
            {saving ? "Adding..." : "Add Task"}
          </button>
        </form>
      </div>

      <div className="card p-5 lg:col-span-2">
        <SectionTitle
          action={
            <div className="flex gap-1.5">
              {["all", "pending", "done"].map((s) => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`text-xs px-2.5 py-1 rounded-full capitalize transition-colors ${filter === s ? "bg-brand text-white" : "bg-paper text-muted hover:text-ink"}`}>
                  {s}
                </button>
              ))}
            </div>
          }
        >
          Maintenance Tasks
        </SectionTitle>
        {!tasks ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState title="No tasks" hint="Schedule a maintenance task to get started." />
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((t) => (
              <li key={t.id} className="flex items-center gap-3 panel px-3.5 py-3">
                <button onClick={() => toggle(t)}
                  className={`h-6 w-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${t.status === "done" ? "bg-risk-low border-risk-low text-white" : "border-line hover:border-brand"}`}>
                  {t.status === "done" && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${t.status === "done" ? "line-through text-muted" : "text-ink"}`}>{t.title}</p>
                  <p className="text-xs text-muted truncate">
                    <Link to={`/vehicles/${t.vehicle_id}`} className="hover:text-brand">{vehicleName(t.vehicle_id)}</Link>
                    {" · "}{formatDate(t.created_at)}{t.notes ? ` · ${t.notes}` : ""}
                  </p>
                </div>
                <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${priorityStyle[t.priority] || priorityStyle.medium}`}>{t.priority}</span>
                <button onClick={() => remove(t.id)} className="text-[10px] uppercase tracking-wide font-bold text-risk-high hover:underline">Del</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
