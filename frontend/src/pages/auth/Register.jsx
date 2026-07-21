// frontend/src/pages/auth/Register.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "patient", specialization: "", experience: "", fees: "", phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateStep1 = () => {
    if (!formData.name.trim()) { toast.error("Name required!"); return false; }
    if (!formData.email.trim()) { toast.error("Email required!"); return false; }
    if (formData.password.length < 6) { toast.error("Password minimum 6 characters!"); return false; }
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords don't match!"); return false; }
    return true;
  };

  const handleNext = () => {
    if (!validateStep1()) return;
    if (formData.role === "doctor") setStep(2);
    else handleSubmit();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (formData.role === "doctor" && (!formData.specialization || !formData.experience || !formData.fees || !formData.phone)) {
      toast.error("Saari doctor details bharo!"); return;
    }
    setLoading(true);
    try {
      await API.post("/auth/register", { name: formData.name, email: formData.email, password: formData.password, role: formData.role });
      toast.success("Registration successful! 🎉");
      if (formData.role === "doctor") toast("Pending admin approval ⏳");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full opacity-10 translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-300 rounded-full opacity-5"></div>

      <div className="w-full max-w-lg relative z-10">

        {/* Top Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-xs font-medium mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Join 1000+ users on CareEase
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-blue-600 text-lg font-bold">C</span>
            </div>
            <h1 className="text-3xl font-bold text-white">CareEase</h1>
          </div>
          <p className="text-blue-300 text-sm">Apna healthcare journey shuru karo</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">

          {/* Role Selector */}
          {step === 1 && (
            <div className="flex gap-3 mb-6 p-1 bg-white/10 rounded-2xl">
              {[
                { value: "patient", label: "Patient", icon: "🧑" },
                { value: "doctor", label: "Doctor", icon: "👨‍⚕️" },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: r.value }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    formData.role === r.value
                      ? "bg-white text-blue-600 shadow-lg"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Step indicator for doctor */}
          {formData.role === "doctor" && (
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-blue-400" : "bg-white/20"}`} />
              <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-blue-400" : "bg-white/20"}`} />
              <span className="text-white/50 text-xs">{step}/2</span>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="👤 Full Name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="📧 Email Address"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="🔒 Password (min. 6 chars)"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="🔒 Confirm Password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all disabled:opacity-60 text-sm shadow-lg shadow-blue-500/30 mt-2"
              >
                {formData.role === "doctor" ? "Next Step →" : loading ? "Creating Account..." : "Create Account 🚀"}
              </button>

              <p className="text-center text-white/50 text-xs">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-300 font-bold hover:text-blue-200">Login karo</Link>
              </p>
            </div>
          )}

          {/* STEP 2 — Doctor */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-3 mb-4">
                <p className="text-blue-200 text-xs">👨‍⚕️ Professional details — Admin approval ke baad login kar sakte ho</p>
              </div>

              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="" className="text-gray-800">🏥 Select Specialization</option>
                {["General Physician","Cardiologist","Dermatologist","Neurologist","Orthopedist","Pediatrician","Psychiatrist","Gynecologist","ENT Specialist","Ophthalmologist","Dentist","Diabetologist"].map(s => (
                  <option key={s} value={s} className="text-gray-800">{s}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="🎓 Experience (yrs)"
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  placeholder="💰 Fees (₹)"
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="📞 Phone Number"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-white/30 text-white/70 font-bold rounded-xl hover:bg-white/10 transition-all text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all disabled:opacity-60 text-sm shadow-lg shadow-blue-500/30"
                >
                  {loading ? "Registering..." : "Register →"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Bottom features */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: "🔒", text: "Secure" },
            { icon: "⚡", text: "Fast Setup" },
            { icon: "🆓", text: "Free Forever" },
          ].map((item) => (
            <div key={item.text} className="bg-white/5 border border-white/10 rounded-xl py-3 text-center">
              <p className="text-lg mb-1">{item.icon}</p>
              <p className="text-white/60 text-xs font-medium">{item.text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Register;
