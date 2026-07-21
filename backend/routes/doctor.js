// backend/routes/doctor.js

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, verifyDoctor, verifyPatient } = require("../middleware/authMiddleware");

// =====================
// GET — Doctor Ka Apna Profile
// ⚠️ Yeh /:id se PEHLE hona chahiye — warna /profile/me, /:id match kar leta hai
// =====================
router.get("/profile/me", verifyDoctor, async (req, res) => {
  try {
    const userId = req.user.id;

    const [doctor] = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.phone,
        d.specialization, d.experience,
        d.fees, d.is_approved
       FROM users u
       JOIN doctor_profiles d ON u.id = d.user_id
       WHERE u.id = ?`,
      [userId],
    );

    if (doctor.length === 0) {
      return res.status(404).json({ success: false, message: "Profile nahi mila!" });
    }

    return res.status(200).json({ success: true, doctor: doctor[0] });
  } catch (err) {
    console.error("Get My Profile Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

// =====================
// PUT — Doctor Apna Profile Update Kare
// =====================
router.put("/profile/update", verifyDoctor, async (req, res) => {
  try {
    const { specialization, experience, fees, phone } = req.body;
    const userId = req.user.id;

    if (!specialization || !experience || !fees) {
      return res.status(400).json({ success: false, message: "Sabhi fields bharna zaroori hai!" });
    }

    await db.query(
      `UPDATE doctor_profiles 
       SET specialization = ?, experience = ?, fees = ?, phone = ?
       WHERE user_id = ?`,
      [specialization, experience, fees, phone || null, userId],
    );

    return res.status(200).json({ success: true, message: "Profile update ho gaya!" });
  } catch (err) {
    console.error("Update Doctor Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

// =====================
// GET — Patient Ka Apna Profile
// =====================
router.get("/patient/me", verifyPatient, async (req, res) => {
  try {
    const userId = req.user.id;

    const [patient] = await db.query(
      `SELECT 
        u.id, u.name, u.email,
        p.age, p.gender, p.blood_group, p.medical_history, p.phone, p.address
       FROM users u
       LEFT JOIN patient_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [userId],
    );

    if (patient.length === 0) {
      return res.status(404).json({ success: false, message: "Profile nahi mila!" });
    }

    return res.status(200).json({ success: true, patient: patient[0] });
  } catch (err) {
    console.error("Get Patient Profile Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

// =====================
// PUT — Patient Apna Profile Update Kare
// =====================
router.put("/patient/update", verifyPatient, async (req, res) => {
  try {
    const { age, gender, blood_group, medical_history, phone, address } = req.body;
    const userId = req.user.id;

    await db.query(
      `UPDATE patient_profiles 
       SET age = ?, gender = ?, blood_group = ?, medical_history = ?, phone = ?, address = ?
       WHERE user_id = ?`,
      [age || null, gender || "", blood_group || "", medical_history || "", phone || "", address || "", userId],
    );

    return res.status(200).json({ success: true, message: "Profile update ho gaya!" });
  } catch (err) {
    console.error("Update Patient Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

// =====================
// GET — Sab Doctors List
// =====================
router.get("/", verifyToken, async (req, res) => {
  try {
    const [doctors] = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.phone,
        d.specialization, d.experience, 
        d.fees, d.is_approved
       FROM users u
       JOIN doctor_profiles d ON u.id = d.user_id
       WHERE u.role = 'doctor' AND d.is_approved = 1`,
    );

    return res.status(200).json({ success: true, doctors });
  } catch (err) {
    console.error("Get Doctors Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

// =====================
// GET — Single Doctor Profile
// =====================
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [doctor] = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.phone,
        d.specialization, d.experience,
        d.fees, d.is_approved
       FROM users u
       JOIN doctor_profiles d ON u.id = d.user_id
       WHERE u.id = ? AND u.role = 'doctor'`,
      [id],
    );

    if (doctor.length === 0) {
      return res.status(404).json({ success: false, message: "Doctor nahi mila!" });
    }

    return res.status(200).json({ success: true, doctor: doctor[0] });
  } catch (err) {
    console.error("Get Doctor Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
});

module.exports = router;
