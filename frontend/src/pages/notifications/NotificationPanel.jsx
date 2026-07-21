// frontend/src/pages/notifications/NotificationPanel.jsx

import { useState, useEffect, useCallback } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const notificationIcons = {
  appointment_booked: "📅",
  appointment_confirmed: "✅",
  appointment_cancelled: "❌",
  appointment_completed: "🏁",
  doctor_approved: "👨‍⚕️",
  doctor_rejected: "🚫",
  general: "🔔",
};

const NotificationPanel = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // ── Fetch Notifications ──
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error("Notifications load nahi hue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Mark as Read ──
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/read/${notificationId}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: 1 } : n)),
      );
    } catch (err) {
      console.error("Mark read error:", err.message);
    }
  };

  // ── Mark All as Read ──
  const markAllAsRead = async () => {
    try {
      await axios.put("/notifications/read/all/mark");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      toast.success("Saari notifications read mark ho gayi!");

    } catch (err) {
      toast.error("Try again.");
    }
  };

  // ── Filter ──
  const filtered =
    activeTab === "unread"
      ? notifications.filter((n) => n.is_read === 0)
      : notifications;

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  // ── Time Format ──
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Abhi abhi";
    if (diff < 3600) return `${Math.floor(diff / 60)} min pehle`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ghante pehle`;
    return date.toLocaleDateString("en-IN");
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">
            Notifications load ho rahi hain...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🔔 Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "Saari notifications read ho gayi hain"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          >
            ✓ Mark All Read
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "unread"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* ── Notifications List ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔔</p>
          <p className="text-gray-500 text-lg">Koi notification nahi hai</p>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === "unread"
              ? "Saari notifications read ho gayi hain"
              : "Abhi koi notification nahi hai"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => (
            <div
              key={notification.id}
              onClick={() =>
                notification.is_read === 0 && markAsRead(notification.id)
              }
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                notification.is_read === 0
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notification.is_read === 0 ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <span className="text-lg">
                    {notificationIcons[notification.type] ||
                      notificationIcons.general}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      notification.is_read === 0
                        ? "font-semibold text-gray-800"
                        : "text-gray-600"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(notification.created_at)}
                  </p>
                </div>

                {/* Unread dot */}
                {notification.is_read === 0 && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
