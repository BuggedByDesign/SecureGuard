const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// 🟢 GET /api/history
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query("SELECT * FROM BrowsingHistory WHERE UserID = @UserID ORDER BY Timestamp DESC");
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Failed to fetch history:", err);
    res.status(500).json({ message: "Error loading history" });
  }
});

module.exports = router;
