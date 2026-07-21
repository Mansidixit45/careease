// frontend/src/pages/appointments/AppointmentCard.jsx

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-600",
};

const statusLabels = {
  pending: "⏳ Pending",
  confirmed: "✅ Confirmed",
  cancelled: "❌ Cancelled",
  completed: "🏁 Completed",
};

const AppointmentCard = ({ appointment, onCancel }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const canJoin = appointment.status === "confirmed";
  const canCancel =
    appointment.status === "pending" || appointment.status === "confirmed";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      {/* Top Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-blue-600 text-lg font-bold">
              {user.role === "patient"
                ? appointment.doctor_name?.charAt(0).toUpperCase()
                : appointment.patient_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            {user.role === "patient" ? (
              <>
                <p className="font-semibold text-gray-800 text-sm">
                  Dr. {appointment.doctor_name}
                </p>
                <p className="text-blue-600 text-xs">
                  {appointment.specialization || "General Physician"}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-800 text-sm">
                  {appointment.patient_name}
                </p>
                <p className="text-gray-500 text-xs">Patient</p>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusStyles[appointment.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {statusLabels[appointment.status] || appointment.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>📅</span>
          <span>{appointment.appointment_date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>🕐</span>
          <span>{appointment.appointment_time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>
            {appointment.consultation_type === "video"
              ? "🎥"
              : appointment.consultation_type === "audio"
                ? "📞"
                : "💬"}
          </span>
          <span className="capitalize">
            {appointment.consultation_type} Consultation
          </span>
        </div>
        {appointment.fees && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>💰</span>
            <span>₹{appointment.fees}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Join Button — Sirf confirmed appointments ke liye */}
        {canJoin && (
          <button
            onClick={() =>
              navigate(
                `/consultation/${appointment.consultation_type}/${appointment.id}`,
              )
            }
            className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Join Now
          </button>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <button
            onClick={() => onCancel(appointment.id)}
            className="flex-1 py-2 border border-red-400 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        )}

        {/* Doctor — Confirm Button */}
        {user.role === "doctor" && appointment.status === "pending" && (
          <button
            onClick={() => navigate(`/appointments`)}
            className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
