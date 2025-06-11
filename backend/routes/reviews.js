const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// 🔍 GET всички ревюта за даден продукт + ИМЕ на потребителя
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("ProductID", sql.Int, productId)
      .query(`
        SELECT R.ReviewID, R.ReviewText, R.Rating, R.ProductID, R.UserID,
               U.FullName AS UserName
        FROM Reviews R
        JOIN Users U ON R.UserID = U.UserID
        WHERE R.ProductID = @ProductID
        ORDER BY R.ReviewID DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Грешка при взимане на ревюта:", err);
    res.status(500).json({ message: "Сървърна грешка" });
  }
});

// 📝 POST: Добавяне на ревю
router.post("/", verifyToken, async (req, res) => {
  const { productId, reviewText, rating } = req.body;
  const userId = req.user.id;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("ProductID", sql.Int, productId)
      .input("UserID", sql.Int, userId)
      .input("ReviewText", sql.NVarChar(sql.MAX), reviewText)
      .input("Rating", sql.Int, rating)
      .query(`
        INSERT INTO Reviews (ProductID, UserID, ReviewText, Rating)
        VALUES (@ProductID, @UserID, @ReviewText, @Rating)
      `);

    const result = await pool.request()
      .input("ProductID", sql.Int, productId)
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT TOP 1 R.ReviewID, R.ReviewText, R.Rating, R.ProductID, R.UserID,
                      U.FullName AS UserName
        FROM Reviews R
        JOIN Users U ON R.UserID = U.UserID
        WHERE R.ProductID = @ProductID AND R.UserID = @UserID
        ORDER BY R.ReviewID DESC
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Грешка при добавяне на ревю:", err);
    res.status(500).json({ message: "Сървърна грешка" });
  }
});

// 🗑 DELETE: Изтриване на ревю (само админ)
router.delete("/:reviewId", verifyToken, isAdmin, async (req, res) => {
  const { reviewId } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("ReviewID", sql.Int, reviewId)
      .query("DELETE FROM Reviews WHERE ReviewID = @ReviewID");

    res.json({ message: "Ревюто е изтрито успешно" });
  } catch (err) {
    console.error("❌ Грешка при изтриване на ревю:", err);
    res.status(500).json({ message: "Сървърна грешка" });
  }
});

module.exports = router;
