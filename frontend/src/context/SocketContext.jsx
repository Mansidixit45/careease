import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const subscribersRef = useRef([]);

  // ── Socket getter — ref based (no useState needed) ──────────────────────
  const getSocket = useCallback(() => socketRef.current, []);

  const onSocketReady = useCallback((cb) => {
    subscribersRef.current.push(cb);
  }, []);

  useEffect(() => {
    // Cleanup previous socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (!token) return;

    // Naya socket banao
    const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = newSocket;

    // Subscribers notify karo
    newSocket.on("connect", () => {
      subscribersRef.current.forEach((cb) => cb(newSocket));
      subscribersRef.current = [];
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ getSocket, onSocketReady, socketRef }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
