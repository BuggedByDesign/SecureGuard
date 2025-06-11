const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Липсва токен" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "RickRoll");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Невалиден токен" });
  }
}

function isAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Админ достъп изисква се." });
  }
}


module.exports = { verifyToken, isAdmin };
