import { useState } from "react";
import api from "../../api/client";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const EXPORTS = [
  { key: "csv-all", label: "Export All (CSV)", endpoint: "/admin/export/csv", params: { status: "all" }, filename: "registrations-all.csv" },
  { key: "csv-approved", label: "Export Approved (CSV)", endpoint: "/admin/export/csv", params: { status: "approved" }, filename: "registrations-approved.csv" },
  { key: "csv-pending", label: "Export Pending (CSV)", endpoint: "/admin/export/csv", params: { status: "pending" }, filename: "registrations-pending.csv" },
  { key: "json-approved", label: "Export Approved (JSON)", endpoint: "/admin/export/json", params: {}, filename: "registrations-approved.json" },
];

export default function ExportPanel() {
  const [loadingKey, setLoadingKey] = useState(null);
  const [error, setError] = useState("");

  async function handleExport(item) {
    setLoadingKey(item.key);
    setError("");
    try {
      const res = await api.get(item.endpoint, { params: item.params, responseType: "blob" });
      downloadBlob(res.data, item.filename);
    } catch {
      setError(`Failed to export: ${item.label}`);
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-crimson-light">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {EXPORTS.map((item) => (
          <button
            key={item.key}
            onClick={() => handleExport(item)}
            disabled={loadingKey === item.key}
            className="rounded-xl border border-gold/20 bg-charcoal p-4 text-left font-bold text-gold-light transition hover:border-gold disabled:opacity-50 sm:p-5"
          >
            {loadingKey === item.key ? "Preparing..." : item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
