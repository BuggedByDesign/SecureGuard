// test-connection.js
const pool = require("./config/db");

(async () => {
  try {
    const [rows] = await pool.execute("SELECT 1");
    console.log("✅ Успешна връзка към MySQL!");
  } catch (err) {
    console.error("❌ Грешка при връзка:", err);
  }
})();
