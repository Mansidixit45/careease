// frontend/src/pages/admin/AdminPanel.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/stats");
      setStats(res.data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = [
    { label: "Total Users",          value: stats?.totalUsers,          icon: "👥", color: "#3b82f6" },
    { label: "Doctors",              value: stats?.totalDoctors,        icon: "👨‍⚕️", color: "#14b8a6" },
    { label: "Patients",             value: stats?.totalPatients,       icon: "🧑",  color: "#8b5cf6" },
    { label: "Appointments",         value: stats?.totalAppointments,   icon: "📅", color: "#6366f1" },
    { label: "Pending Doctors",      value: stats?.pendingDoctors,      icon: "⏳", color: "#f59e0b" },
    { label: "Pending Appointments", value: stats?.pendingAppointments, icon: "🔔", color: "#f97316" },
  ];

  const quickActions = [
    { icon: "👨‍⚕️", label: "Manage Doctors",      sub: "Approve / reject doctor accounts",    badge: stats?.pendingDoctors > 0 ? `${stats.pendingDoctors} pending` : null,      badgeColor: "#f59e0b", bg: "#f0fdfa", border: "#99f6e4", color: "#0f766e", path: "/admin/doctors" },
    { icon: "📅", label: "Manage Appointments", sub: "View and oversee all appointments",   badge: stats?.pendingAppointments > 0 ? `${stats.pendingAppointments} pending` : null, badgeColor: "#f97316", bg: "#eef2ff", border: "#c7d2fe", color: "#4338ca", path: "/admin/appointments" },
    { icon: "👥", label: "Manage Users",        sub: "View all registered users",           badge: null, bg: "#f5f3ff", border: "#ddd6fe", color: "#6d28d9", path: "/admin/users" },
    { icon: "🔔", label: "Notifications",       sub: "System notifications",                badge: null, bg: "#fffbeb", border: "#fde68a", color: "#92400e", path: "/notifications" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(to right, #334155, #1e293b, #111827)", color: "white", padding: "32px 40px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "4px" }}>🛡️ Admin Panel</p>
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>Welcome, {user?.name || "Admin"}</h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>CareEase ka poora control yahan hai</p>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 40px" }}>

        {/* Pending Alert */}
        {stats?.pendingDoctors > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "16px", padding: "16px 20px", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>⚠️</span>
              <div>
                <p style={{ fontWeight: "600", color: "#92400e" }}>{stats.pendingDoctors} doctor{stats.pendingDoctors > 1 ? "s" : ""} approval pending</p>
                <p style={{ color: "#b45309", fontSize: "12px" }}>Doctors approve karo taaki wo login kar sakein</p>
              </div>
            </div>
            <button onClick={() => navigate("/admin/doctors")} style={{ background: "#f59e0b", color: "white", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
              Review Now
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "#9ca3af", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>Platform Overview</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {statCards.map((s) => (
              <div key={s.label} style={{ background: s.color, borderRadius: "16px", padding: "20px", color: "white" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>{s.icon}</div>
                <div style={{ fontSize: "36px", fontWeight: "800" }}>
                  {loading ? "..." : (s.value ?? 0)}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "#9ca3af", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>Quick Actions</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            {quickActions.map((q) => (
              <button key={q.label} onClick={() => navigate(q.path)} style={{ background: q.bg, border: `1px solid ${q.border}`, borderRadius: "16px", padding: "20px", textAlign: "left", cursor: "pointer", transition: "transform 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "24px" }}>{q.icon}</span>
                  {q.badge && (
                    <span style={{ background: q.badgeColor, color: "white", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "999px" }}>
                      {q.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: "700", color: q.color, marginTop: "12px", fontSize: "15px" }}>{q.label}</div>
                <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>{q.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
