const ACTION_VERB = { approve: "approved", reject: "rejected", delete: "deleted" };
const ACTION_COLOR = {
  approve: "text-emerald-400",
  reject: "text-crimson-light",
  delete: "text-white/70",
};
const ACTION_DOT = {
  approve: "bg-emerald-400",
  reject: "bg-crimson",
  delete: "bg-white/50",
};

export default function ActivityLogPanel({ logs, loading }) {
  if (loading) return <p className="text-white/50">Loading activity log...</p>;
  if (!logs.length) return <p className="text-white/50">No activity yet.</p>;

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div
          key={log._id}
          className="flex gap-4 rounded-xl border border-white/10 bg-charcoal p-4"
        >
          <div className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${ACTION_DOT[log.action]}`} />
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-bold text-gold-light">{log.adminUsername}</span>{" "}
              <span className={ACTION_COLOR[log.action]}>{ACTION_VERB[log.action]}</span>{" "}
              <span className="font-semibold">{log.registrationName}</span>
            </p>
            <p className="mt-1 text-xs text-white/40">
              {new Date(log.createdAt).toLocaleString("en-IN")}
            </p>
            {log.action === "reject" && (
              <p className="mt-1 text-xs text-white/50">
                Cloudinary deletion:{" "}
                <span className={log.cloudinaryDeletion?.success ? "text-emerald-400" : "text-crimson-light"}>
                  {log.cloudinaryDeletion?.attempted
                    ? log.cloudinaryDeletion.success
                      ? "success"
                      : "failed"
                    : "not attempted"}
                </span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
