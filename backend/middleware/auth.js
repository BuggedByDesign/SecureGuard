const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

// 🔐 Регистрация
router.post("/register", async (req, res) => {
  const { email, password, isAdmin } = req.body;

  try {
    const pool = await poolPromise;

    // Проверка дали вече съществува
    const existing = await pool.request()
      .input("Email", sql.NVarChar(100), email)
      .query("SELECT * FROM Users WHERE Email = @Email");

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: "Потребителят вече съществува" });
    }

    await pool.request()
      .input("Email", sql.NVarChar(100), email)
      .input("Password", sql.NVarChar(100), password)
      .input("IsAdmin", sql.Bit, isAdmin || 0)
      .query("INSERT INTO Users (Email, Password, IsAdmin) VALUES (@Email, @Password, @IsAdmin)");

    res.status(201).json({ message: "Успешна регистрация" });
  } catch (err) {
    res.status(500).json({ message: "Грешка при регистрация", error: err.message });
  }
});

// 🔑 Вход
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("Email", sql.NVarChar(100), email)
      .input("Password", sql.NVarChar(100), password)
      .query("SELECT * FROM Users WHERE Email = @Email AND Password = @Password");

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: "Невалидни данни" });

    // ✅ Включваме и id, и isAdmin в токена
    const token = jwt.sign(
      { id: user.UserID, isAdmin: user.IsAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Грешка при вход", error: err.message });
  }
});

module.exports = router;
