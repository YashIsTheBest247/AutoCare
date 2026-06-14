export default function RiskBadge({ level }) {
  const styles = {
    Low: "bg-risk-low/10 text-risk-low border-risk-low/30",
    Medium: "bg-risk-medium/10 text-risk-medium border-risk-medium/30",
    High: "bg-risk-high/10 text-risk-high border-risk-high/30",
  };
  const cls = styles[level] || "bg-neutral-100 text-muted border-line";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {level || "N/A"}
    </span>
  );
}
