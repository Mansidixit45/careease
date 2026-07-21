// frontend/src/pages/appointments/BookAppointment.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import toast from "react-hot-toast";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    appointment_date: "",
    appointment_time: "",
    symptoms: "",
  });

  // ✅ Fixed endpoint
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/doctors/${doctorId}`);
        setDoctor(res.data.doctor);
      } catch (err) {
        setError("Doctor details load nahi hue.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getMinDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.appointment_date || !formData.appointment_time) {
      toast.error("Date aur time dono zaroori hain!");
      return;
    }

    try {
      setSubmitting(true);
      // ✅ Fixed: sirf DB wale columns bhej rahe hain
      await axios.post("/appointment/book", {
        doctor_id: doctorId,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        symptoms: formData.symptoms,
      });
      toast.success("Appointment book ho gaya! ✅");
      navigate("/appointments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Appointment book nahi hua. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Load ho raha hai...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">⚠️ {error}</p>
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/doctors/${doctorId}`)}
        className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-6 hover:underline"
      >
        ← Back to Profile
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Book Appointment</h1>

      {/* Doctor Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-200 rounded-full flex items-center justify-center shrink-0">
          <span className="text-blue-700 text-xl font-bold">
            {doctor.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold text-gray-800">{doctor.name}</p>
          <p className="text-blue-600 text-sm">{doctor.specialization || "General Physician"}</p>
          <p className="text-gray-500 text-xs mt-1">
            💰 ₹{doctor.fees} • 🎓 {doctor.experience} years exp
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📅 Appointment Date *
          </label>
          <input
            type="date"
            name="appointment_date"
            value={formData.appointment_date}
            onChange={handleChange}
            min={getMinDate()}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🕐 Appointment Time *
          </label>
          <input
            type="time"
            name="appointment_time"
            value={formData.appointment_time}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🤒 Symptoms (Optional)
          </label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            placeholder="Kya takleef hai? Doctor ko batao..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Booking Summary
          </p>
          <div className="space-y-1 text-sm text-gray-600">
            <p>👨‍⚕️ Doctor: {doctor.name}</p>
            <p>📅 Date: {formData.appointment_date || "Not selected"}</p>
            <p>🕐 Time: {formData.appointment_time || "Not selected"}</p>
            <p className="font-semibold text-gray-800 pt-1">💰 Fees: ₹{doctor.fees}</p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Booking ho raha hai..." : "✅ Confirm Booking"}
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
