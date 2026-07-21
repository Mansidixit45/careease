const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();

// Test Connection
db.getConnection()
  .then(() => {
    console.log("✅ MySQL Database Connected Successfully!");
  })
  .catch((err) => {
    console.error("❌ Database Connection Failed:", err.message);
  });

module.exports = db;
