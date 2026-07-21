// frontend/src/pages/chatbot/SehatSaathi.jsx
import { useState, useEffect, useRef } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const quickQuestions = [
  "Mujhe bukhar hai, kya karun?",
  "Sir dard ke liye kya karun?",
  "Khasi aur zukam ke liye tips",
  "BP control kaise karein?",
  "Diabetes diet tips",
  "First aid for cuts",
];

const SehatSaathi = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1, type: "bot",
      text: `Namaste ${user?.name?.split(" ")[0]}! 👋 Main Sehat Saathi hoon — aapka AI health companion.\n\nSymptoms, precautions, diet tips ya first aid ke baare mein pooch sakte hain. Kaise help karoon?`,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;

    const userMsg = {
      id: Date.now(), type: "user", text: msgText,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-6);
      const res = await axios.post("/chatbot/message", { message: msgText, history });
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, type: "bot",
        text: res.data.response || "Koi response nahi mila.",
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, type: "bot",
        text: "Maafi chahta hoon, abhi response nahi de pa raha. Thodi der baad try karein. 🙏",
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="min-h-screen bg-gray-50 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white px-6 py-6 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
            🤖
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">Sehat Saathi</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <p className="text-emerald-100 text-xs font-medium">Online — AI Health Companion</p>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
              ⚠️ Not a doctor
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg shrink-0">⚠️</span>
          <p className="text-amber-700 text-xs leading-relaxed">
            <strong>Disclaimer:</strong> Sehat Saathi sirf general health information deta hai. Ye koi medical diagnosis ya prescription nahi hai. Serious symptoms ke liye hamesha doctor se milein.
          </p>
        </div>

        {/* Chat Window */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Messages */}
          <div className="h-[420px] overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.type === "bot" && (
                  <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 mt-1 text-sm">🤖</div>
                )}
                <div className={`max-w-[78%] flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.type === "user"
                      ? "bg-blue-600 text-white rounded-br-sm shadow-sm"
                      : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</p>
                </div>
                {msg.type === "user" && (
                  <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 text-sm">🤖</div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div key={i} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Apna symptom ya health question likhein..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-60 transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 font-semibold text-sm"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : "Send ➤"}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Questions</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SehatSaathi;
