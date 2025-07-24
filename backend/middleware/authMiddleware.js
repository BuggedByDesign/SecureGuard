// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");

// ✅ Middleware: Verify JWT Token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "🔒 Missing token" });
  }

  try {
    const secret = process.env.JWT_SECRET || "RickRoll";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    return res.status(403).json({ message: "🔒 Invalid or expired token" });
  }
}

// 🚫 Middleware: Blocked users cannot proceed
function notBlocked(req, res, next) {
  if (req.user?.isBlocked) {
    return res.status(403).json({
      message: "🚫 Your account is blocked due to abuse reports.",
    });
  }
  next();
}

// 🛡 Middleware: Admin-only access
function isAdmin(req, res, next) {
  if (req.user?.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "⛔ Admin access required" });
  }
}

module.exports = {
  verifyToken,
  isAdmin,
  notBlocked,
};
