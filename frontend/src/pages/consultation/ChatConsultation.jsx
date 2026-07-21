// frontend/src/pages/consultation/ChatConsultation.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";
import toast from "react-hot-toast";

const ChatConsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [otherUserJoined, setOtherUserJoined] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const roomId = `chat_${appointmentId}`;

  // ── Fetch Data ──
  const fetchData = useCallback(async () => {
    try {
      const [appointmentRes, messagesRes] = await Promise.all([
        axios.get(`/appointment/detail/${appointmentId}`),
        axios.get(`/appointment/messages/${appointmentId}`),
      ]);
      setAppointment(appointmentRes.data.appointment);
      setMessages(messagesRes.data.messages || []);
    } catch (err) {
      toast.error("Chat load nahi hua.");
      navigate("/appointments");
    } finally {
      setLoading(false);
    }
  }, [appointmentId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Auto Scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Socket Events ──
  useEffect(() => {
    if (!socket || !appointment) return;

    socket.emit("join-room", { room: roomId, userId: user.id });

    socket.on("user-joined", () => {
      setOtherUserJoined(true);
      toast.success("Dusra user join ho gaya!");
    });

    socket.on("receive-message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender_id: data.senderId,
          sender_name: data.senderName,
          message: data.message,
          created_at: new Date().toISOString(),
        },
      ]);
    });

    socket.on("user-typing", ({ senderId }) => {
      if (senderId !== user.id) {
        setOtherUserTyping(true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          setOtherUserTyping(false);
        }, 2000);
      }
    });

    socket.on("user-left", () => {
      setOtherUserJoined(false);
      toast("Dusra user chala gaya.", { icon: "👋" });
    });

    return () => {
      socket.off("user-joined");
      socket.off("receive-message");
      socket.off("user-typing");
      socket.off("user-left");
    };
  }, [socket, appointment, roomId, user.id]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      socket?.emit("leave-room", { room: roomId });
      clearTimeout(typingTimerRef.current);
    };
  }, [socket, roomId]);

  // ── Typing ──
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socket) {
      socket.emit("typing", { room: roomId, senderId: user.id });
    }
  };

  // ── Send Message ──
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      sender_id: user.id,
      sender_name: user.name,
      message: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    try {
      socket?.emit("send-message", {
        room: roomId,
        senderId: user.id,
        senderName: user.name,
        message: text,
      });

      await axios.post("/appointment/message", {
        appointment_id: appointmentId,
        message: text,
      });
    } catch (err) {
      toast.error("Message nahi gaya. Try again.");
    }
  };

  // ── Enter Key ──
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Format Time ──
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Chat load ho raha hai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-blue-600 font-bold">
              {user.role === "patient"
                ? appointment?.doctor_name?.charAt(0).toUpperCase()
                : appointment?.patient_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {user.role === "patient"
                ? `Dr. ${appointment?.doctor_name}`
                : appointment?.patient_name}
            </p>
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  otherUserJoined ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <p className="text-xs text-gray-400">
                {otherUserTyping
                  ? "typing..."
                  : otherUserJoined
                    ? "Online"
                    : "Waiting..."}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            socket?.emit("leave-room", { room: roomId });
            navigate("/appointments");
          }}
          className="px-4 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
        >
          End Chat
        </button>
      </div>

      {/* ── Chat Window ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
        {/* Messages — h-[450px] fixed height */}
        <div className="h-96 overflow-y-auto p-4 space-y-3">
          <div className="text-center">
            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
              💬 Chat consultation started — Appointment #{appointmentId}
            </span>
          </div>

          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">
                Koi message nahi hai abhi. Shuru karo!
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isOwn = msg.sender_id === user.id;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {!isOwn && (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1">
                    <span className="text-blue-600 text-xs font-bold">
                      {msg.sender_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div
                  className={`max-w-[75%] flex flex-col ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs text-gray-400 mb-1 px-1">
                      {msg.sender_name}
                    </p>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm ${
                      isOwn
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-1">
                    {formatTime(msg.created_at)}
                  </p>
                </div>

                {isOwn && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0 ml-2 mt-1">
                    <span className="text-white text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {otherUserTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mr-2">
                <span className="text-blue-600 text-xs font-bold">
                  {user.role === "patient"
                    ? appointment?.doctor_name?.charAt(0).toUpperCase()
                    : appointment?.patient_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message likhein..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
        <p className="text-blue-600 text-xs">
          🔒 Ye consultation private hai — Sirf aap aur doctor dekh sakte hain
        </p>
      </div>
    </div>
  );
};

export default ChatConsultation;
