import StatCard from "./StatCard";

export default function OverviewPanel({ stats, loading }) {
  if (loading) return <p className="text-white/50">Loading overview...</p>;
  if (!stats) return <p className="text-white/50">No data available.</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard label="Total Registrations" value={stats.total} />
      <StatCard label="Approved" value={stats.approved} />
      <StatCard label="Pending" value={stats.pending} accent="crimson" />
      <StatCard label="Rejected" value={stats.rejected} accent="crimson" />
      <StatCard label="Individual Players" value={stats.individual} />
      <StatCard label="Teams" value={stats.team} />
      <StatCard
        label="Estimated Revenue"
        value={`₹${(stats.estimatedRevenue || 0).toLocaleString("en-IN")}`}
      />
      <StatCard label="Files on Cloudinary" value={stats.filesOnCloudinary} />
    </div>
  );
}
