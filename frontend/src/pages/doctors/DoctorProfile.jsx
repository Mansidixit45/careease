// frontend/src/pages/doctors/DoctorProfile.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        // ✅ Fixed endpoint
        const res = await axios.get(`/doctors/${id}`);
        setDoctor(res.data.doctor);
      } catch (err) {
        setError("Doctor profile load nahi hua. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Profile load ho raha hai...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            ⚠️ {error || "Doctor nahi mila"}
          </p>
          <button
            onClick={() => navigate("/doctors")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/doctors")}
        className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-6 hover:underline"
      >
        ← Back to Doctors
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-blue-600 text-3xl font-bold">
              {doctor.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {doctor.name}
            </h1>
            <p className="text-blue-600 font-medium text-sm mt-1">
              {doctor.specialization || "General Physician"}
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              ✅ Verified Doctor
            </span>
          </div>
        </div>

        <hr className="border-gray-100 mb-5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Experience</p>
            <p className="text-gray-800 font-semibold text-lg">{doctor.experience || "N/A"} Years</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Consultation Fees</p>
            <p className="text-gray-800 font-semibold text-lg">₹{doctor.fees || "N/A"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Specialization</p>
            <p className="text-gray-800 font-semibold">{doctor.specialization || "General Physician"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Contact</p>
            <p className="text-gray-800 font-semibold">{doctor.phone || "N/A"}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Email</p>
          <p className="text-gray-800 font-semibold">{doctor.email || "N/A"}</p>
        </div>

        {/* ✅ Fixed: doctor.id instead of doctor.user_id */}
        <button
          onClick={() => navigate(`/book-appointment/${doctor.id}`)}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-base"
        >
          Book Appointment
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-blue-700 text-sm font-medium mb-1">📋 Appointment ke baare mein</p>
        <ul className="text-blue-600 text-xs space-y-1 list-disc list-inside">
          <li>Video, Audio ya Chat consultation available hai</li>
          <li>Doctor appointment confirm karega</li>
          <li>Confirmation ke baad consultation join kar sakte ho</li>
        </ul>
      </div>
    </div>
  );
};

export default DoctorProfile;
