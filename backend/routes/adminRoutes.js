const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// 📄 GET: All products + average rating + expert fields
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        p.ProductID,
        p.ProductName,
        p.Description,
        p.Price,
        p.ImageURL,
        p.KeyFeatures,
        er.OurReview,
        er.Pros,
        er.Cons,
        er.BottomLine,
        er.ProtectionFeatures,
        er.MalwareProtection,
        er.PerformanceImpact,
        er.UserInterface,
        er.ValueForMoney,
        er.OfficialWebsite,
        AVG(CAST(r.Rating AS FLOAT)) AS AverageRating
      FROM Products p
      LEFT JOIN Reviews r ON r.ProductID = p.ProductID
      LEFT JOIN ExpertReviews er ON er.ProductID = p.ProductID
      GROUP BY 
        p.ProductID,
        p.ProductName,
        p.Description,
        p.Price,
        p.ImageURL,
        p.KeyFeatures,
        er.OurReview,
        er.Pros,
        er.Cons,
        er.BottomLine,
        er.ProtectionFeatures,
        er.MalwareProtection,
        er.PerformanceImpact,
        er.UserInterface,
        er.ValueForMoney,
        er.OfficialWebsite
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error loading products:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


// 📥 POST: Add product (base64 image)
router.post('/', async (req, res) => {
  const { name, description, image, price } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ProductName', sql.NVarChar(100), name)
      .input('Description', sql.NVarChar(sql.MAX), description)
      .input('ImageURL', sql.NVarChar(sql.MAX), image)
      .input('Price', sql.NVarChar(50), price)
      .query(`
        INSERT INTO Products (ProductName, Description, ImageURL, Price)
        VALUES (@ProductName, @Description, @ImageURL, @Price)
      `);
    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product', error: err.message });
  }
});

// ✏️ PUT: Edit product (base64 image)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, image, price } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ProductID', sql.Int, id)
      .input('ProductName', sql.NVarChar(100), name)
      .input('Description', sql.NVarChar(sql.MAX), description)
      .input('ImageURL', sql.NVarChar(sql.MAX), image)
      .input('Price', sql.NVarChar(50), price)
      .query(`
        UPDATE Products
        SET ProductName = @ProductName,
            Description = @Description,
            ImageURL = @ImageURL,
            Price = @Price
        WHERE ProductID = @ProductID
      `);
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
});

// 🗑 DELETE: Product + Reviews
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request().input('ProductID', sql.Int, id).query('DELETE FROM Reviews WHERE ProductID = @ProductID');
    await pool.request().input('ProductID', sql.Int, id).query('DELETE FROM Products WHERE ProductID = @ProductID');
    res.json({ message: 'Product and reviews deleted successfully' });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

// 📍 GET: Product by name
router.get('/name/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductName', sql.NVarChar(100), name)
      .query(`SELECT * FROM Products WHERE ProductName = @ProductName`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 🗑 DELETE: Delete review (admin)
router.delete("/reviews/:reviewId", verifyToken, isAdmin, async (req, res) => {
  const { reviewId } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request().input("ReviewID", sql.Int, reviewId).query("DELETE FROM Reviews WHERE ReviewID = @ReviewID");
    res.json({ message: "Review deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting review:", err);
    res.status(500).json({ message: "Failed to delete review" });
  }
});

// ✏️ PUT: Edit review (admin)
router.put('/reviews/:reviewId', verifyToken, isAdmin, async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("ReviewID", sql.Int, reviewId)
      .input("Rating", sql.Int, rating)
      .input("Comment", sql.NVarChar(sql.MAX), comment)
      .query(`
        UPDATE Reviews
        SET Rating = @Rating,
            Comment = @Comment
        WHERE ReviewID = @ReviewID
      `);
    res.json({ message: "Review updated successfully." });
  } catch (err) {
    console.error("❌ Error updating review:", err);
    res.status(500).json({ message: "Failed to update review" });
  }
});

// ✏️ PUT: Save Key Features
router.put('/:id/features', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { features } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("ProductID", sql.Int, id)
      .input("KeyFeatures", sql.NVarChar(sql.MAX), features)
      .query(`
        UPDATE Products SET KeyFeatures = @KeyFeatures WHERE ProductID = @ProductID
      `);
    res.json({ message: "Key Features saved successfully." });
  } catch (err) {
    console.error("❌ Error saving Key Features:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
