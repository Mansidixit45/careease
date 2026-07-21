const bcrypt = require("bcryptjs");
const db = require("../config/db");

const resetPasswords = async () => {
  try {
    // "password123" ka sahi hash banao
    const hash = await bcrypt.hash("password123", 10);
    console.log("Hash bana:", hash);

    // Saare doctors aur patients ka password update karo
    await db.query(
      `UPDATE users SET password = ? WHERE role IN ('doctor', 'patient')`,
      [hash]
    );

    console.log("✅ Saare passwords reset ho gaye!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

resetPasswords();