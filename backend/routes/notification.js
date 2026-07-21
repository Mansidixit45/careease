const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// =====================
// GET — Apni Sari Notifications
// =====================
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [notifications] = await db.query(
      `SELECT id, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId],
    );

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (err) {
    console.error("Get Notifications Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
});

// =====================
// GET — Unread Notifications Count
// =====================
router.get("/unread/count", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await db.query(
      `SELECT COUNT(*) AS unread_count
       FROM notifications
       WHERE user_id = ? AND is_read = 0`,
      [userId],
    );

    return res.status(200).json({
      success: true,
      unread_count: result[0].unread_count,
    });
  } catch (err) {
    console.error("Unread Count Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
});

// =====================
// PUT — Single Notification Read Karo
// =====================
router.put("/read/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Notification exist karti hai kya
    const [notification] = await db.query(
      "SELECT * FROM notifications WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (notification.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification nahi mili!",
      });
    }

    // Read mark karo
    await db.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Notification read ho gayi!",
    });
  } catch (err) {
    console.error("Read Notification Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
});

// =====================
// PUT — Sari Notifications Read Karo
// =====================
router.put("/read/all/mark", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Sari notifications read ho gayi!",
    });
  } catch (err) {
    console.error("Read All Notifications Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
});

// =====================
// DELETE — Single Notification Delete Karo
// =====================
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Notification exist karti hai kya
    const [notification] = await db.query(
      "SELECT * FROM notifications WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (notification.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification nahi mili!",
      });
    }

    await db.query("DELETE FROM notifications WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Notification delete ho gayi!",
    });
  } catch (err) {
    console.error("Delete Notification Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
});

module.exports = router;
