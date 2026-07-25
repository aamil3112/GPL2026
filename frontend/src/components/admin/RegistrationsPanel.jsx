import { useMemo, useState } from "react";
import StatusBadge from "./StatusBadge";

const TYPE_LABELS = { junior: "Junior", senior: "Senior", team: "Team" };

function RowActions({ r, onView, onApprove, onReject, onDelete, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-2 text-xs font-bold ${className}`}>
      <button
        onClick={() => onView(r)}
        className="rounded-full border border-white/20 px-3 py-1.5 hover:border-gold hover:text-gold"
      >
        View
      </button>
      {r.status !== "approved" && (
        <button
          onClick={() => onApprove(r._id)}
          className="rounded-full border border-emerald-500/40 px-3 py-1.5 text-emerald-400 hover:bg-emerald-500/10"
        >
          Approve
        </button>
      )}
      {r.status !== "rejected" && (
        <button
          onClick={() => onReject(r._id)}
          className="rounded-full border border-crimson/40 px-3 py-1.5 text-crimson-light hover:bg-crimson/10"
        >
          Reject
        </button>
      )}
      {r.status === "rejected" && (
        <button
          onClick={() => onDelete(r._id)}
          className="rounded-full bg-crimson px-3 py-1.5 text-white hover:brightness-110"
        >
          Delete
        </button>
      )}
    </div>
  );
}

export default function RegistrationsPanel({
  registrations,
  loading,
  onView,
  onApprove,
  onReject,
  onDelete,
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const cities = useMemo(() => {
    const set = new Set(registrations.map((r) => r.city).filter(Boolean));
    return Array.from(set).sort();
  }, [registrations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registrations.filter((r) => {
      const name = (r.type === "team" ? r.teamName : r.fullName) || "";
      if (q && !name.toLowerCase().includes(q) && !r.phone?.includes(q)) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (cityFilter !== "all" && r.city !== cityFilter) return false;
      return true;
    });
  }, [registrations, search, typeFilter, statusFilter, cityFilter]);

  const selectClass =
    "rounded-lg border border-white/10 bg-charcoal px-3 py-2.5 text-sm text-white outline-none focus:border-gold";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${selectClass} sm:min-w-[220px] sm:flex-1`}
        />
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
          <select className={selectClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
            <option value="team">Team</option>
          </select>
          <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className={selectClass} value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="mt-6 text-center text-white/40">Loading registrations...</p>}
      {!loading && filtered.length === 0 && (
        <p className="mt-6 text-center text-white/40">No registrations found.</p>
      )}

      {/* Mobile: stacked cards */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 space-y-3 sm:hidden">
          {filtered.map((r) => (
            <div key={r._id} className="rounded-xl border border-white/10 bg-charcoal p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{r.type === "team" ? r.teamName : r.fullName}</p>
                  <p className="text-xs text-white/50">
                    {TYPE_LABELS[r.type]} &middot; {r.phone}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-2 text-sm text-white/60">
                Amount: <span className="font-semibold text-gold-light">₹{r.amount?.toLocaleString("en-IN")}</span>
              </p>
              <RowActions
                r={r}
                onView={onView}
                onApprove={onApprove}
                onReject={onReject}
                onDelete={onDelete}
                className="mt-3"
              />
            </div>
          ))}
        </div>
      )}

      {/* Desktop / tablet: table */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 hidden overflow-x-auto rounded-xl border border-white/10 sm:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-charcoal text-white/50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold">
                    {r.type === "team" ? r.teamName : r.fullName}
                  </td>
                  <td className="px-4 py-3 text-white/60">{TYPE_LABELS[r.type]}</td>
                  <td className="px-4 py-3 text-white/60">{r.phone}</td>
                  <td className="px-4 py-3 text-white/60">₹{r.amount?.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      r={r}
                      onView={onView}
                      onApprove={onApprove}
                      onReject={onReject}
                      onDelete={onDelete}
                      className="justify-end"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
