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

const Section = ({ className, children }) => (
  <div className={`w-full ${className}`}>
    <div className="max-w-5xl mx-auto px-10 sm:px-16">
      {children}
    </div>
  </div>
);

// ── Home Page ──────────────────────────────────────────────────────────
const Home = () => {
  const { user } = useAuth();

  if (user?.role === "patient") return <Navigate to="/dashboard" replace />;
  if (user?.role === "doctor") return <Navigate to="/doctor/dashboard" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen w-full">

      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Welcome to <span className="text-blue-200">CareEase</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-3">
            🏥 Online Healthcare Consultancy Platform
          </p>
          <p className="text-blue-200 mb-10 text-sm">
            Powered by <strong>Sehat Saathi</strong> — Your AI Health Companion
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="/register" className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm">
              🚀 Get Started Free
            </a>
            <a href="/login" className="px-8 py-3 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-colors text-sm">
              Login
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <Section className="bg-white py-10 border-b border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { number: "50+",   label: "Doctors",      icon: "👨‍⚕️" },
            { number: "1000+", label: "Patients",     icon: "🧑" },
            { number: "5000+", label: "Appointments", icon: "📅" },
            { number: "24/7",  label: "AI Support",   icon: "🤖" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold text-blue-600">{stat.number}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section className="py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">Why Choose CareEase?</h2>
        <p className="text-center text-gray-500 mb-12 text-sm">Apni health ko priority do — ghar baithe doctor se milo</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "👨‍⚕️", title: "Expert Doctors",       desc: "Verified specialists — Cardiologist, Dermatologist aur bahut kuch", color: "bg-blue-50 border-blue-100" },
            { icon: "🤖",   title: "Sehat Saathi AI",     desc: "24/7 AI assistant — symptoms check karo, instant guidance pao",   color: "bg-purple-50 border-purple-100" },
            { icon: "📅",   title: "Easy Booking",        desc: "2 minute mein appointment book karo — no waiting, no hassle",     color: "bg-green-50 border-green-100" },
            { icon: "💬",   title: "Online Consultation", desc: "Ghar baithe doctor se milo — video, audio ya chat",              color: "bg-orange-50 border-orange-100" },
            { icon: "🔔",   title: "Smart Notifications", desc: "Appointment reminders aur updates — kabhi miss mat karo",         color: "bg-yellow-50 border-yellow-100" },
            { icon: "🔒",   title: "Secure & Private",    desc: "Aapki health data bilkul safe — end-to-end secure",              color: "bg-red-50 border-red-100" },
          ].map((feature) => (
            <div key={feature.title} className={`${feature.color} border rounded-xl p-5 hover:shadow-md transition-shadow`}>
              <p className="text-3xl mb-3">{feature.icon}</p>
              <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How it Works */}
      <Section className="py-16 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">Kaise Kaam Karta Hai?</h2>
        <p className="text-center text-gray-500 mb-12 text-sm">3 simple steps mein shuru karo</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: "01", icon: "📝", title: "Register Karo",  desc: "Patient ya Doctor ke roop mein register karo — bilkul free" },
            { step: "02", icon: "🔍", title: "Doctor Dhundho", desc: "Specialization ke hisab se best doctor choose karo" },
            { step: "03", icon: "✅", title: "Consult Karo",   desc: "Appointment book karo aur ghar baithe consultation lo" },
          ].map((step) => (
            <div key={step.step} className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{step.icon}</span>
              </div>
              <span className="text-xs font-bold text-blue-400">STEP {step.step}</span>
              <h3 className="font-bold text-gray-800 mt-1 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <div className="w-full bg-blue-600 py-16 text-center text-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <h2 className="text-3xl font-bold mb-3">Abhi Shuru Karo!</h2>
          <p className="text-blue-100 mb-8 text-sm">Hazaro patients CareEase pe trust karte hain — aap bhi join karo</p>
          <a href="/register" className="inline-block px-10 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            🚀 Free Account Banao
          </a>
        </div>
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
