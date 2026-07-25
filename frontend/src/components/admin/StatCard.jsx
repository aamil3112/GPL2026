export default function StatCard({ label, value, accent = "gold" }) {
  const accentClass = accent === "crimson" ? "text-crimson-light" : "text-gold-light";
  return (
    <div className="rounded-xl border border-white/10 bg-charcoal p-4 sm:p-5">
      <p className="text-[10px] uppercase tracking-widest text-white/40 sm:text-xs">{label}</p>
      <p className={`mt-2 break-words text-xl font-black sm:text-2xl ${accentClass}`}>{value}</p>
    </div>
  );
}
