const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const bcrypt = require("bcrypt");

// Добавен импорт за AI ревю генератора
const { generateProductReview } = require("./aiService");

// ===== PRODUCTS =====
// GET /api/admin/stats
// Admin only: общи статистики за сайта
// GET /api/admin/stats
// Admin only: return site statistics summary
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;

    const totalUsersResult = await pool.request().query("SELECT COUNT(*) AS TotalUsers FROM Users");
    const blockedUsersResult = await pool.request().query("SELECT COUNT(*) AS BlockedUsers FROM Users WHERE IsBlocked = 1");
    const onlineUsersResult = await pool.request().query("SELECT COUNT(*) AS OnlineUsers FROM Users WHERE IsOnline = 1");
    const totalReviewsResult = await pool.request().query("SELECT COUNT(*) AS TotalReviews FROM Reviews");
    const totalReportsResult = await pool.request().query("SELECT COUNT(*) AS TotalReports FROM ReportedReviews");

    res.json({
      totalUsers: totalUsersResult.recordset[0].TotalUsers,
      blockedUsers: blockedUsersResult.recordset[0].BlockedUsers,
      onlineUsers: onlineUsersResult.recordset[0].OnlineUsers,
      totalReviews: totalReviewsResult.recordset[0].TotalReviews,
      totalReports: totalReportsResult.recordset[0].TotalReports,
    });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    res.status(500).json({ message: "Server error while fetching statistics." });
  }
});


// GET /api/admin/
// Public: list all products with expert summaries & average user rating
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        p.ProductID,
        p.ProductName,
        p.Description,
        p.ImageURL,
        p.Price,
        p.Discount,
        p.KeyFeatures,
        e.OurReview,
        e.Pros,
        e.Cons,
        e.BottomLine,
        e.MalwareProtection,
        e.PerformanceImpact,
        e.UserInterface,
        e.ValueForMoney,
        e.ProtectionFeatures,
        e.OfficialWebsite,
        AVG(r.Rating) AS AverageRating
      FROM Products p
      LEFT JOIN ExpertReviews e ON p.ProductID = e.ProductID
      LEFT JOIN Reviews r ON p.ProductID = r.ProductID
      GROUP BY 
        p.ProductID, p.ProductName, p.Description, p.ImageURL, p.Price, p.Discount,
        p.KeyFeatures, e.OurReview, e.Pros, e.Cons, e.BottomLine,
        e.MalwareProtection, e.PerformanceImpact, e.UserInterface,
        e.ValueForMoney, e.ProtectionFeatures, e.OfficialWebsite
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("GET /api/admin error:", err);
    res.status(500).json({ message: "Server error while fetching products." });
  }
});

// GET /api/admin/name/:name
// Public: fetch a single product by exact name
router.get("/name/:name", async (req, res) => {
  const { name } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("ProductName", sql.NVarChar(100), name)
      .query("SELECT * FROM Products WHERE ProductName = @ProductName");
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("GET /api/admin/name/:name error:", err);
    res.status(500).json({ message: "Server error while fetching product." });
  }
});

