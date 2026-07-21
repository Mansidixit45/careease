// frontend/src/pages/doctors/DoctorCard.jsx
import { useNavigate } from "react-router-dom";

const specColors = {
  "Cardiologist":    "bg-red-100 text-red-700",
  "Dermatologist":   "bg-pink-100 text-pink-700",
  "Neurologist":     "bg-purple-100 text-purple-700",
  "Orthopedic":      "bg-orange-100 text-orange-700",
  "Pediatrician":    "bg-yellow-100 text-yellow-700",
  "Psychiatrist":    "bg-violet-100 text-violet-700",
  "Gynecologist":    "bg-rose-100 text-rose-700",
  "ENT Specialist":  "bg-cyan-100 text-cyan-700",
  "Dentist":         "bg-sky-100 text-sky-700",
  "Ophthalmologist": "bg-indigo-100 text-indigo-700",
  "General Physician": "bg-green-100 text-green-700",
};

const avatarColors = [
  "from-blue-400 to-blue-600",
  "from-teal-400 to-teal-600",
  "from-violet-400 to-violet-600",
  "from-emerald-400 to-emerald-600",
  "from-indigo-400 to-indigo-600",
  "from-amber-400 to-amber-600",
];

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const cleanName = (doctor.name || "").replace(/^Dr\.?\s*/i, "");
  const specClass = specColors[doctor.specialization] || "bg-blue-100 text-blue-700";
  const avatarGrad = avatarColors[(cleanName.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 bg-gradient-to-r ${avatarGrad}`} />

      <div className="p-5">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${avatarGrad} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
            <span className="text-white text-lg font-bold">
              {cleanName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Dr. {cleanName}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${specClass}`}>
              {doctor.specialization || "General Physician"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-base">🎓</span>
            <span>{doctor.experience || "N/A"} yrs experience</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-base">💰</span>
            <span className="font-semibold text-gray-700">₹{doctor.fees || "N/A"}</span>
            <span className="text-gray-400">per consultation</span>
          </div>
          {doctor.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-base">📞</span>
              <span>{doctor.phone}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/doctors/${doctor.id}`)}
            className="flex-1 py-2 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            View Profile
          </button>
          <button
            onClick={() => navigate(`/book-appointment/${doctor.id}`)}
            className="flex-1 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
