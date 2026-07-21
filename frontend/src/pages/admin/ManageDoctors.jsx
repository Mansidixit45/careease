// frontend/src/pages/admin/ManageDoctors.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import toast from "react-hot-toast";

const avatarColors = ["from-blue-400 to-blue-600","from-teal-400 to-teal-600","from-violet-400 to-violet-600","from-emerald-400 to-emerald-600","from-indigo-400 to-indigo-600"];

const ManageDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/doctors");
      setDoctors(res.data || []);
    } catch { toast.error("Doctors load nahi hue."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleApproval = async (doctorId, approve) => {
    try {
      setActionLoading(doctorId);
      await axios.put(`/admin/doctors/${doctorId}/approve`, { is_approved: approve ? 1 : 0 });
      toast.success(approve ? "Doctor approved! ✅" : "Doctor revoked!");
      fetchDoctors();
    } catch { toast.error("Action failed."); }
    finally { setActionLoading(null); }
  };

  const filtered = filter === "pending" ? doctors.filter((d) => d.is_approved === 0)
    : filter === "approved" ? doctors.filter((d) => d.is_approved === 1)
    : doctors;

  const pendingCount = doctors.filter((d) => d.is_approved === 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-8 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            ← 
          </button>
          <div>
            <p className="text-slate-400 text-sm mb-0.5">Admin Panel</p>
            <h1 className="text-2xl font-bold">👨‍⚕️ Manage Doctors</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Pending Alert */}
        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <p className="text-amber-800 font-semibold">{pendingCount} doctor{pendingCount > 1 ? "s" : ""} awaiting approval</p>
            <button onClick={() => setFilter("pending")} className="ml-auto text-xs bg-amber-500 text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-amber-600 transition-colors">
              Review
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "all", label: "All", count: doctors.length },
            { key: "pending", label: "Pending", count: doctors.filter((d) => d.is_approved === 0).length },
            { key: "approved", label: "Approved", count: doctors.filter((d) => d.is_approved === 1).length },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === tab.key ? "bg-slate-700 text-white shadow" : "bg-white text-gray-500 border border-gray-200 hover:border-slate-400"
              }`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
            <div className="text-5xl mb-3">👨‍⚕️</div>
            <p className="text-gray-500">Koi doctor nahi hai</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doctor) => {
              const cleanName = (doctor.name || "").replace(/^Dr\.?\s*/i, "");
              const grad = avatarColors[(cleanName.charCodeAt(0) || 0) % avatarColors.length];
              return (
                <div key={doctor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${grad} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
                        <span className="text-white font-bold text-lg">{cleanName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Dr. {cleanName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{doctor.email}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {doctor.specialization && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{doctor.specialization}</span>
                          )}
                          {doctor.experience > 0 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{doctor.experience} yr exp</span>
                          )}
                          {doctor.fees > 0 && (
                            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">₹{doctor.fees}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doctor.is_approved === 1 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {doctor.is_approved === 1 ? "✅ Approved" : "⏳ Pending"}
                      </span>
                      {doctor.is_approved === 0 ? (
                        <button
                          onClick={() => handleApproval(doctor.id, true)}
                          disabled={actionLoading === doctor.id}
                          className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === doctor.id ? "..." : "Approve"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproval(doctor.id, false)}
                          disabled={actionLoading === doctor.id}
                          className="px-4 py-1.5 border border-red-200 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === doctor.id ? "..." : "Revoke"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDoctors;
