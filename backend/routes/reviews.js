const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, notBlocked, isAdmin } = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const { reviewFields } = require("../sql/fields");

// 📄 GET /api/reviews/:productId - Get all reviews for a product
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductID', sql.Int, productId)
      .query(`
        SELECT 
          R.ReviewID, 
          R.ReviewText, 
          R.Rating, 
          R.ProductID, 
          U.FullName AS UserName
        FROM Reviews R
        JOIN Users U ON R.UserID = U.UserID
        WHERE R.ProductID = @ProductID
        ORDER BY R.ReviewID DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📝 POST /api/reviews - Add a review
router.post('/', verifyToken, notBlocked, async (req, res) => {
  const { productId, reviewText, rating } = req.body;
  const userId = req.user.id;

  if (!productId || !reviewText || rating == null) {
    return res.status(400).json({ message: 'Missing productId, reviewText or rating.' });
  }

  try {
    const pool = await poolPromise;

    const userResult = await pool.request()
      .input("UserID", sql.Int, userId)
      .query("SELECT FullName FROM Users WHERE UserID = @UserID");
    const userFullName = userResult.recordset[0]?.FullName || "Unknown";

    const productResult = await pool.request()
      .input("ProductID", sql.Int, productId)
      .query("SELECT ProductName FROM Products WHERE ProductID = @ProductID");
    const productName = productResult.recordset[0]?.ProductName || "Unknown";

    await pool.request()
      .input('ProductID', sql.Int, productId)
      .input('UserID', sql.Int, userId)
      .input('ReviewText', sql.NVarChar(sql.MAX), reviewText)
      .input('Rating', sql.Int, rating)
      .input('CreatedAt', sql.DateTime, new Date())
      .query(`
        INSERT INTO Reviews 
          (ProductID, UserID, ReviewText, Rating, CreatedAt)
        VALUES 
          (@ProductID, @UserID, @ReviewText, @Rating, @CreatedAt)
      `);

    await sendEmail(
      "📝 New Review Submitted",
      `User ${userFullName} submitted a new review for "${productName}".`
    );

    const newReview = await pool.request()
      .input('ProductID', sql.Int, productId)
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT TOP 1 
          R.ReviewID, 
          R.ReviewText, 
          R.Rating, 
          R.ProductID, 
          U.FullName AS UserName
        FROM Reviews R
        JOIN Users U ON R.UserID = U.UserID
        WHERE R.ProductID = @ProductID AND R.UserID = @UserID
        ORDER BY R.ReviewID DESC
      `);

    res.status(201).json(newReview.recordset[0]);
  } catch (err) {
    console.error('❌ Error adding review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🚩 POST /api/reviews/report - Report a review
router.post('/report', verifyToken, async (req, res) => {
  const { reviewId, reason } = req.body;
  const userId = req.user.id;

  if (!reviewId || !reason) {
    return res.status(400).json({ message: 'Missing reviewId or reason.' });
  }

  try {
    const pool = await poolPromise;

    const detailResult = await pool.request()
      .input("ReviewID", sql.Int, reviewId)
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT p.ProductName, u.FullName AS ReporterName
        FROM Reviews r
        JOIN Products p ON r.ProductID = p.ProductID
        JOIN Users u ON u.UserID = @UserID
        WHERE r.ReviewID = @ReviewID
      `);
    const { ProductName, ReporterName } = detailResult.recordset[0] || {};

    await pool.request()
      .input('ReviewID', sql.Int, reviewId)
      .input('ReportedBy', sql.Int, userId)
      .input('Reason', sql.NVarChar(sql.MAX), reason)
      .input('ReportedAt', sql.DateTime, new Date())
      .query(`
        INSERT INTO ReportedReviews 
          (ReviewID, ReportedBy, Reason, ReportedAt)
        VALUES 
          (@ReviewID, @ReportedBy, @Reason, @ReportedAt)
      `);

    if (ProductName && ReporterName) {
      await sendEmail(
        "🚨 Review Reported",
        `User ${ReporterName} reported a review for product "${ProductName}". Reason: ${reason}`
      );
    }

    res.status(201).json({ message: 'Review reported successfully.' });
  } catch (err) {
    console.error('❌ Error reporting review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🗑 DELETE /api/reviews/:reviewId - Delete review (admin only)
router.delete('/:reviewId', verifyToken, isAdmin, async (req, res) => {
  const { reviewId } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ReviewID', sql.Int, reviewId)
      .query('DELETE FROM Reviews WHERE ReviewID = @ReviewID');

    res.json({ message: 'Review successfully deleted.' });
  } catch (err) {
    console.error('❌ Error deleting review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
