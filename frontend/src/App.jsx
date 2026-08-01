// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import DoctorList from "./pages/doctors/DoctorList";
import DoctorProfile from "./pages/doctors/DoctorProfile";
import AppointmentList from "./pages/appointments/AppointmentList";
import BookAppointment from "./pages/appointments/BookAppointment";
import AdminPanel from "./pages/admin/AdminPanel";
import ManageDoctors from "./pages/admin/ManageDoctors";
import ManageAppointments from "./pages/admin/ManageAppointments";
import ManageUsers from "./pages/admin/ManageUsers";
import SehatSaathi from "./pages/chatbot/SehatSaathi";
import NotificationPanel from "./pages/notifications/NotificationPanel";
import VideoCall from "./pages/consultation/VideoCall";
import AudioCall from "./pages/consultation/AudioCall";
import ChatConsultation from "./pages/consultation/ChatConsultation";
import ProfilePage from "./pages/profile/ProfilePage";

// ── Home Page ──────────────────────────────────────────────────────────
const Home = () => {
  const { user } = useAuth();

  if (user?.role === "patient") return <Navigate to="/dashboard" replace />;
  if (user?.role === "doctor") return <Navigate to="/doctor/dashboard" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>

      {/* Hero Section */}
      <div style={{ background: "linear-gradient(135deg, #1d4ed8, #1e40af)", padding: "80px 40px", textAlign: "center", color: "white" }}>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: "bold", marginBottom: "16px" }}>
          Welcome to <span style={{ color: "#93c5fd" }}>CareEase</span>
        </h1>
        <p style={{ fontSize: "18px", color: "#bfdbfe", marginBottom: "12px" }}>
          🏥 Online Healthcare Consultancy Platform
        </p>
        <p style={{ fontSize: "14px", color: "#bfdbfe", marginBottom: "40px" }}>
          Powered by <strong>Sehat Saathi</strong> — Your AI Health Companion
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/register" style={{ padding: "12px 32px", background: "white", color: "#1d4ed8", fontWeight: "bold", borderRadius: "12px", textDecoration: "none", fontSize: "14px" }}>
            🚀 Get Started Free
          </a>
          <a href="/login" style={{ padding: "12px 32px", border: "2px solid white", color: "white", fontWeight: "bold", borderRadius: "12px", textDecoration: "none", fontSize: "14px" }}>
            Login
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "white", padding: "40px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          {[
            { number: "50+", label: "Doctors", icon: "👨‍⚕️" },
            { number: "1000+", label: "Patients", icon: "🧑" },
            { number: "5000+", label: "Appointments", icon: "📅" },
            { number: "24/7", label: "AI Support", icon: "🤖" },
          ].map((stat) => (
            <div key={stat.label}>
              <p style={{ fontSize: "28px", marginBottom: "4px" }}>{stat.icon}</p>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: "#2563eb" }}>{stat.number}</p>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ background: "#f9fafb", padding: "64px 40px" }}>
        <h2 style={{ fontSize: "30px", fontWeight: "bold", textAlign: "center", marginBottom: "12px", color: "#1f2937" }}>Why Choose CareEase?</h2>
        <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "48px", fontSize: "14px" }}>Apni health ko priority do — ghar baithe doctor se milo</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", maxWidth: "1000px", margin: "0 auto" }}>
          {[
            { icon: "👨‍⚕️", title: "Expert Doctors", desc: "Verified specialists — Cardiologist, Dermatologist aur bahut kuch", bg: "#eff6ff", border: "#bfdbfe" },
            { icon: "🤖", title: "Sehat Saathi AI", desc: "24/7 AI assistant — symptoms check karo, instant guidance pao", bg: "#faf5ff", border: "#e9d5ff" },
            { icon: "📅", title: "Easy Booking", desc: "2 minute mein appointment book karo — no waiting, no hassle", bg: "#f0fdf4", border: "#bbf7d0" },
            { icon: "💬", title: "Online Consultation", desc: "Ghar baithe doctor se milo — video, audio ya chat", bg: "#fff7ed", border: "#fed7aa" },
            { icon: "🔔", title: "Smart Notifications", desc: "Appointment reminders aur updates — kabhi miss mat karo", bg: "#fefce8", border: "#fde68a" },
            { icon: "🔒", title: "Secure & Private", desc: "Aapki health data bilkul safe — end-to-end secure", bg: "#fef2f2", border: "#fecaca" },
          ].map((feature) => (
            <div key={feature.title} style={{ background: feature.bg, border: `1px solid ${feature.border}`, borderRadius: "12px", padding: "20px" }}>
              <p style={{ fontSize: "28px", marginBottom: "12px" }}>{feature.icon}</p>
              <h3 style={{ fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>{feature.title}</h3>
              <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div style={{ background: "white", padding: "64px 40px" }}>
        <h2 style={{ fontSize: "30px", fontWeight: "bold", textAlign: "center", marginBottom: "12px", color: "#1f2937" }}>Kaise Kaam Karta Hai?</h2>
        <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "48px", fontSize: "14px" }}>3 simple steps mein shuru karo</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          {[
            { step: "01", icon: "📝", title: "Register Karo", desc: "Patient ya Doctor ke roop mein register karo — bilkul free" },
            { step: "02", icon: "🔍", title: "Doctor Dhundho", desc: "Specialization ke hisab se best doctor choose karo" },
            { step: "03", icon: "✅", title: "Consult Karo", desc: "Appointment book karo aur ghar baithe consultation lo" },
          ].map((step) => (
            <div key={step.step}>
              <div style={{ width: "64px", height: "64px", background: "#2563eb", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "24px" }}>
                {step.icon}
              </div>
              <p style={{ fontSize: "12px", fontWeight: "bold", color: "#93c5fd", marginBottom: "4px" }}>STEP {step.step}</p>
              <h3 style={{ fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>{step.title}</h3>
              <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6" }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#2563eb", padding: "64px 40px", textAlign: "center", color: "white" }}>
        <h2 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "12px" }}>Abhi Shuru Karo!</h2>
        <p style={{ color: "#bfdbfe", marginBottom: "32px", fontSize: "14px" }}>Hazaro patients CareEase pe trust karte hain — aap bhi join karo</p>
        <a href="/register" style={{ padding: "12px 40px", background: "white", color: "#2563eb", fontWeight: "bold", borderRadius: "12px", textDecoration: "none", display: "inline-block" }}>
          🚀 Free Account Banao
        </a>
      </div>

    </div>
  );
};

// ── 404 Page ───────────────────────────────────────────────────────────
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
    <h1 className="text-8xl font-bold text-blue-600">404</h1>
    <p className="text-gray-500 mt-4 text-xl">Page not found</p>
    <a href="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
      Go Home
    </a>
  </div>
);

// ── Main App ───────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute allowedRoles={["patient"]}><DoctorList /></ProtectedRoute>} />
          <Route path="/doctors/:id" element={<ProtectedRoute allowedRoles={["patient"]}><DoctorProfile /></ProtectedRoute>} />
          <Route path="/book-appointment/:doctorId" element={<ProtectedRoute allowedRoles={["patient"]}><BookAppointment /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute allowedRoles={["patient", "doctor"]}><AppointmentList /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute allowedRoles={["patient"]}><SehatSaathi /></ProtectedRoute>} />

          <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />

          <Route path="/consultation/video/:appointmentId" element={<ProtectedRoute allowedRoles={["patient", "doctor"]}><VideoCall /></ProtectedRoute>} />
          <Route path="/consultation/audio/:appointmentId" element={<ProtectedRoute allowedRoles={["patient", "doctor"]}><AudioCall /></ProtectedRoute>} />
          <Route path="/consultation/chat/:appointmentId" element={<ProtectedRoute allowedRoles={["patient", "doctor"]}><ChatConsultation /></ProtectedRoute>} />

          <Route path="/notifications" element={<ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}><NotificationPanel /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}><ProfilePage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPanel /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={["admin"]}><ManageDoctors /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={["admin"]}><ManageAppointments /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
