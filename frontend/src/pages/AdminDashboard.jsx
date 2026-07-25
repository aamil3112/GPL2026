import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { clearAdminSession, getAdminUsername } from "../utils/auth";
import { TOURNAMENT } from "../data/tournament";
import OverviewPanel from "../components/admin/OverviewPanel";
import RegistrationsPanel from "../components/admin/RegistrationsPanel";
import ReviewModal from "../components/admin/ReviewModal";
import ExportPanel from "../components/admin/ExportPanel";
import ActivityLogPanel from "../components/admin/ActivityLogPanel";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "registrations", label: "Registrations" },
  { key: "export", label: "Export" },
  { key: "activity", label: "Activity Log" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [registrations, setRegistrations] = useState([]);
  const [regsLoading, setRegsLoading] = useState(true);

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    setRegsLoading(true);
    try {
      const res = await api.get("/admin/registrations");
      setRegistrations(res.data);
    } finally {
      setRegsLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await api.get("/admin/activity-log");
      setLogs(res.data);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRegistrations();
    fetchLogs();
  }, [fetchStats, fetchRegistrations, fetchLogs]);

  function refreshAll() {
    fetchStats();
    fetchRegistrations();
    fetchLogs();
  }

  async function handleApprove(id) {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.patch(`/admin/registrations/${id}/approve`);
      setSelected((s) => (s && s._id === id ? res.data.registration : s));
      refreshAll();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(id) {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.patch(`/admin/registrations/${id}/reject`);
      setSelected((s) => (s && s._id === id ? res.data.registration : s));
      refreshAll();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Permanently delete this rejected registration? This cannot be undone.")) {
      return;
    }
    setActionLoading(true);
    setActionError("");
    try {
      await api.delete(`/admin/registrations/${id}`);
      setSelected((s) => (s && s._id === id ? null : s));
      refreshAll();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete");
    } finally {
      setActionLoading(false);
    }
  }

  function handleLogout() {
    clearAdminSession();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="sticky top-0 z-30 border-b border-gold/20 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="truncate text-base font-black text-gradient-gold sm:text-lg">
              {TOURNAMENT.name}
            </p>
            <p className="text-xs text-white/40">Admin Dashboard</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
            <span className="hidden text-sm text-white/60 sm:inline">
              Hi, {getAdminUsername()}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-full border border-white/20 px-3 py-2 text-xs font-bold hover:border-crimson hover:text-crimson-light sm:px-4 sm:text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-gold-light to-gold text-ink"
                  : "border border-white/20 text-white/60 hover:border-gold"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {actionError && (
          <div className="mt-6 rounded-lg border border-crimson bg-crimson/10 px-4 py-3 text-sm text-crimson-light">
            {actionError}
          </div>
        )}

        <div className="mt-8">
          {activeTab === "overview" && <OverviewPanel stats={stats} loading={statsLoading} />}

          {activeTab === "registrations" && (
            <RegistrationsPanel
              registrations={registrations}
              loading={regsLoading}
              onView={setSelected}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          )}

          {activeTab === "export" && <ExportPanel />}

          {activeTab === "activity" && <ActivityLogPanel logs={logs} loading={logsLoading} />}
        </div>
      </div>

      {selected && (
        <ReviewModal
          registration={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}
