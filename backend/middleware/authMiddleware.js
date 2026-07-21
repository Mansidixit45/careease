const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  try {
    // Header se token lo
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access Denied! Token nahi mila",
      });
    }

    // "Bearer TOKEN" se sirf token nikalo
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied! Token format galat hai",
      });
    }

    // Token verify karo
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token!",
    });
  }
};

// Sirf Doctor access kar sake
const verifyDoctor = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "doctor") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Sirf Doctor access kar sakta hai!",
      });
    }
  });
};

// Sirf Patient access kar sake
const verifyPatient = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "patient") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Sirf Patient access kar sakta hai!",
      });
    }
  });
};

// Sirf Admin access kar sake
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Sirf Admin access kar sakta hai!",
      });
    }
  });
};

module.exports = {
  verifyToken,
  verifyDoctor,
  verifyPatient,
  verifyAdmin,
};
