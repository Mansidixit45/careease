// frontend/src/pages/consultation/VideoCall.jsx

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoCall = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth(); // ✅ Sirf ek baar
  const navigate = useNavigate();

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef        = useRef(null);
  const socketRef      = useRef(null);
  const localStreamRef = useRef(null);

  const [callStatus,    setCallStatus]    = useState("connecting");
  const [isMuted,       setIsMuted]       = useState(false);
  const [isVideoOff,    setIsVideoOff]    = useState(false);
  const [callDuration,  setCallDuration]  = useState(0);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
  }, []);

  const formatDuration = (s) => {
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const createPeer = useCallback(() => {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current?.emit("ice_candidate", {
          roomId: appointmentId,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
      setCallStatus("active");
      startTimer();
    };

    peer.onconnectionstatechange = () => {
      if (
        peer.connectionState === "disconnected" ||
        peer.connectionState === "failed"
      ) {
        setCallStatus("ended");
      }
    };

    return peer;
  }, [appointmentId, startTimer]);

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.close();
    socketRef.current?.disconnect();
  }, []);

  const endCall = useCallback(
    (notify = true) => {
      if (notify) socketRef.current?.emit("end_call", appointmentId);
      cleanup();
      setCallStatus("ended");
      clearInterval(timerRef.current);
      setTimeout(() => navigate(-1), 2000);
    },
    [appointmentId, navigate, cleanup]
  );

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        socketRef.current.emit("join_room", appointmentId);
        setCallStatus("waiting");

        socketRef.current.on("user_joined", async () => {
          toast.success("Dusra user join ho gaya! 🎉");
          peerRef.current = createPeer();
          stream.getTracks().forEach((t) => peerRef.current.addTrack(t, stream));
          const offer = await peerRef.current.createOffer();
          await peerRef.current.setLocalDescription(offer);
          socketRef.current.emit("call_offer", { roomId: appointmentId, offer });
        });

        socketRef.current.on("call_offer", async ({ offer }) => {
          peerRef.current = createPeer();
          stream.getTracks().forEach((t) => peerRef.current.addTrack(t, stream));
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(answer);
          socketRef.current.emit("call_answer", { roomId: appointmentId, answer });
        });

        socketRef.current.on("call_answer", async ({ answer }) => {
          await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socketRef.current.on("ice_candidate", async ({ candidate }) => {
          try {
            await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error("ICE error:", e);
          }
        });

        socketRef.current.on("call_ended", () => {
          toast.error("Dusre user ne call khatam kar di");
          endCall(false);
        });
      })
      .catch((err) => {
        console.error("Media error:", err);
        toast.error("Camera/Microphone access nahi mila!");
        setCallStatus("ended");
      });

    return () => cleanup();
  }, [appointmentId, createPeer, endCall, cleanup]);

  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  if (callStatus === "ended") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📞</div>
          <h2 className="text-2xl font-bold mb-2">Call Khatam Ho Gayi</h2>
          <p className="text-gray-400 mb-1">Duration: {formatDuration(callDuration)}</p>
          <p className="text-gray-500 text-sm">Wapas ja rahe hain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800">
        <div>
          <h1 className="text-white font-bold">📹 Video Call</h1>
          <p className="text-gray-400 text-xs">Room: #{appointmentId}</p>
        </div>
        <div>
          {callStatus === "active" && (
            <span className="text-green-400 text-sm font-mono">
              🔴 {formatDuration(callDuration)}
            </span>
          )}
          {callStatus === "waiting" && (
            <span className="text-yellow-400 text-sm animate-pulse">
              ⏳ Wait kar rahe hain...
            </span>
          )}
          {callStatus === "connecting" && (
            <span className="text-blue-400 text-sm animate-pulse">
              🔄 Connecting...
            </span>
          )}
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {callStatus === "waiting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold">Dusre user ka wait kar rahe hain...</p>
              <p className="text-gray-400 text-sm mt-2">Link share karo dusre user se</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copy ho gaya! 📋");
                }}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
              >
                📋 Link Copy Karo
              </button>
            </div>
          </div>
        )}

        {/* Local Video */}
        <div className="absolute top-4 right-4 w-32 h-24 sm:w-40 sm:h-32 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-gray-800">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          )}
          <p className="absolute bottom-1 left-1 text-white text-xs bg-black/50 px-1 rounded">
            {user?.name?.split(" ")[0] || "You"}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-5 flex items-center justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${
            isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-500"
          }`}
        >
          {isMuted ? "🔇" : "🎤"}
        </button>

        <button
          onClick={() => endCall(true)}
          className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-2xl transition-colors shadow-lg"
        >
          📵
        </button>

        <button
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${
            isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-500"
          }`}
        >
          {isVideoOff ? "🚫" : "📹"}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
