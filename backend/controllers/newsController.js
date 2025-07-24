// backend/controllers/newsController.js
const { sql, poolPromise } = require("../config/db");

/**
 * Връща списък с всички новини
 */
const getAllNews = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query("SELECT NewsID, Title, Content, CreatedAt FROM News ORDER BY CreatedAt DESC");
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching news:", err);
    res.status(500).json({ message: "Грешка при зареждане на новини." });
  }
};

/**
 * Създава нова новина
 * Очаква JSON { title, content }
 */
const createNews = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: "Липсва заглавие или съдържание." });
  }
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("Title",   sql.NVarChar, title)
      .input("Content", sql.NVarChar, content)
      .query("INSERT INTO News (Title, Content) VALUES (@Title, @Content)");
    res.status(201).json({ message: "Новината е добавена." });
  } catch (err) {
    console.error("❌ Error creating news:", err);
    res.status(500).json({ message: "Грешка при запис на новина." });
  }
};

/**
 * Изтрива новина по ID
 */
const deleteNews = async (req, res) => {
  const newsId = parseInt(req.params.id, 10);
  if (!newsId) {
    return res.status(400).json({ message: "Невалидно ID." });
  }
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("NewsID", sql.Int, newsId)
      .query("DELETE FROM News WHERE NewsID = @NewsID");
    res.json({ message: "Новината е изтрита." });
  } catch (err) {
    console.error("❌ Error deleting news:", err);
    res.status(500).json({ message: "Грешка при изтриване на новина." });
  }
};

module.exports = { getAllNews, createNews, deleteNews };
