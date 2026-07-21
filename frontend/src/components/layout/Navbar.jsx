import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import {
  FiHome, FiCalendar, FiUser, FiBell, FiLogOut,
  FiMenu, FiX, FiMessageCircle, FiUsers,
} from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const getLinks = () => {
    if (!user) return [];
    if (user.role === "patient") return [
      { to: "/dashboard",    label: "Dashboard",    icon: <FiHome size={15} /> },
      { to: "/doctors",      label: "Doctors",      icon: <FiUser size={15} /> },
      { to: "/appointments", label: "Appointments", icon: <FiCalendar size={15} /> },
      { to: "/chatbot", label: "Sehat Saathi", icon: <FiMessageCircle size={15} /> },
    ];
    if (user.role === "doctor") return [
      { to: "/doctor/dashboard", label: "Dashboard",    icon: <FiHome size={15} /> },
      { to: "/appointments",     label: "Appointments", icon: <FiCalendar size={15} /> },
    ];
    if (user.role === "admin") return [
      { to: "/admin",             label: "Dashboard",    icon: <FiHome size={15} /> },
      { to: "/admin/doctors",     label: "Doctors",      icon: <FiUser size={15} /> },
      { to: "/admin/appointments",label: "Appointments", icon: <FiCalendar size={15} /> },
      { to: "/admin/users",       label: "Users",        icon: <FiUsers size={15} /> },
    ];
    return [];
  };

  const links = getLinks();
  const isActive = (path) => location.pathname === path;

  // Role-based accent color
  const roleColor = {
    patient: "from-blue-600 to-blue-700",
    doctor:  "from-teal-600 to-teal-700",
    admin:   "from-slate-700 to-slate-800",
  };
  const accentGrad = user ? (roleColor[user.role] || roleColor.patient) : roleColor.patient;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 bg-gradient-to-br ${accentGrad} rounded-xl flex items-center justify-center shadow-sm`}>
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="text-lg font-black text-gray-800 tracking-tight">
              Care<span className="text-blue-600">Ease</span>
            </span>
          </Link>

          {/* Desktop Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <FiBell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Chip */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className={`w-6 h-6 bg-gradient-to-br ${accentGrad} rounded-full flex items-center justify-center shrink-0`}>
                    <span className="text-white text-[10px] font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold text-gray-800">{user.name?.split(" ")[0]}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all"
                >
                  <FiLogOut size={14} />
                  Logout
                </button>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && user && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.to) ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100 my-1" />
          <div className="flex items-center gap-3 px-3 py-2">
            <div className={`w-8 h-8 bg-gradient-to-br ${accentGrad} rounded-full flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">{user.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => { handleLogout(); setMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <FiLogOut size={15} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
