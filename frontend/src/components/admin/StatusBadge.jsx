const STYLES = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  rejected: "bg-crimson/15 text-crimson-light border-crimson/40",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-bold capitalize ${STYLES[status] || ""}`}
    >
      {status}
    </span>
  );
}
