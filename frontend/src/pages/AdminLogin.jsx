import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../api/client";
import { setAdminSession, isAdminLoggedIn } from "../utils/auth";
import { TOURNAMENT } from "../data/tournament";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      setAdminSession(res.data.token, res.data.username);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-gold/30 bg-charcoal p-6 shadow-xl shadow-black/40 sm:p-8">
        <h1 className="text-center text-2xl font-black text-gradient-gold">Admin Login</h1>
        <p className="mt-1 text-center text-xs text-white/40">{TOURNAMENT.name}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-white/80">Username</label>
            <input
              className="w-full rounded-lg border border-gold/20 bg-ink px-4 py-2.5 text-white outline-none focus:border-gold"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-white/80">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gold/20 bg-ink px-4 py-2.5 text-white outline-none focus:border-gold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-crimson-light">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-gold-light to-gold py-3 font-bold text-ink transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
