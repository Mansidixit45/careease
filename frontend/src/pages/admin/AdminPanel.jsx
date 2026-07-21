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
    { label: "Total Users",          value: stats?.totalUsers,          icon: "👥", grad: "from-blue-500 to-blue-600" },
    { label: "Doctors",              value: stats?.totalDoctors,        icon: "👨‍⚕️", grad: "from-teal-500 to-teal-600" },
    { label: "Patients",             value: stats?.totalPatients,       icon: "🧑", grad: "from-violet-500 to-violet-600" },
    { label: "Appointments",         value: stats?.totalAppointments,   icon: "📅", grad: "from-indigo-500 to-indigo-600" },
    { label: "Pending Doctors",      value: stats?.pendingDoctors,      icon: "⏳", grad: "from-amber-500 to-amber-600" },
    { label: "Pending Appointments", value: stats?.pendingAppointments, icon: "🔔", grad: "from-orange-500 to-orange-600" },
  ];

  const quickActions = [
    {
      icon: "👨‍⚕️",
      label: "Manage Doctors",
      sub: "Approve / reject doctor accounts",
      badge: stats?.pendingDoctors > 0 ? `${stats.pendingDoctors} pending` : null,
      badgeColor: "bg-amber-100 text-amber-700",
      path: "/admin/doctors",
      grad: "from-teal-50 to-teal-100",
      border: "border-teal-200",
      text: "text-teal-700",
    },
    {
      icon: "📅",
      label: "Manage Appointments",
      sub: "View and oversee all appointments",
      badge: stats?.pendingAppointments > 0 ? `${stats.pendingAppointments} pending` : null,
      badgeColor: "bg-orange-100 text-orange-700",
      path: "/admin/appointments",
      grad: "from-indigo-50 to-indigo-100",
      border: "border-indigo-200",
      text: "text-indigo-700",
    },
    {
      icon: "👥",
      label: "Manage Users",
      sub: "View all registered users",
      badge: null,
      path: "/admin/users",
      grad: "from-violet-50 to-violet-100",
      border: "border-violet-200",
      text: "text-violet-700",
    },
    {
      icon: "🔔",
      label: "Notifications",
      sub: "System notifications",
      badge: null,
      path: "/notifications",
      grad: "from-amber-50 to-amber-100",
      border: "border-amber-200",
      text: "text-amber-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-gray-900 text-white px-6 py-8 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <p className="text-slate-400 text-sm font-medium mb-1">🛡️ Admin Panel</p>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name || "Admin"}</h1>
          <p className="text-slate-400 mt-1 text-sm">CareEase ka poora control yahan hai</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Pending Alert */}
        {stats?.pendingDoctors > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800">{stats.pendingDoctors} doctor{stats.pendingDoctors > 1 ? "s" : ""} approval pending</p>
                <p className="text-amber-600 text-xs mt-0.5">Doctors approve karo taaki wo login kar sakein</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/doctors")}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Review Now
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Platform Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className={`bg-gradient-to-br ${s.grad} rounded-2xl p-5 text-white shadow-md`}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-4xl font-extrabold">
                  {loading ? <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : (s.value ?? 0)}
                </div>
                <div className="text-xs font-medium opacity-75 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((q) => (
              <button
                key={q.label}
                onClick={() => navigate(q.path)}
                className={`bg-gradient-to-br ${q.grad} border ${q.border} rounded-2xl p-5 text-left hover:scale-[1.02] transition-transform shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-2xl">{q.icon}</div>
                  {q.badge && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.badgeColor}`}>
                      {q.badge}
                    </span>
                  )}
                </div>
                <div className={`font-bold mt-3 ${q.text}`}>{q.label}</div>
                <div className="text-gray-500 text-xs mt-0.5">{q.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
