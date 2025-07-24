const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

/**
 * 🔄 PUBLIC ROUTES
 */

// GET /api/news — all news
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        NewsID,
        Title,
        Content,
        CreatedAt
      FROM News
      ORDER BY CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching news:", err);
    res.status(500).json({ message: "Error fetching news" });
  }
});

// GET /api/news/:id — specific news by ID
router.get("/:id", async (req, res) => {
  const newsId = parseInt(req.params.id, 10);
  if (isNaN(newsId)) {
    return res.status(400).json({ message: "Invalid news ID" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("NewsID", sql.Int, newsId)
      .query(`
        SELECT
          NewsID,
          Title,
          Content,
          CreatedAt
        FROM News
        WHERE NewsID = @NewsID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Error fetching single news:", err);
    res.status(500).json({ message: "Error fetching news" });
  }
});

/**
 * 🔐 PROTECTED ROUTES (Admin only)
 */
router.use(verifyToken);
router.use(isAdmin);

// POST /api/news — create news
router.post("/", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res
      .status(400)
      .json({ message: "Title and content are required" });
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("Title", sql.NVarChar(255), title)
      .input("Content", sql.NVarChar(sql.MAX), content)
      .query(`
        INSERT INTO News (Title, Content, CreatedAt)
        VALUES (@Title, @Content, GETDATE())
      `);

    res.status(201).json({ message: "News created successfully" });
  } catch (err) {
    console.error("❌ Error creating news:", err);
    res.status(500).json({ message: "Error creating news" });
  }
});

// PUT /api/news/:id — update news
router.put("/:id", async (req, res) => {
  const newsId = parseInt(req.params.id, 10);
  const { title, content } = req.body;

  if (isNaN(newsId)) {
    return res.status(400).json({ message: "Invalid news ID" });
  }
  if (!title || !content) {
    return res
      .status(400)
      .json({ message: "Title and content are required" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("NewsID", sql.Int, newsId)
      .input("Title", sql.NVarChar(255), title)
      .input("Content", sql.NVarChar(sql.MAX), content)
      .query(`
        UPDATE News
        SET Title = @Title,
            Content = @Content
        WHERE NewsID = @NewsID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json({ message: "News updated successfully" });
  } catch (err) {
    console.error("❌ Error updating news:", err);
    res.status(500).json({ message: "Error updating news" });
  }
});

// DELETE /api/news/:id — delete news
router.delete("/:id", async (req, res) => {
  const newsId = parseInt(req.params.id, 10);
  if (isNaN(newsId)) {
    return res.status(400).json({ message: "Invalid news ID" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("NewsID", sql.Int, newsId)
      .query("DELETE FROM News WHERE NewsID = @NewsID");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json({ message: "News deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting news:", err);
    res.status(500).json({ message: "Error deleting news" });
  }
});

module.exports = router;
