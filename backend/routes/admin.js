// backend/routes/admin.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyAdmin } = require('../middleware/authMiddleware');

// ✅ Sabhi admin routes pe verifyAdmin middleware lagao
// Bina auth ke koi bhi /admin/stats access kar sakta tha

router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role != 'admin') as totalUsers,
        (SELECT COUNT(*) FROM users WHERE role = 'doctor') as totalDoctors,
        (SELECT COUNT(*) FROM users WHERE role = 'patient') as totalPatients,
        (SELECT COUNT(*) FROM appointments) as totalAppointments,
        (SELECT COUNT(*) FROM doctor_profiles WHERE is_approved = 0) as pendingDoctors,
        (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pendingAppointments
    `;
    const [results] = await db.query(sql);
    res.json(results[0]);
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/doctors', verifyAdmin, async (req, res) => {
  try {
    const sql = `
      SELECT u.id, u.name, u.email, u.created_at,
             dp.specialization, dp.experience,
             dp.fees, dp.phone, dp.is_approved
      FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.role = 'doctor'
      ORDER BY dp.is_approved ASC, u.created_at DESC
    `;
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Doctors error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.put('/doctors/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;
    await db.query(
      'UPDATE doctor_profiles SET is_approved = ? WHERE user_id = ?',
      [is_approved, id]
    );
    res.json({ message: is_approved ? 'Doctor approved!' : 'Doctor rejected!' });
  } catch (err) {
    console.error('Approve error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(results);
  } catch (err) {
    console.error('Users error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/appointments', verifyAdmin, async (req, res) => {
  try {
    const sql = `
      SELECT a.id, a.appointment_date, a.appointment_time,
             a.status, a.symptoms, a.notes,
             p.name as patient_name,
             d.name as doctor_name,
             dp.specialization
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      JOIN doctor_profiles dp ON d.id = dp.user_id
      ORDER BY a.appointment_date DESC
    `;
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Appointments error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
