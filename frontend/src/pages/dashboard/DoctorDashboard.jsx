import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// ✅ Date & Time format helpers
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "N/A";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours);
  return `${h % 12 || 12}:${minutes} ${h >= 12 ? "PM" : "AM"}`;
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/appointment/doctor");
      const data = res.data.appointments || [];
      setAppointments(data);
      setStats({
        total:     data.length,
        pending:   data.filter((a) => a.status === "pending").length,
        confirmed: data.filter((a) => a.status === "confirmed").length,
        completed: data.filter((a) => a.status === "completed").length,
        cancelled: data.filter((a) => a.status === "cancelled").length,
      });
    } catch {
      toast.error("Appointments load nahi hue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleConfirm = async (id) => {
    try {
      await axios.put(`/appointment/confirm/${id}`);
      toast.success("Appointment confirm ho gaya! ✅");
      fetchAppointments();
    } catch (err) { toast.error(err.response?.data?.message || "Confirm nahi hua."); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel karna chahte ho?")) return;
    try {
      await axios.put(`/appointment/cancel/${id}`);
      toast.success("Appointment cancel ho gaya!");
      fetchAppointments();
    } catch (err) { toast.error(err.response?.data?.message || "Cancel nahi hua."); }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`/appointment/complete/${id}`);
      toast.success("Appointment complete ho gaya! 🏁");
      fetchAppointments();
    } catch (err) { toast.error(err.response?.data?.message || "Complete nahi hua."); }
  };

  const filtered = activeTab === "all" ? appointments : appointments.filter((a) => a.status === activeTab);

  const statusStyles = {
    pending:   "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-gray-100 text-gray-600",
  };

  const statusLabels = {
    pending: "⏳ Pending", confirmed: "✅ Confirmed",
    cancelled: "❌ Cancelled", completed: "🏁 Completed",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Dashboard load ho raha hai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Welcome Header */}
      <div className="mb-8">
        {/* ✅ Double "Dr." fix */}
        <h1 className="text-2xl font-bold text-gray-800">👨‍⚕️ Welcome, {user?.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Aapke appointments aur patients yahan manage karo</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total",     value: stats.total,     color: "text-blue-600" },
          { label: "Pending",   value: stats.pending,   color: "text-yellow-500" },
          { label: "Confirmed", value: stats.confirmed, color: "text-green-500" },
          { label: "Completed", value: stats.completed, color: "text-gray-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Alert */}
      {stats.pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="text-yellow-800 font-semibold text-sm">
                {stats.pending} appointment{stats.pending !== 1 ? "s" : ""} pending approval
              </p>
              <p className="text-yellow-600 text-xs">Jaldi confirm karo</p>
            </div>
          </div>
          <button onClick={() => setActiveTab("pending")}
            className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors">
            Review
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: "📋", label: "All Appointments", sub: "Saare appointments dekho", action: () => setActiveTab("all") },
          { icon: "🔔", label: "Notifications",    sub: "Latest updates dekho",     action: () => navigate("/notifications") },
          { icon: "🎯", label: "Confirmed",        sub: "Confirmed appointments",   action: () => setActiveTab("confirmed") },
        ].map((q) => (
          <button key={q.label} onClick={q.action}
            className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 text-left hover:shadow-md transition-shadow">
            <p className="text-2xl mb-2">{q.icon}</p>
            <p className="font-semibold text-gray-800 text-sm">{q.label}</p>
            <p className="text-gray-400 text-xs mt-1">{q.sub}</p>
          </button>
        ))}
      </div>

      {/* Appointments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Appointments</h2>
          <button onClick={() => setActiveTab("all")} className="text-blue-600 text-sm hover:underline">View All →</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {[
            { key: "pending",   label: "Pending",   count: stats.pending },
            { key: "confirmed", label: "Confirmed", count: stats.confirmed },
            { key: "completed", label: "Completed", count: stats.completed },
            { key: "cancelled", label: "Cancelled", count: stats.cancelled },
            { key: "all",       label: "All",       count: stats.total },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500">Koi appointment nahi hai</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((apt) => (
              <div key={apt.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-blue-600 font-bold text-sm">
                        {apt.patient_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{apt.patient_name}</p>
                      <p className="text-gray-400 text-xs">{apt.patient_phone || "Patient"}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[apt.status] || "bg-gray-100 text-gray-600"}`}>
                    {statusLabels[apt.status] || apt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* ✅ Formatted date & time */}
                  <p className="text-xs text-gray-500">📅 {formatDate(apt.appointment_date)}</p>
                  <p className="text-xs text-gray-500">🕐 {formatTime(apt.appointment_time)}</p>
                  <p className="text-xs text-gray-500">💬 Online Consultation</p>
                  {apt.fees && <p className="text-xs text-gray-500">💰 ₹{apt.fees}</p>}
                </div>

                {apt.symptoms && (
                  <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs text-gray-500">🤒 {apt.symptoms}</p>
                  </div>
                )}
                {apt.notes && (
                  <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs text-gray-500">📝 {apt.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {apt.status === "pending" && (
                    <button onClick={() => handleConfirm(apt.id)}
                      className="flex-1 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      ✅ Confirm
                    </button>
                  )}
                  {apt.status === "confirmed" && (
                    <button onClick={() => handleComplete(apt.id)}
                      className="flex-1 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                      🏁 Mark Complete
                    </button>
                  )}
                  {(apt.status === "pending" || apt.status === "confirmed") && (
                    <button onClick={() => handleCancel(apt.id)}
                      className="flex-1 py-2 border border-red-400 text-red-500 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors">
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
