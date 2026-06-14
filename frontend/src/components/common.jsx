export function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted text-xs uppercase tracking-widest">
      <span className="h-5 w-5 rounded-full border-2 border-ink border-t-transparent animate-spin"></span>
      {label}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="text-center py-16">
      <p className="text-ink font-bold uppercase tracking-wider text-sm">{title}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
