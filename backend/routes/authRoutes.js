const express = require("express");
const router = express.Router();

const {
  loginUser,
  registerUser,
  verifyEmail,
  logoutUser,
  logoutBeacon,
  refreshAccessToken,
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

// 🔐 Authentication Routes
router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/logout", verifyToken, logoutUser);
router.post("/logout-beacon", logoutBeacon);
router.post("/refresh-token", refreshAccessToken);

module.exports = router;