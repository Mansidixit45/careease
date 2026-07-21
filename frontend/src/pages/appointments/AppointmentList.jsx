// frontend/src/pages/appointments/AppointmentList.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
const formatTime = (timeStr) => {
  if (!timeStr) return "N/A";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours);
  return `${h % 12 || 12}:${minutes} ${h >= 12 ? "PM" : "AM"}`;
};

const statusConfig = {
  pending:   { color: "bg-amber-100 text-amber-700 border border-amber-200",     dot: "bg-amber-400",   label: "Pending"   },
  confirmed: { color: "bg-emerald-100 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500", label: "Confirmed" },
  cancelled: { color: "bg-red-100 text-red-600 border border-red-200",            dot: "bg-red-400",     label: "Cancelled" },
  completed: { color: "bg-blue-100 text-blue-700 border border-blue-200",         dot: "bg-blue-500",    label: "Completed" },
};

const tabs = ["all", "pending", "confirmed", "completed", "cancelled"];

const AppointmentList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = user.role === "doctor" ? "/appointment/doctor" : "/appointment/patient";
      const res = await axios.get(endpoint);
      setAppointments(res.data.appointments || []);
    } catch {
      setError("Appointments load nahi hue.");
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleAction = async (id, action) => {
    const endpointMap = { cancel: "cancel", confirm: "confirm", complete: "complete" };
    try {
      setActionLoading(id + action);
      await axios.put(`/appointment/${action}/${id}`);
      toast.success(`Appointment ${action}ed!`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = activeTab === "all" ? appointments : appointments.filter((a) => a.status === activeTab);

  const isDoctor = user.role === "doctor";

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className={`bg-gradient-to-r ${isDoctor ? "from-teal-600 to-emerald-700" : "from-blue-600 to-indigo-700"} text-white px-6 py-10`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">{isDoctor ? "Patient Appointments" : "My Appointments"}</h1>
        </div>
      </div>
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${isDoctor ? "from-teal-600 to-emerald-700" : "from-blue-600 to-indigo-700"} text-white px-6 py-10 shadow-lg`}>
        <div className="max-w-4xl mx-auto">
          <p className="text-white/60 text-sm mb-1">{isDoctor ? "👨‍⚕️ Doctor Panel" : "🧑 Patient"}</p>
          <h1 className="text-3xl font-bold tracking-tight">{isDoctor ? "Patient Appointments" : "My Appointments"}</h1>
          <p className="text-white/60 mt-1 text-sm">{appointments.length} total appointments</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const count = tab === "all" ? appointments.length : appointments.filter((a) => a.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? `${isDoctor ? "bg-teal-600" : "bg-blue-600"} text-white shadow`
                    : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300"
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Pending banner for doctor */}
        {isDoctor && activeTab === "pending" && filtered.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
            <span className="text-xl">⏳</span>
            <p className="text-amber-700 text-sm font-medium">{filtered.length} appointment{filtered.length > 1 ? "s" : ""} awaiting your approval</p>
          </div>
        )}

        {/* Empty */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">No {activeTab === "all" ? "" : activeTab} appointments</p>
            {activeTab !== "all" && (
              <button onClick={() => setActiveTab("all")} className="mt-3 text-blue-600 text-sm hover:underline">View all</button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((apt) => {
              const sc = statusConfig[apt.status] || statusConfig.pending;
              const nameRaw = isDoctor ? apt.patient_name : apt.doctor_name;
              const cleanName = (nameRaw || "").replace(/^Dr\.?\s*/i, "");
              const displayName = isDoctor ? cleanName : `Dr. ${cleanName}`;
              const initial = cleanName.charAt(0).toUpperCase();

              return (
                <div key={apt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isDoctor ? "bg-teal-100" : "bg-blue-100"}`}>
                        <span className={`font-bold ${isDoctor ? "text-teal-700" : "text-blue-700"}`}>{initial}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{displayName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isDoctor ? "Patient" : (apt.specialization || "General Physician")}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${sc.color}`}>{sc.label}</span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                      <span>📅</span><span>{formatDate(apt.appointment_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                      <span>🕐</span><span>{formatTime(apt.appointment_time)}</span>
                    </div>
                  </div>

                  {apt.symptoms && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4">
                      <p className="text-xs text-amber-700">🤒 <span className="font-medium">Symptoms:</span> {apt.symptoms}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isDoctor && apt.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(apt.id, "confirm")}
                          disabled={!!actionLoading}
                          className="flex-1 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === apt.id + "confirm" ? "..." : "✓ Confirm"}
                        </button>
                        <button
                          onClick={() => handleAction(apt.id, "cancel")}
                          disabled={!!actionLoading}
                          className="flex-1 py-2 border border-red-200 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === apt.id + "cancel" ? "..." : "✕ Cancel"}
                        </button>
                      </>
                    )}
                    {isDoctor && apt.status === "confirmed" && (
                      <button
                        onClick={() => handleAction(apt.id, "complete")}
                        disabled={!!actionLoading}
                        className="flex-1 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === apt.id + "complete" ? "..." : "🎯 Mark Complete"}
                      </button>
                    )}
                    {!isDoctor && (apt.status === "pending" || apt.status === "confirmed") && (
                      <button
                        onClick={() => handleAction(apt.id, "cancel")}
                        disabled={!!actionLoading}
                        className="flex-1 py-2 border border-red-200 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === apt.id + "cancel" ? "..." : "✕ Cancel"}
                      </button>
                    )}
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

export default AppointmentList;
