// frontend/src/pages/consultation/AudioCall.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";
import toast from "react-hot-toast";

// ── Component ke BAHAR — dependency issue fix ──
const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const AudioCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [otherUserJoined, setOtherUserJoined] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const timerRef = useRef(null);
  const roomId = `audio_${appointmentId}`;

  // ── Fetch Appointment ──
  const fetchAppointment = useCallback(async () => {
    try {
      const res = await axios.get(`/appointment/detail/${appointmentId}`);
      setAppointment(res.data.appointment);
    } catch (err) {
      toast.error("Appointment details load nahi hue.");
      navigate("/appointments");
    } finally {
      setLoading(false);
    }
  }, [appointmentId, navigate]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  // ── Setup Audio ──
  const setupAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
    } catch (err) {
      toast.error("Microphone access nahi mila.");
    }
  }, []);

  // ── Create Peer Connection ──
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          room: roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
      setOtherUserJoined(true);
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, roomId]);

  // ── Socket Events ──
  useEffect(() => {
    if (!socket || !appointment) return;

    socket.emit("join-room", { room: roomId, userId: user.id });

    socket.on("user-joined", async () => {
      setOtherUserJoined(true);
      toast.success("Dusra user join ho gaya!");
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { room: roomId, offer });
    });

    socket.on("offer", async ({ offer }) => {
      const pc = createPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { room: roomId, answer });
    });

    socket.on("answer", async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate),
        );
      }
    });

    socket.on("user-left", () => {
      setOtherUserJoined(false);
      clearInterval(timerRef.current);
      toast("Dusra user call se chala gaya.", { icon: "👋" });
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");
    };
  }, [socket, appointment, roomId, user.id, createPeerConnection]);

  // ── Init ──
  useEffect(() => {
    if (appointment) setupAudio();
  }, [appointment, setupAudio]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      peerConnectionRef.current?.close();
      clearInterval(timerRef.current);
      socket?.emit("leave-room", { room: roomId });
    };
  }, [socket, roomId]);

  // ── Toggle Mute ──
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  // ── End Call ──
  const endCall = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerConnectionRef.current?.close();
    clearInterval(timerRef.current);
    socket?.emit("leave-room", { room: roomId });
    toast("Call ended.", { icon: "📞" });
    navigate("/appointments");
  };

  // ── Format Duration ──
  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Call setup ho raha hai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <audio ref={remoteAudioRef} autoPlay />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {/* Avatar */}
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
            otherUserJoined ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          <span className="text-4xl font-bold text-gray-600">
            {user.role === "patient"
              ? appointment?.doctor_name?.charAt(0).toUpperCase()
              : appointment?.patient_name?.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Name */}
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {user.role === "patient"
            ? `Dr. ${appointment?.doctor_name}`
            : appointment?.patient_name}
        </h2>
        <p className="text-gray-400 text-sm mb-2">
          {user.role === "patient"
            ? appointment?.specialization || "Doctor"
            : "Patient"}
        </p>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`w-2 h-2 rounded-full ${
              otherUserJoined ? "bg-green-500 animate-pulse" : "bg-yellow-500"
            }`}
          ></div>
          <p className="text-sm font-medium text-gray-600">
            {otherUserJoined
              ? `Connected — ${formatDuration(callDuration)}`
              : "Waiting for other user..."}
          </p>
        </div>

        {/* Sound Wave */}
        {otherUserJoined && (
          <div className="flex items-center justify-center gap-1 mb-6 h-10">
            {[3, 5, 8, 6, 9, 6, 8, 5, 3].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-blue-400 rounded-full animate-pulse"
                style={{
                  height: `${h * (isMuted ? 2 : 4)}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Waiting Dots */}
        {!otherUserJoined && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors text-xl ${
              isMuted
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isMuted ? "🔇" : "🎤"}
          </button>
          <button
            onClick={endCall}
            className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors text-2xl"
          >
            📵
          </button>
        </div>

        {isMuted && (
          <p className="text-red-500 text-xs mt-4">🔇 Microphone muted hai</p>
        )}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
        <p className="text-blue-600 text-xs">
          📞 Audio consultation — Appointment #{appointmentId}
        </p>
      </div>
    </div>
  );
};

export default AudioCall;