// POST /api/admin/
// Admin only: create a new product + create empty expert review
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { ProductName, Description, Price, ImageURL, Discount } = req.body;

  if (!ProductName || !Description || Price === undefined) {
    return res.status(400).json({ message: "Name, description and price are required." });
  }

  try {
    // Валидация за числови полета
    const priceNumber = Number(Price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      return res.status(400).json({ message: "Price must be a valid positive number." });
    }
    const discountNumber = Discount !== undefined ? Number(Discount) : 0;
    if (isNaN(discountNumber) || discountNumber < 0) {
      return res.status(400).json({ message: "Discount must be a valid positive number." });
    }

    const pool = await poolPromise;

    // Добавяне на продукта
    const insertResult = await pool.request()
      .input("ProductName", sql.NVarChar(100), ProductName)
      .input("Description", sql.NVarChar(sql.MAX), Description)
      .input("Price", sql.Decimal(18, 2), priceNumber)
      .input("ImageURL", sql.NVarChar(255), ImageURL || "")
      .input("Discount", sql.Int, discountNumber)
      .query(`
        INSERT INTO Products (ProductName, Description, Price, ImageURL, Discount)
        OUTPUT INSERTED.ProductID
        VALUES (@ProductName, @Description, @Price, @ImageURL, @Discount);
      `);

    const newProductId = insertResult.recordset[0]?.ProductID;
    if (!newProductId) {
      return res.status(500).json({ message: "Failed to retrieve new Product ID." });
    }

    // Викаме AI генератора да създаде ревю по името на продукта
    let aiReview = null;
    try {
      aiReview = await generateProductReview(ProductName);
    } catch (err) {
      console.error("AI review generation failed:", err);
    }

    // Вмъкваме в ExpertReviews новото AI ревю
    await pool.request()
      .input("ProductID", sql.Int, newProductId)
      .input("OurReview", sql.NVarChar(sql.MAX), aiReview)
      .input("Pros", sql.NVarChar(sql.MAX), null)
      .input("Cons", sql.NVarChar(sql.MAX), null)
      .input("BottomLine", sql.NVarChar(sql.MAX), null)
      .input("MalwareProtection", sql.Float, 0)
      .input("PerformanceImpact", sql.Float, 0)
      .input("UserInterface", sql.Float, 0)
      .input("ValueForMoney", sql.Float, 0)
      .input("ProtectionFeatures", sql.NVarChar(sql.MAX), null)
      .query(`
        INSERT INTO ExpertReviews (
          ProductID, OurReview, Pros, Cons, BottomLine,
          MalwareProtection, PerformanceImpact, UserInterface,
          ValueForMoney, ProtectionFeatures
        ) VALUES (
          @ProductID, @OurReview, @Pros, @Cons, @BottomLine,
          @MalwareProtection, @PerformanceImpact, @UserInterface,
          @ValueForMoney, @ProtectionFeatures
        )
      `);

    return res.status(201).json({ message: "Product and expert review created successfully." });

  } catch (err) {
    console.error("❌ Error creating product + expert review:", err);
    res.status(500).json({ message: "Server error while creating product." });
  }
});

// PUT /api/admin/:id
// Admin only: update existing product
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const { ProductName, Description, ImageURL, Price, Discount } = req.body;

  if (!productId) return res.status(400).json({ message: "Invalid product ID." });

  try {
    const pool = await poolPromise;

    // Get existing product
    const existingResult = await pool
      .request()
      .input("ProductID", sql.Int, productId)
      .query("SELECT ProductName, Description, ImageURL, Price, Discount FROM Products WHERE ProductID = @ProductID");

    if (existingResult.recordset.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    const existingProduct = existingResult.recordset[0];

    // Use new or existing values
    const newProductName = ProductName && ProductName.trim() !== "" ? ProductName.trim() : existingProduct.ProductName;
    const newDescription = Description && Description.trim() !== "" ? Description.trim() : existingProduct.Description;
    const newImageURL = ImageURL && ImageURL.trim() !== "" ? ImageURL.trim() : (existingProduct.ImageURL || "");

    // Обработка на Price и Discount с валидация
    let priceString = Price;
    if (typeof Price === "number") {
      priceString = Price.toString();
    } else if (typeof Price === "string") {
      priceString = Price.trim();
    } else {
      priceString = existingProduct.Price.toString();
    }

    const priceNumber = Number(priceString);
    if (isNaN(priceNumber) || priceNumber < 0) {
      return res.status(400).json({ message: "Price must be a valid positive number." });
    }

    const discountNumber = Discount !== undefined ? Number(Discount) : existingProduct.Discount;
    if (isNaN(discountNumber) || discountNumber < 0) {
      return res.status(400).json({ message: "Discount must be a valid positive number." });
    }

    if (!newProductName) {
      return res.status(400).json({ message: "ProductName cannot be null or empty." });
    }

    await pool.request()
      .input("ProductID", sql.Int, productId)
      .input("ProductName", sql.NVarChar(200), newProductName)
      .input("Description", sql.NVarChar(sql.MAX), newDescription)
      .input("ImageURL", sql.NVarChar(sql.MAX), newImageURL)
      .input("Price", sql.Decimal(18, 2), priceNumber)
      .input("Discount", sql.Int, discountNumber)
      .query(`
        UPDATE Products
        SET ProductName = @ProductName,
            Description = @Description,
            ImageURL = @ImageURL,
            Price = @Price,
            Discount = @Discount
        WHERE ProductID = @ProductID
      `);

    res.json({ message: "Product updated successfully." });
  } catch (err) {
    console.error("PUT /api/admin/:id error:", err);
    res.status(500).json({ message: "Server error while updating product." });
  }
});

