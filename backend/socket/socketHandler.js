const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ New User Connected:", socket.id);

    // =====================
    // Room Join Karo
    // (Consultation ke liye)
    // =====================
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);

      // Dusre user ko batao
      socket.to(roomId).emit("user_joined", {
        message: "Dusra user room mein aa gaya!",
        socketId: socket.id,
      });
    });

    // =====================
    // Chat Message Bhejo
    // =====================
    socket.on("send_message", (data) => {
      const { roomId, message, senderName } = data;

      // Poore room mein message bhejo
      io.to(roomId).emit("receive_message", {
        message,
        senderName,
        time: new Date().toLocaleTimeString(),
      });
    });

    // =====================
    // Video Call — Offer
    // =====================
    socket.on("call_offer", (data) => {
      const { roomId, offer } = data;
      socket.to(roomId).emit("call_offer", { offer });
    });

    // =====================
    // Video Call — Answer
    // =====================
    socket.on("call_answer", (data) => {
      const { roomId, answer } = data;
      socket.to(roomId).emit("call_answer", { answer });
    });

    // =====================
    // Video Call — ICE Candidate
    // =====================
    socket.on("ice_candidate", (data) => {
      const { roomId, candidate } = data;
      socket.to(roomId).emit("ice_candidate", { candidate });
    });

    // =====================
    // Call End Karo
    // =====================
    socket.on("end_call", (roomId) => {
      io.to(roomId).emit("call_ended", {
        message: "Call khatam ho gayi!",
      });
    });

    // =====================
    // Typing Indicator
    // =====================
    socket.on("typing", (data) => {
      const { roomId, senderName } = data;
      socket.to(roomId).emit("typing", {
        senderName,
      });
    });

    // =====================
    // Typing Stop
    // =====================
    socket.on("stop_typing", (roomId) => {
      socket.to(roomId).emit("stop_typing");
    });

    // =====================
    // Disconnect
    // =====================
    socket.on("disconnect", () => {
      console.log("❌ User Disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;
