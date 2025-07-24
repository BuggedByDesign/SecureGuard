// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const { poolPromise } = require("./config/db");
const sendEmail = require("./utils/sendEmail");

const app = express();
const PORT = process.env.PORT || 5000;

// ——— Middleware ———
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// ——— Rate limiter ———
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});

// ——— Routers ———
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const newsRoutes = require("./routes/newsRoutes");
const productFeaturesRoutes = require("./routes/productFeaturesRoutes");
const subscribeRoute = require("./routes/subscribe");
const reportRoutes = require("./routes/reports");
const reviewsRoute = require("./routes/reviews");
const expertRoutes = require("./routes/expertRoutes");
const historyRoutes = require("./routes/historyRoutes");
const profileRoutes = require("./routes/profile");
const favoriteRoutes = require("./routes/favorites");
const fileScanRouter = require("./routes/scan");
const urlScanRouter = require("./routes/urlScan");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiService");
// ——— Routes usage ———
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/product", productFeaturesRoutes);
app.use("/api/subscribe", subscribeRoute);
app.use("/api/reports", reportRoutes);
app.use("/api/reviews", reviewsRoute);
app.use("/api/expert", expertRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/scan", fileScanRouter);
app.use("/api/url-scan", urlScanRouter);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);


// ——— Test email endpoint ———
app.get("/api/test-email", async (req, res) => {
  try {
    await sendEmail("SecureGuard Notification", "This is a test email.");
    res.send("Test email sent!");
  } catch (err) {
    console.error("Test-email error:", err);
    res.status(500).send("Email failed.");
  }
});

// ——— Health check ———
app.get("/", (req, res) => res.send("✅ Server is up"));

// ——— Cleanup old browsing history daily ———
cron.schedule("0 2 * * *", async () => {
  try {
    const pool = await poolPromise;
    await pool.request().query(`
      DELETE FROM BrowsingHistory
      WHERE ViewedAt < DATEADD(DAY, -2, GETDATE())
    `);
    console.log("🧹 Old history cleaned");
  } catch (err) {
    console.error("Cleanup error:", err);
  }
});

// ——— Start server ———
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