// DELETE /api/admin/:id
// Admin only: delete a product and its related reviews
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (!productId) return res.status(400).json({ message: "Invalid product ID." });

  try {
    const pool = await poolPromise;

    await pool.request()
      .input("ProductID", sql.Int, productId)
      .query("DELETE FROM BrowsingHistory WHERE ProductID = @ProductID");

    await pool.request()
      .input("ProductID", sql.Int, productId)
      .query("DELETE FROM Reviews WHERE ProductID = @ProductID");

    await pool.request()
      .input("ProductID", sql.Int, productId)
      .query("DELETE FROM Favorites WHERE ProductID = @ProductID");

    await pool.request()
      .input("ProductID", sql.Int, productId)
      .query(`DELETE FROM ReportedReviews WHERE ReviewID IN (SELECT ReviewID FROM Reviews WHERE ProductID = @ProductID)`);

    await pool.request()
      .input("ProductID", sql.Int, productId)
      .query("DELETE FROM ExpertReviews WHERE ProductID = @ProductID");

    const result = await pool.request()
      .input("ProductID", sql.Int, productId)
      .query("DELETE FROM Products WHERE ProductID = @ProductID");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ message: "Product and all related data deleted." });
  } catch (err) {
    console.error("DELETE /api/admin/:id error:", err);
    res.status(500).json({ message: "Server error while deleting product." });
  }
});

// PUT /api/admin/:id/features
// Admin only: update a product’s key features
router.put("/:id/features", verifyToken, isAdmin, async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const { features } = req.body;
  if (!productId || !features) {
    return res.status(400).json({ message: "Invalid product ID or missing features." });
  }
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("ProductID", sql.Int, productId)
      .input("KeyFeatures", sql.NVarChar(sql.MAX), features)
      .query(`
        UPDATE Products
        SET KeyFeatures = @KeyFeatures
        WHERE ProductID = @ProductID
      `);
    res.json({ message: "Key features updated successfully." });
  } catch (err) {
    console.error("PUT /api/admin/:id/features error:", err);
    res.status(500).json({ message: "Server error while updating features." });
  }
});

// ===== REPORTED REVIEWS =====

// GET /api/admin/reported-reviews
// Admin only: list all reported reviews
router.get("/reported-reviews", verifyToken, isAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        rep.ReportID, 
        r.ReviewID,
        p.ProductName,
        rep.Reason,
        r.ReviewText,
        rep.ReportedAt,
        rep.ReportedBy AS ReportedById,
        u.FullName AS ReportedByName
      FROM ReportedReviews rep
      JOIN Reviews r ON rep.ReviewID = r.ReviewID
      JOIN Products p ON r.ProductID = p.ProductID
      JOIN Users u ON rep.ReportedBy = u.UserID
      ORDER BY rep.ReportedAt DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("GET /api/admin/reported-reviews error:", err);
    res.status(500).json({ message: "Server error while fetching reported reviews." });
  }
});

// DELETE /api/admin/reviews/:reportId
// Admin only: remove a report and its underlying review
router.delete("/reviews/:reportId", verifyToken, isAdmin, async (req, res) => {
  const reportId = parseInt(req.params.reportId, 10);
  if (!reportId) return res.status(400).json({ message: "Invalid report ID." });
  try {
    const pool = await poolPromise;
    const lookup = await pool.request()
      .input("ReportID", sql.Int, reportId)
      .query("SELECT ReviewID FROM ReportedReviews WHERE ReportID = @ReportID");
    const reviewId = lookup.recordset[0]?.ReviewID;
    if (!reviewId) {
      return res.status(404).json({ message: "Report not found." });
    }
    // delete the report
    await pool.request()
      .input("ReportID", sql.Int, reportId)
      .query("DELETE FROM ReportedReviews WHERE ReportID = @ReportID");
    // delete the actual review
    await pool.request()
      .input("ReviewID", sql.Int, reviewId)
      .query("DELETE FROM Reviews WHERE ReviewID = @ReviewID");
    res.json({ message: "Reported review and its review have been deleted." });
  } catch (err) {
    console.error("DELETE /api/admin/reviews/:reportId error:", err);
    res.status(500).json({ message: "Server error while deleting reported review." });
  }
});

