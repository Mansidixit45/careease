// frontend/src/pages/admin/ManageUsers.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import { FiSearch, FiX } from "react-icons/fi";

const roleConfig = {
  doctor:  { color: "bg-teal-100 text-teal-700",   icon: "👨‍⚕️", grad: "from-teal-400 to-teal-600" },
  patient: { color: "bg-blue-100 text-blue-700",   icon: "🧑",   grad: "from-blue-400 to-blue-600" },
  admin:   { color: "bg-red-100 text-red-700",     icon: "🛡️",  grad: "from-red-400 to-red-600" },
};

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/users");
      setUsers(res.data || []);
    } catch { toast.error("Users load nahi hue."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users
    .filter((u) => filter === "all" || u.role === filter)
    .filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    all: users.length,
    doctor:  users.filter((u) => u.role === "doctor").length,
    patient: users.filter((u) => u.role === "patient").length,
    admin:   users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-8 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">←</button>
          <div>
            <p className="text-slate-400 text-sm mb-0.5">Admin Panel</p>
            <h1 className="text-2xl font-bold">👥 Manage Users</h1>
            <p className="text-slate-400 text-sm mt-0.5">{users.length} registered users</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-5">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Name ya email se search karo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["all","doctor","patient","admin"].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filter === tab ? "bg-slate-700 text-white shadow" : "bg-white text-gray-500 border border-gray-200 hover:border-slate-400"
              }`}>
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Doctors",  count: counts.doctor,  grad: "from-teal-500 to-teal-600",  icon: "👨‍⚕️" },
            { label: "Patients", count: counts.patient, grad: "from-blue-500 to-blue-600",   icon: "🧑" },
            { label: "Admins",   count: counts.admin,   grad: "from-slate-600 to-slate-700", icon: "🛡️" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.grad} rounded-2xl p-4 text-white shadow-sm`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-2xl font-extrabold">{s.count}</div>
              <div className="text-xs opacity-75">{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500">Koi user nahi mila</p>
            {search && <button onClick={() => setSearch("")} className="mt-2 text-blue-600 text-sm hover:underline">Clear search</button>}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((u) => {
              const rc = roleConfig[u.role] || { color: "bg-gray-100 text-gray-600", icon: "👤", grad: "from-gray-400 to-gray-500" };
              const initial = (u.name || "?").charAt(0).toUpperCase();
              return (
                <div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${rc.grad} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                      <span className="text-white font-bold text-sm">{initial}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${rc.color}`}>
                    {rc.icon} {u.role}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
