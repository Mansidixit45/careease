// backend/routes/appointment.js

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const {
  verifyToken,
  verifyDoctor,
  verifyPatient,
} = require("../middleware/authMiddleware");

// =====================
// POST — Appointment Book Karo
// =====================
router.post("/book", verifyPatient, async (req, res) => {
  try {
    const { doctor_id, appointment_date, appointment_time, symptoms } = req.body;
    const patient_id = req.user.id;

    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        message: "Sabhi fields bharna zaroori hai!",
      });
    }

    await db.query(
      `INSERT INTO appointments 
        (patient_id, doctor_id, appointment_date, appointment_time, status, symptoms) 
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [patient_id, doctor_id, appointment_date, appointment_time, symptoms || ""],
    );

    // Doctor ko notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES (?, ?, ?, ?)`,
      [
        doctor_id,
        "New Appointment Request",
        `Naya appointment request aaya hai! Date: ${appointment_date}`,
        "appointment",
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Appointment book ho gaya!",
    });
  } catch (err) {
    console.error("Book Appointment Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

// =====================
// GET — Patient Ke Sare Appointments
// =====================
router.get("/patient", verifyPatient, async (req, res) => {
  try {
    const patient_id = req.user.id;

    const [appointments] = await db.query(
      `SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.symptoms,
        a.notes,
        a.created_at,
        u.name AS doctor_name,
        d.specialization,
        d.fees
       FROM appointments a
       JOIN users u ON a.doctor_id = u.id
       JOIN doctor_profiles d ON a.doctor_id = d.user_id
       WHERE a.patient_id = ?
       ORDER BY a.created_at DESC`,
      [patient_id],
    );

    return res.status(200).json({ success: true, appointments });
  } catch (err) {
    console.error("Get Patient Appointments Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

// =====================
// GET — Doctor Ke Sare Appointments
// =====================
router.get("/doctor", verifyDoctor, async (req, res) => {
  try {
    const doctor_id = req.user.id;

    const [appointments] = await db.query(
      `SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.symptoms,
        a.notes,
        a.created_at,
        u.name AS patient_name,
        pp.phone AS patient_phone,
        dp.fees
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       LEFT JOIN patient_profiles pp ON a.patient_id = pp.user_id
       LEFT JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
       WHERE a.doctor_id = ?
       ORDER BY a.created_at DESC`,
      [doctor_id],
    );

    return res.status(200).json({ success: true, appointments });
  } catch (err) {
    console.error("Get Doctor Appointments Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

// =====================
// PUT — Doctor Appointment Confirm Kare
// =====================
router.put("/confirm/:id", verifyDoctor, async (req, res) => {
  try {
    const { id } = req.params;
    const doctor_id = req.user.id;

    const [appointment] = await db.query(
      "SELECT * FROM appointments WHERE id = ? AND doctor_id = ?",
      [id, doctor_id],
    );

    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment nahi mila!",
      });
    }

    await db.query(
      "UPDATE appointments SET status = 'confirmed' WHERE id = ?",
      [id],
    );

    // Patient ko notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES (?, ?, ?, ?)`,
      [
        appointment[0].patient_id,
        "Appointment Confirmed",
        `Aapka appointment confirm ho gaya! Date: ${appointment[0].appointment_date}`,
        "appointment",
      ],
    );

    return res.status(200).json({
      success: true,
      message: "Appointment confirm ho gaya!",
    });
  } catch (err) {
    console.error("Confirm Appointment Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

// =====================
// PUT — Appointment Cancel Karo
// (Doctor ya Patient dono)
// =====================
router.put("/cancel/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [appointment] = await db.query(
      "SELECT * FROM appointments WHERE id = ? AND (patient_id = ? OR doctor_id = ?)",
      [id, userId, userId],
    );

    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment nahi mila!",
      });
    }

    await db.query(
      "UPDATE appointments SET status = 'cancelled' WHERE id = ?",
      [id],
    );

    const notifyUserId =
      appointment[0].patient_id === userId
        ? appointment[0].doctor_id
        : appointment[0].patient_id;

    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES (?, ?, ?, ?)`,
      [
        notifyUserId,
        "Appointment Cancelled",
        `Appointment cancel ho gaya! Date: ${appointment[0].appointment_date}`,
        "appointment",
      ],
    );

    return res.status(200).json({
      success: true,
      message: "Appointment cancel ho gaya!",
    });
  } catch (err) {
    console.error("Cancel Appointment Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

// =====================
// PUT — Appointment Complete Karo
// (Sirf Doctor)
// =====================
router.put("/complete/:id", verifyDoctor, async (req, res) => {
  try {
    const { id } = req.params;
    const doctor_id = req.user.id;

    const [appointment] = await db.query(
      "SELECT * FROM appointments WHERE id = ? AND doctor_id = ?",
      [id, doctor_id],
    );

    if (appointment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment nahi mila!",
      });
    }

    await db.query(
      "UPDATE appointments SET status = 'completed' WHERE id = ?",
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Appointment complete ho gaya!",
    });
  } catch (err) {
    console.error("Complete Appointment Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

module.exports = router;