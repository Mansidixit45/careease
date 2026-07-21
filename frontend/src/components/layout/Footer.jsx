import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-lg font-bold text-blue-600">CareEase</span>
          </div>

          {/* Tagline */}
          <p className="text-sm text-gray-500 text-center">
            Powered by{" "}
            <span className="text-blue-600 font-semibold">Sehat Saathi</span> —
            Your AI Health Companion
          </p>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link
              to="/doctors"
              className="hover:text-blue-600 transition-colors"
            >
              Doctors
            </Link>
            <Link
              to="/chatbot"
              className="hover:text-blue-600 transition-colors"
            >
              Sehat Saathi
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            © {year} CareEase — BCA Final Year Project. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
