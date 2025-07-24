const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

router.post("/", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Моля, въведете имейл адрес." });

  try {
    const pool = await poolPromise;
    const check = await pool.request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM Subscribers WHERE Email = @Email");

    if (check.recordset.length > 0) {
      return res.status(409).json({ message: "Този имейл вече е абониран." });
    }

    await pool.request()
      .input("Email", sql.NVarChar, email)
      .query("INSERT INTO Subscribers (Email) VALUES (@Email)");

    res.status(201).json({ message: "Успешно се абонирахте!" });
  } catch (err) {
    console.error("❌ Subscribe error:", err);
    res.status(500).json({ message: "Възникна грешка при абонамент." });
  }
});

module.exports = router;
