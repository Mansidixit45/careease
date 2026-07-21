const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
require("dotenv").config();

// Routes Import
const authRoutes = require("./routes/auth");
const doctorRoutes = require("./routes/doctor");
const appointmentRoutes = require("./routes/appointment");
const adminRoutes = require("./routes/admin");
const notificationRoutes = require("./routes/notification");
const chatbotRoutes = require("./routes/chatbot");

// Socket Handler Import
const socketHandler = require("./socket/socketHandler");

// DB Import (connection test ke liye)
require("./config/db");

// App Setup
const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// =====================
// Middleware
// =====================
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Routes
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chatbot", chatbotRoutes);

// =====================
// Default Route
// =====================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🏥 CareEase Backend Running Hai!",
  });
});

// =====================
// 404 Handler
// =====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route nahi mila!",
  });
});

// =====================
// Socket Handler
// =====================
socketHandler(io);

// =====================
// Server Start
// =====================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server chal raha hai port ${PORT} pe!`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});
