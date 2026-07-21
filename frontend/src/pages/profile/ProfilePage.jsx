// frontend/src/pages/profile/ProfilePage.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // Doctor form
  const [doctorForm, setDoctorForm] = useState({
    specialization: "",
    experience: "",
    fees: "",
    phone: "",
  });

  // Patient form
  const [patientForm, setPatientForm] = useState({
    age: "",
    gender: "",
    blood_group: "",
    medical_history: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchProfile();
  }, );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (user.role === "doctor") {
        const res = await axios.get("/doctors/profile/me");
        setProfile(res.data.doctor);
        setDoctorForm({
          specialization: res.data.doctor.specialization || "",
          experience: res.data.doctor.experience || "",
          fees: res.data.doctor.fees || "",
          phone: res.data.doctor.phone || "",
        });
      } else if (user.role === "patient") {
        const res = await axios.get("/doctors/patient/me");
        setProfile(res.data.patient);
        setPatientForm({
          age: res.data.patient.age || "",
          gender: res.data.patient.gender || "",
          blood_group: res.data.patient.blood_group || "",
          medical_history: res.data.patient.medical_history || "",
          phone: res.data.patient.phone || "",
          address: res.data.patient.address || "",
        });
      }
    } catch (err) {
      toast.error("Profile load nahi hua.");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (e) => {
    setDoctorForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePatientChange = (e) => {
    setPatientForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDoctorSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.put("/doctors/profile/update", doctorForm);
      toast.success("Profile update ho gaya! ✅");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  const handlePatientSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.put("/doctors/patient/update", patientForm);
      toast.success("Profile update ho gaya! ✅");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">👤 My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Apni details update karo</p>
      </div>

      {/* Avatar Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-blue-600 text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
            user?.role === "doctor" ? "bg-blue-100 text-blue-700" :
            user?.role === "patient" ? "bg-purple-100 text-purple-700" :
            "bg-red-100 text-red-700"
          }`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Doctor Form */}
      {user.role === "doctor" && (
        <form onSubmit={handleDoctorSave} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="font-bold text-gray-800 text-lg mb-2">Professional Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization</label>
            <select
              name="specialization"
              value={doctorForm.specialization}
              onChange={handleDoctorChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select specialization</option>
              <option>General Physician</option>
              <option>Cardiologist</option>
              <option>Dermatologist</option>
              <option>Neurologist</option>
              <option>Orthopedist</option>
              <option>Pediatrician</option>
              <option>Psychiatrist</option>
              <option>Gynecologist</option>
              <option>ENT Specialist</option>
              <option>Ophthalmologist</option>
              <option>Dentist</option>
              <option>Diabetologist</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience (Years)</label>
            <input
              type="number"
              name="experience"
              value={doctorForm.experience}
              onChange={handleDoctorChange}
              placeholder="e.g. 5"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Consultation Fees (₹)</label>
            <input
              type="number"
              name="fees"
              value={doctorForm.fees}
              onChange={handleDoctorChange}
              placeholder="e.g. 500"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={doctorForm.phone}
              onChange={handleDoctorChange}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
        </form>
      )}

      {/* Patient Form */}
      {user.role === "patient" && (
        <form onSubmit={handlePatientSave} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="font-bold text-gray-800 text-lg mb-2">Personal Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
              <input
                type="number"
                name="age"
                value={patientForm.age}
                onChange={handlePatientChange}
                placeholder="e.g. 25"
                min="0"
                max="120"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <select
                name="gender"
                value={patientForm.gender}
                onChange={handlePatientChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
            <select
              name="blood_group"
              value={patientForm.blood_group}
              onChange={handlePatientChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select blood group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={patientForm.phone}
              onChange={handlePatientChange}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input
              type="text"
              name="address"
              value={patientForm.address}
              onChange={handlePatientChange}
              placeholder="Apna address likho"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Medical History</label>
            <textarea
              name="medical_history"
              value={patientForm.medical_history}
              onChange={handlePatientChange}
              placeholder="Koi purani bimari, allergy, ya medicines..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
