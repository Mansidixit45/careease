// backend/routes/auth.js

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================
// POST — Register
// =====================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Sabhi fields bharna zaroori hai!",
      });
    }

    // Role check
    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role!",
      });
    }

    // Email already exists?
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Yeh email already registered hai!",
      });
    }

    // Password hash karo
    const hashedPassword = await bcrypt.hash(password, 10);

    // User insert karo
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role]
    );

    const userId = result.insertId;

    // Profile create karo based on role
    if (role === "doctor") {
      await db.query(
        `INSERT INTO doctor_profiles (user_id, specialization, experience, fees, is_approved) 
         VALUES (?, '', 0, 0, 0)`,
        [userId]
      );
    } else if (role === "patient") {
      await db.query(
        `INSERT INTO patient_profiles (user_id, age, gender, blood_group, medical_history) 
         VALUES (?, NULL, '', '', '')`,
        [userId]
      );
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful! Ab login karo.",
    });

  } catch (err) {
    console.error("Register Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
});

// =====================
// POST — Login
// =====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email aur password dono chahiye!",
      });
    }

    // User dhundo
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email ya password galat hai!",
      });
    }

    const user = users[0];

    // Password check karo
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email ya password galat hai!",
      });
    }

    // ✅ Doctor approval check — doctor_profiles se
    if (user.role === "doctor") {
      const [profile] = await db.query(
        "SELECT is_approved FROM doctor_profiles WHERE user_id = ?",
        [user.id]
      );

      if (profile.length > 0 && profile[0].is_approved === 0) {
        return res.status(403).json({
          success: false,
          message: "Aapka account abhi admin se approve nahi hua. Thoda wait karo!",
        });
      }
    }

    // JWT Token banao
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
});

// =====================
// GET — Logged In User Info
// =====================
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token nahi mila!",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await db.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User nahi mila!",
      });
    }

    return res.status(200).json({
      success: true,
      user: users[0],
    });

  } catch (err) {
    console.error("Me Error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid token!",
    });
  }
});

module.exports = router;