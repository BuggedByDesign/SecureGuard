const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

// Вземане на ревю по продукт
router.get("/:productId", async (req, res) => {
  const { productId } = req.params;

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ message: "Невалиден ProductID" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("ProductID", sql.Int, parseInt(productId))
      .query("SELECT * FROM ExpertReviews WHERE ProductID = @ProductID");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Ревюто не е намерено" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Expert Review GET Error:", err);
    res.status(500).json({ message: "Грешка при зареждане на ревюто" });
  }
});

// Добавяне или обновяване на ревю
router.put("/:productId", async (req, res) => {
  const { productId } = req.params;
  const {
    ourReview, pros, cons, bottomLine,
    malware, performance, ui, value, protectionFeatures
  } = req.body;

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ message: "Невалиден ProductID" });
  }

  // Може да добавиш и допълнителна валидация за body, ако искаш

  try {
    const pool = await poolPromise;

    // Проверка дали вече има ревю за този продукт
    const check = await pool.request()
      .input("ProductID", sql.Int, parseInt(productId))
      .query("SELECT 1 FROM ExpertReviews WHERE ProductID = @ProductID");

    const query = check.recordset.length > 0
      ? `UPDATE ExpertReviews SET
          OurReview = @OurReview, Pros = @Pros, Cons = @Cons,
          BottomLine = @BottomLine, MalwareProtection = @MalwareProtection,
          PerformanceImpact = @PerformanceImpact, UserInterface = @UserInterface,
          ValueForMoney = @ValueForMoney, ProtectionFeatures = @ProtectionFeatures
         WHERE ProductID = @ProductID`
      : `INSERT INTO ExpertReviews (
          ProductID, OurReview, Pros, Cons, BottomLine,
          MalwareProtection, PerformanceImpact, UserInterface,
          ValueForMoney, ProtectionFeatures
        ) VALUES (
          @ProductID, @OurReview, @Pros, @Cons, @BottomLine,
          @MalwareProtection, @PerformanceImpact, @UserInterface,
          @ValueForMoney, @ProtectionFeatures
        )`;

    await pool.request()
      .input("ProductID", sql.Int, parseInt(productId))
      .input("OurReview", sql.NVarChar(sql.MAX), ourReview || null)
      .input("Pros", sql.NVarChar(sql.MAX), pros || null)
      .input("Cons", sql.NVarChar(sql.MAX), cons || null)
      .input("BottomLine", sql.NVarChar(sql.MAX), bottomLine || null)
      .input("MalwareProtection", sql.Float, malware ?? null)
      .input("PerformanceImpact", sql.Float, performance ?? null)
      .input("UserInterface", sql.Float, ui ?? null)
      .input("ValueForMoney", sql.Float, value ?? null)
      .input("ProtectionFeatures", sql.NVarChar(sql.MAX), protectionFeatures || null)
      .query(query);

    res.json({ message: check.recordset.length > 0 ? "Обновено успешно" : "Добавено успешно" });
  } catch (err) {
    console.error("❌ ExpertReviews PUT Error:", err);
    res.status(500).json({ message: "Грешка при запис на ревюто" });
  }
});

module.exports = router;
