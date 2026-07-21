const bcrypt = require("bcryptjs");
const db = require("../config/db");

const seedAdmin = async () => {
  try {
    console.log("🌱 Admin seed shuru...");

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [
      "admin@careease.com",
    ]);

    if (existing.length > 0) {
      console.log("✅ Admin already exists!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await db.query(
      `INSERT INTO users (name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?)`,
      ["Admin", "admin@careease.com", hashedPassword, "admin", 1],
    );

    console.log("✅ Admin created!");
    console.log("📧 Email    : admin@careease.com");
    console.log("🔑 Password : admin123");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

seedAdmin();
