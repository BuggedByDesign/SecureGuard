const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

router.get('/:productName/features', async (req, res) => {
  const { productName } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("ProductName", sql.NVarChar(100), productName)
      .query(`SELECT KeyFeatures FROM Products WHERE ProductName = @ProductName`);

    const raw = result.recordset[0]?.KeyFeatures || "";

    // 🔁 Сплитваме по "\n", махаме тирета/точки отпред и празни редове
    const features = raw
      .split('\\n') // важно: две наклонени черти, защото идва от SQL escape
      .map(f => f.replace(/^[-•]\s*/, '').trim())
      .filter(f => f.length > 0);

    res.json(features);
  } catch (err) {
    console.error("❌ Грешка при взимане на features:", err);
    res.status(500).json({ message: "Сървърна грешка" });
  }
});

module.exports = router;
