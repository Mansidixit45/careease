// frontend/src/pages/auth/Login.jsx

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const getRedirectPath = (role) => {
    if (from) return from;
    if (role === "patient") return "/dashboard";
    if (role === "doctor") return "/doctor/dashboard";
    if (role === "admin") return "/admin";
    return "/";
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Email aur password dono bharo!");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/login", formData);
      const { user, token } = res.data;
      login(user, token);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(getRedirectPath(user.role), { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: "Admin", email: "admin@careease.com", password: "admin123", icon: "🛡️", color: "bg-red-50 border-red-200 text-red-700" },
    { role: "Doctor", email: "rahul.sharma@careease.com", password: "password123", icon: "👨‍⚕️", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { role: "Patient", email: "arjun.mehta@gmail.com", password: "password123", icon: "🧑", color: "bg-green-50 border-green-200 text-green-700" },
  ];

  return (
    <div className="min-h-[85vh] flex">

      {/* Left Side — Blue Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
          <span className="text-blue-600 text-2xl font-bold">C</span>
        </div>
        <h1 className="text-4xl font-bold mb-3">CareEase</h1>
        <p className="text-blue-200 text-center mb-10 text-sm">
          Online Healthcare Consultancy Platform
        </p>

        <div className="space-y-4 w-full max-w-xs">
          {[
            { icon: "👨‍⚕️", text: "Expert verified doctors" },
            { icon: "🤖", text: "AI-powered health assistant" },
            { icon: "📅", text: "Easy appointment booking" },
            { icon: "🔒", text: "Secure & private platform" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-blue-100">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl font-bold">C</span>
            </div>
            <h1 className="text-2xl font-bold text-blue-600">CareEase</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back! 👋</h2>
          <p className="text-gray-500 text-sm mb-8">Apne account mein login karo</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                🔒 Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg shadow-blue-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Login →"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500 mb-8">
            Account nahi hai?{" "}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Register karo
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              🔐 Demo Credentials
            </p>
            <div className="space-y-2">
              {demoCredentials.map((cred) => (
                <button
                  key={cred.role}
                  onClick={() => setFormData({ email: cred.email, password: cred.password })}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors hover:opacity-80 ${cred.color}`}
                >
                  <span className="font-bold">{cred.icon} {cred.role}:</span>{" "}
                  {cred.email} / {cred.password}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Click to auto-fill credentials</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
