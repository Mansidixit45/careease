// frontend/src/pages/admin/ManageAppointments.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import toast from "react-hot-toast";

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A";
const formatTime = (t) => { if (!t) return "N/A"; const [h, m] = t.split(":"); const hh = parseInt(h); return `${hh % 12 || 12}:${m} ${hh >= 12 ? "PM" : "AM"}`; };

const statusConfig = {
  pending:   { color: "bg-amber-100 text-amber-700 border border-amber-200",     label: "Pending"   },
  confirmed: { color: "bg-emerald-100 text-emerald-700 border border-emerald-200", label: "Confirmed" },
  completed: { color: "bg-blue-100 text-blue-700 border border-blue-200",         label: "Completed" },
  cancelled: { color: "bg-red-100 text-red-600 border border-red-200",            label: "Cancelled" },
};

const ManageAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/appointments");
      setAppointments(res.data || []);
    } catch { toast.error("Appointments load nahi hue."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);
  const counts = { all: appointments.length, pending: appointments.filter(a=>a.status==="pending").length, confirmed: appointments.filter(a=>a.status==="confirmed").length, completed: appointments.filter(a=>a.status==="completed").length, cancelled: appointments.filter(a=>a.status==="cancelled").length };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-8 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">←</button>
          <div>
            <p className="text-slate-400 text-sm mb-0.5">Admin Panel</p>
            <h1 className="text-2xl font-bold">📅 Manage Appointments</h1>
            <p className="text-slate-400 text-sm mt-0.5">{appointments.length} total appointments</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {["all","pending","confirmed","completed","cancelled"].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filter === tab ? "bg-slate-700 text-white shadow" : "bg-white text-gray-500 border border-gray-200 hover:border-slate-400"
              }`}>
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
            <div className="text-5xl mb-3">📅</div>
            <p className="text-gray-500">Koi appointment nahi hai</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((apt) => {
              const sc = statusConfig[apt.status] || statusConfig.pending;
              const doctorName = (apt.doctor_name || "").replace(/^Dr\.?\s*/i, "");
              return (
                <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm">{apt.patient_name}</span>
                        <span className="text-gray-300">→</span>
                        <span className="font-bold text-gray-800 text-sm">Dr. {doctorName}</span>
                      </div>
                      {apt.specialization && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mt-1 inline-block font-medium">{apt.specialization}</span>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${sc.color}`}>{sc.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">📅 {formatDate(apt.appointment_date)}</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">🕐 {formatTime(apt.appointment_time)}</span>
                    {apt.symptoms && <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">🤒 {apt.symptoms}</span>}
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

export default ManageAppointments;
