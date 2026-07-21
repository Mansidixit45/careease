const bcrypt = require("bcryptjs");

const run = async () => {
  const hash = await bcrypt.hash("password123", 10);
  console.log("HASH:", hash);
  process.exit(0);
};

run();