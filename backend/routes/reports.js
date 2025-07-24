// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const sendEmail = require("../utils/sendEmail");

// 📥 POST /api/reports
// Report a comment (only logged in users)
router.post('/', verifyToken, async (req, res) => {
  const { commentId, reason } = req.body;
  const userId = req.user.id;

  if (!commentId || !reason || !userId) {
    return res.status(400).json({ message: 'Missing comment ID, reason, or user.' });
  }

  try {
    const pool = await poolPromise;

    // Get review text and user
    const reviewQuery = await pool.request()
      .input('ReviewID', sql.Int, commentId)
      .query(`
        SELECT r.ReviewText, u.FullName
        FROM Reviews r
        JOIN Users u ON r.UserID = u.UserID
        WHERE r.ReviewID = @ReviewID
      `);

    const review = reviewQuery.recordset[0];

    // Insert report into table
    await pool.request()
      .input('CommentID', sql.Int, commentId)
      .input('UserID', sql.Int, userId)
      .input('Reason', sql.NVarChar(sql.MAX), reason)
      .input('ReportedAt', sql.DateTime, new Date())
      .query(`
        INSERT INTO ReportedComments (CommentID, UserID, Reason, ReportedAt)
        VALUES (@CommentID, @UserID, @Reason, @ReportedAt)
      `);

    // Count total reports by this user
    const reportCountResult = await pool.request()
      .input("UserID", sql.Int, userId)
      .query("SELECT COUNT(*) AS ReportCount FROM ReportedComments WHERE UserID = @UserID");

    const reportCount = reportCountResult.recordset[0].ReportCount;

    // Auto-block if reports exceed limit
    if (reportCount >= 10) {
      await pool.request()
        .input("UserID", sql.Int, userId)
        .query("UPDATE Users SET IsBlocked = 1 WHERE UserID = @UserID");

      console.log(`🚫 User ID ${userId} has been blocked for excessive reports.`);
    }

    // Send email notification
    await sendEmail(
      "🚩 New Review Report on SecureGuard",
      `User ${review?.FullName || "Unknown"} reported the review:\n\n"${review?.ReviewText || "No text"}"\n\nReason: ${reason}`
    );

    console.log("📨 Sent report email notification...");

    res.status(201).json({ message: 'The comment has been reported successfully.' });
  } catch (err) {
    console.error('❌ Error reporting comment:', err);
    res.status(500).json({ message: 'Error while reporting comment.' });
  }
});

// 📄 GET /api/reports
// Admin: get all reported comments
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        rc.ReportID, rc.CommentID, rc.UserID AS ReportedByUserID, rc.Reason, rc.ReportedAt, rc.Handled,
        r.ReviewText AS CommentText, u.FullName AS CommentAuthor
      FROM ReportedComments rc
      JOIN Reviews r ON rc.CommentID = r.ReviewID
      JOIN Users u   ON r.UserID = u.UserID
      ORDER BY rc.ReportedAt DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error fetching reports:', err);
    res.status(500).json({ message: 'Error fetching reports.' });
  }
});

// ✏️ PUT /api/reports/:id/handle
// Mark report as handled
router.put('/:id/handle', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ReportID', sql.Int, id)
      .query('UPDATE ReportedComments SET Handled = 1 WHERE ReportID = @ReportID');

    res.json({ message: 'Report marked as handled.' });
  } catch (err) {
    console.error('❌ Error updating report:', err);
    res.status(500).json({ message: 'Error updating report.' });
  }
});

module.exports = router;
