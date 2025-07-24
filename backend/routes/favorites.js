
const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// Добавяне в любими
router.post("/", verifyToken, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: "Missing productId" });

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("UserID", sql.Int, req.user.id)
      .input("ProductID", sql.Int, productId)
      .query("INSERT INTO Favorites (UserID, ProductID, AddedAt) VALUES (@UserID, @ProductID, GETDATE())");

    res.status(201).json({ message: "Added to favorites" });
  } catch (err) {
    console.error("❌ Add favorite error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Премахване от любими
router.delete("/:productId", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("UserID", sql.Int, req.user.id)
      .input("ProductID", sql.Int, req.params.productId)
      .query("DELETE FROM Favorites WHERE UserID = @UserID AND ProductID = @ProductID");

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("❌ Remove favorite error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Проверка дали е в любими
router.get("/:productId", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("UserID", sql.Int, req.user.id)
      .input("ProductID", sql.Int, req.params.productId)
      .query("SELECT * FROM Favorites WHERE UserID = @UserID AND ProductID = @ProductID");

    res.json({ isFavorite: result.recordset.length > 0 });
  } catch (err) {
    console.error("❌ Check favorite error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
