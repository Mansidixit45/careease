import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import API from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await API.get("/notifications/unread/count");
      setUnreadCount(res.data?.unread_count ?? 0);
    } catch (err) {
      console.error("Notification count error:", err.message);
    }
  }, [token]);

  // ── Reset count when token disappears ──
  const resetCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    // Interval clear karo pehle
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!token) {
      resetCount(); // setState callback mein — ESLint safe
      return;
    }

    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token, fetchUnreadCount, resetCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
