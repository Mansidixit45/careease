// backend/routes/chat.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// =====================
// GET — Chat History
// GET /api/chat/:appointmentId
// =====================
router.get("/:appointmentId", verifyToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    // Verify user is part of this appointment
    const [appointment] = await db.query(
      `SELECT * FROM appointments WHERE id = ? AND (patient_id = ? OR doctor_id = ?)`,
      [appointmentId, userId, userId]
    );

    if (appointment.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied!",
      });
    }

    // Fetch messages
    const [messages] = await db.query(
      `SELECT cm.*, u.name as sender_name, u.role as sender_role
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.appointment_id = ?
       ORDER BY cm.created_at ASC`,
      [appointmentId]
    );

    // Mark messages as read
    await db.query(
      `UPDATE chat_messages SET is_read = 1 
       WHERE appointment_id = ? AND receiver_id = ?`,
      [appointmentId, userId]
    );

    return res.json({ success: true, messages });
  } catch (err) {
    console.error("Chat History Error:", err.message);
    return res.status(500).json({ message: "Server Error!" });
  }
});

// =====================
// POST — Save Message
// POST /api/chat/send
// =====================
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { appointment_id, receiver_id, message } = req.body;
    const sender_id = req.user.id;

    if (!appointment_id || !receiver_id || !message) {
      return res.status(400).json({ message: "All fields required!" });
    }

    // Save message to DB
    const [result] = await db.query(
      `INSERT INTO chat_messages 
       (appointment_id, sender_id, receiver_id, message)
       VALUES (?, ?, ?, ?)`,
      [appointment_id, sender_id, receiver_id, message]
    );

    // Create notification for receiver
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, 'New Message', 'Aapko ek naya message mila!', 'chat')`,
      [receiver_id]
    );

    return res.status(201).json({
      success: true,
      messageId: result.insertId,
      message: "Message sent!",
    });
  } catch (err) {
    console.error("Send Message Error:", err.message);
    return res.status(500).json({ message: "Server Error!" });
  }
});

// =====================
// GET — Unread Count
// GET /api/chat/unread/count
// =====================
router.get("/unread/count", verifyToken, async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT COUNT(*) as unread FROM chat_messages 
       WHERE receiver_id = ? AND is_read = 0`,
      [req.user.id]
    );
    return res.json({ success: true, unread: result[0].unread });
  } catch (err) {
    return res.status(500).json({ message: "Server Error!" });
  }
});

module.exports = router;