// ===== USERS =====

// GET /api/admin/users
// Admin only: list all users
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query("SELECT UserID, FullName, Email, IsOnline, IsAdmin, IsBlocked FROM Users");
    res.json(result.recordset);
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    res.status(500).json({ message: "Server error while fetching users." });
  }
});

// GET /api/admin/user-profiles
// Admin only: detailed user profiles (без Bio и ProfilePicture)
router.get("/user-profiles", verifyToken, isAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        u.UserID, 
        u.FullName, 
        u.Email, 
        u.IsAdmin, 
        u.IsBlocked,
        ISNULL(rp.ReportCount, 0) AS ReportCount
      FROM Users u
      LEFT JOIN (
        SELECT r.UserID, COUNT(rep.ReportID) AS ReportCount
        FROM Reviews r
        JOIN ReportedReviews rep ON r.ReviewID = rep.ReviewID
        GROUP BY r.UserID
      ) rp ON u.UserID = rp.UserID
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("GET /api/admin/user-profiles error:", err);
    res.status(500).json({ message: "Server error while fetching user profiles." });
  }
});

// PUT /api/admin/users/:id
// Admin only: update user details (optionally change password)
router.put("/users/:id", verifyToken, isAdmin, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { fullName, email, password } = req.body;
  if (!userId || !fullName || !email) {
    return res.status(400).json({ message: "Invalid data supplied." });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request()
      .input("UserID", sql.Int, userId)
      .input("FullName", sql.NVarChar, fullName)
      .input("Email", sql.NVarChar, email);

    if (password && password.trim()) {
      const hashed = await bcrypt.hash(password.trim(), 10);
      request.input("Password", sql.NVarChar(sql.MAX), hashed);

      await request.query(`
        UPDATE Users
        SET FullName = @FullName,
            Email    = @Email,
            Password = @Password
        WHERE UserID = @UserID
      `);
    } else {
      await request.query(`
        UPDATE Users
        SET FullName = @FullName,
            Email    = @Email
        WHERE UserID = @UserID
      `);
    }

    res.json({ message: "User updated successfully." });
  } catch (err) {
    console.error("PUT /api/admin/users/:id error:", err);
    res.status(500).json({ message: "Server error while updating user." });
  }
});

// DELETE /api/admin/users/:id
// Admin only: delete a user and all their related data
router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (!userId) return res.status(400).json({ message: "Invalid user ID." });

  try {
    const pool = await poolPromise;

    await pool.request()
      .input("UserID", sql.Int, userId)
      .query("DELETE FROM BrowsingHistory WHERE UserID = @UserID");

    await pool.request()
      .input("UserID", sql.Int, userId)
      .query("DELETE FROM ReportedReviews WHERE ReportedBy = @UserID");

    await pool.request()
      .input("UserID", sql.Int, userId)
      .query("DELETE FROM Reviews WHERE UserID = @UserID");

    await pool.request()
      .input("UserID", sql.Int, userId)
      .query("DELETE FROM Favorites WHERE UserID = @UserID");

    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query("DELETE FROM Users WHERE UserID = @UserID");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User and related data deleted." });
  } catch (err) {
    console.error("DELETE /api/admin/users/:id error:", err);
    res.status(500).json({ message: "Server error while deleting user." });
  }
});

// ===== MOST REPORTED USERS =====
// GET /api/admin/most-reported-users
router.get("/most-reported-users", verifyToken, isAdmin, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 10
        u.UserID,
        u.FullName,
        COUNT(rep.ReportID) AS ReportCount
      FROM Users u
      JOIN Reviews r ON u.UserID = r.UserID
      JOIN ReportedReviews rep ON r.ReviewID = rep.ReviewID
      GROUP BY u.UserID, u.FullName
      ORDER BY ReportCount DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("GET /api/admin/most-reported-users error:", err);
    res.status(500).json({ message: "Server error while fetching most reported users." });
  }
});

module.exports = router;
