const express = require("express");
const router = express.Router();
const {
  requestChangePassword,
  confirmChangePassword,
  requestChangeEmail,
  confirmChangeEmail,
} = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

// 🔐 Смяна на парола
router.post("/request-change-password", verifyToken, requestChangePassword);

// 📩 Потвърждение на смяна на парола (OTP)
router.post("/confirm-change-password", verifyToken, confirmChangePassword);

// 📧 Смяна на имейл — изпраща OTP код
router.post("/request-change-email", verifyToken, requestChangeEmail);

// ✅ Потвърждаване на нов имейл
router.post("/confirm-change-email", verifyToken, confirmChangeEmail);

module.exports = router;
