const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// GET /api/profile/me
router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await poolPromise;

    const [userInfo, favs, reviews, history] = await Promise.all([
      pool
        .request()
        .input("UserID", sql.Int, userId)
        .query(`
          SELECT UserID, FullName, Email 
          FROM Users 
          WHERE UserID = @UserID
        `),

      pool
        .request()
        .input("UserID", sql.Int, userId)
        .query(`
          SELECT p.ProductID, p.ProductName, f.AddedAt
          FROM Favorites f
          JOIN Products p ON f.ProductID = p.ProductID
          WHERE f.UserID = @UserID
          ORDER BY f.AddedAt DESC
        `),

      pool
        .request()
        .input("UserID", sql.Int, userId)
        .query(`
          SELECT 
            r.ReviewID, 
            p.ProductName, 
            r.Rating, 
            r.ReviewText AS Comment, 
            r.CreatedAt
          FROM Reviews r
          JOIN Products p ON r.ProductID = p.ProductID
          WHERE r.UserID = @UserID
          ORDER BY r.CreatedAt DESC
        `),

      pool
        .request()
        .input("UserID", sql.Int, userId)
        .query(`
          SELECT TOP 10 
            p.ProductID, 
            p.ProductName, 
            p.ImageURL, 
            h.ViewedAt
          FROM BrowsingHistory h
          JOIN Products p ON h.ProductID = p.ProductID
          WHERE h.UserID = @UserID
          ORDER BY h.ViewedAt DESC
        `),
    ]);

    res.json({
      user: userInfo.recordset[0],
      favorites: favs.recordset,
      myReviews: reviews.recordset,
      history: history.recordset,
    });
  } catch (err) {
    console.error("❌ Error in GET /api/profile/me:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/profile/history
router.post("/history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Missing productId" });
    }

    const pool = await poolPromise;
    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("ProductID", sql.Int, productId)
      .query(`
        INSERT INTO BrowsingHistory (UserID, ProductID)
        VALUES (@UserID, @ProductID)
      `);

    res.status(201).json({ message: "History recorded" });
  } catch (err) {
    console.error("❌ Error in POST /api/profile/history:", err);
    res.status(500).json({ message: "Error recording history" });
  }
});

module.exports = router;
