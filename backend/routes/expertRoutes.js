const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

// 🔍 ВЗИМА експертно ревю по ProductID
router.get("/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("ProductID", sql.Int, productId)
      .query("SELECT * FROM ExpertReviews WHERE ProductID = @ProductID");

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Expert Review GET Error:", err);
    res.status(500).json({ message: "Грешка при зареждане на ревюто" });
  }
});

// 💾 ЗАПАЗВА или АКТУАЛИЗИРА експертно ревю
router.put("/:productId", async (req, res) => {
  const { productId } = req.params;
  const {
    ourReview,
    pros,
    cons,
    bottomLine,
    malware,
    performance,
    ui,
    value,
    protectionFeatures
  } = req.body;

  try {
    const pool = await poolPromise;

    // Проверка дали съществува вече запис за този продукт
    const check = await pool.request()
      .input("ProductID", sql.Int, productId)
      .query("SELECT * FROM ExpertReviews WHERE ProductID = @ProductID");

    if (check.recordset.length > 0) {
      // Ако съществува – актуализирай
      await pool.request()
        .input("ProductID", sql.Int, productId)
        .input("OurReview", sql.NVarChar(sql.MAX), ourReview)
        .input("Pros", sql.NVarChar(sql.MAX), pros)
        .input("Cons", sql.NVarChar(sql.MAX), cons)
        .input("BottomLine", sql.NVarChar(sql.MAX), bottomLine)
        .input("MalwareProtection", sql.Float, malware)
        .input("PerformanceImpact", sql.Float, performance)
        .input("UserInterface", sql.Float, ui)
        .input("ValueForMoney", sql.Float, value)
        .input("ProtectionFeatures", sql.NVarChar(sql.MAX), protectionFeatures)
        .query(`
          UPDATE ExpertReviews SET
            OurReview = @OurReview,
            Pros = @Pros,
            Cons = @Cons,
            BottomLine = @BottomLine,
            MalwareProtection = @MalwareProtection,
            PerformanceImpact = @PerformanceImpact,
            UserInterface = @UserInterface,
            ValueForMoney = @ValueForMoney,
            ProtectionFeatures = @ProtectionFeatures
          WHERE ProductID = @ProductID
        `);
      res.json({ message: "Успешно обновено ревюто!" });
    } else {
      // Ако не съществува – създай нов запис
      await pool.request()
        .input("ProductID", sql.Int, productId)
        .input("OurReview", sql.NVarChar(sql.MAX), ourReview)
        .input("Pros", sql.NVarChar(sql.MAX), pros)
        .input("Cons", sql.NVarChar(sql.MAX), cons)
        .input("BottomLine", sql.NVarChar(sql.MAX), bottomLine)
        .input("MalwareProtection", sql.Float, malware)
        .input("PerformanceImpact", sql.Float, performance)
        .input("UserInterface", sql.Float, ui)
        .input("ValueForMoney", sql.Float, value)
        .input("ProtectionFeatures", sql.NVarChar(sql.MAX), protectionFeatures)
        .query(`
          INSERT INTO ExpertReviews (
            ProductID, OurReview, Pros, Cons, BottomLine,
            MalwareProtection, PerformanceImpact, UserInterface,
            ValueForMoney, ProtectionFeatures
          )
          VALUES (
            @ProductID, @OurReview, @Pros, @Cons, @BottomLine,
            @MalwareProtection, @PerformanceImpact, @UserInterface,
            @ValueForMoney, @ProtectionFeatures
          )
        `);
      res.json({ message: "Ревюто беше добавено успешно!" });
    }

  } catch (err) {
    console.error("❌ ExpertReviews PUT Error:", err);
    res.status(500).json({ message: "Грешка при запис на ревюто" });
  }
});

module.exports = router;
