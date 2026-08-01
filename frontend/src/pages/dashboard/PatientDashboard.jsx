import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import {
  FiCalendar, FiUser, FiMessageCircle,
  FiClock, FiCheckCircle, FiXCircle, FiArrowRight,
} from "react-icons/fi";

// ✅ Date format helper
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

// ✅ Time format helper
const formatTime = (timeStr) => {
  if (!timeStr) return "N/A";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours);
  return `${h % 12 || 12}:${minutes} ${h >= 12 ? "PM" : "AM"}`;
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // ✅ Fix 1: Correct endpoint
      const res = await API.get("/appointment/patient");
      const appointments = res.data?.appointments || [];

      setStats({
        total: appointments.length,
        pending: appointments.filter((a) => a.status === "pending").length,
        confirmed: appointments.filter((a) => a.status === "confirmed").length,
        completed: appointments.filter((a) => a.status === "completed").length,
        cancelled: appointments.filter((a) => a.status === "cancelled").length,
      });
      setRecentAppointments(appointments.slice(0, 5));
    } catch (err) {
      console.error("Dashboard data error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-600",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{maxWidth:"900px", margin:"0 auto", padding:"24px 40px"}}>

      {/* Welcome Banner */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-blue-100 text-sm">
          Manage your appointments and consultations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: stats.total,     color: "blue",   icon: <FiCalendar /> },
          { label: "Pending",   value: stats.pending,   color: "yellow", icon: <FiClock /> },
          { label: "Confirmed", value: stats.confirmed, color: "green",  icon: <FiCheckCircle /> },
          { label: "Cancelled", value: stats.cancelled, color: "red",    icon: <FiXCircle /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-${stat.color}-600 bg-${stat.color}-50`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/doctors" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-3">
                <FiUser size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Find Doctors</h3>
              <p className="text-sm text-gray-500 mt-0.5">Browse specialists</p>
            </div>
            <FiArrowRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>

        <Link to="/appointments" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-3">
                <FiCalendar size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">My Appointments</h3>
              <p className="text-sm text-gray-500 mt-0.5">View all bookings</p>
            </div>
            <FiArrowRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>

        <Link to="/chatbot" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-3">
                <FiMessageCircle size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Sehat Saathi</h3>
              <p className="text-sm text-gray-500 mt-0.5">AI health assistant</p>
            </div>
            <FiArrowRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
          <Link to="/appointments" className="text-sm text-blue-600 hover:underline font-medium">
            View all →
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No appointments yet</p>
            <p className="text-gray-400 text-sm mt-1">Book your first appointment</p>
            <Link to="/doctors" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              Find a Doctor
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {apt.doctor_name?.charAt(0) || "D"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Dr. {apt.doctor_name || "Doctor"}
                    </p>
                    {/* ✅ Fix 2: Correct column names */}
                    <p className="text-xs text-gray-500">
                      {formatDate(apt.appointment_date)} • {formatTime(apt.appointment_time)} • {apt.specialization || "Consultation"}
                    </p>
                  </div>
                </div>
                {getStatusBadge(apt.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
