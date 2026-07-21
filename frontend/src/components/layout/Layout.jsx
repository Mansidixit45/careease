import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className={`flex-1 ${isHome ? "" : "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6"}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
