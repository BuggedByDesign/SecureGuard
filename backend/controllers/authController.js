const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");

// Configure your mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// LOGIN STEP 1 – Password check + send OTP
async function loginUser(req, res) {
  const { fullName, password } = req.body;
  if (!fullName || !password) {
    return res.status(400).json({ message: "Please enter your name and password." });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("FullName", sql.NVarChar, fullName)
      .query("SELECT * FROM Users WHERE FullName = @FullName");

    const user = result.recordset[0];
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.IsBlocked) return res.status(403).json({ message: "Your account has been blocked." });
    if (!user.EmailConfirmed) return res.status(403).json({ message: "Please confirm your email first." });

    const match = await bcrypt.compare(password, user.Password);
    if (!match) return res.status(401).json({ message: "Incorrect password." });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP (MERGE upsert)
    await pool
      .request()
      .input("UserID", sql.Int, user.UserID)
      .input("OtpCode", sql.NVarChar, otp)
      .input("Expiry", sql.DateTime, expires)
      .query(`
        MERGE INTO OTPs AS target
        USING (SELECT @UserID AS UserID) AS source
        ON (target.UserID = source.UserID)
        WHEN MATCHED THEN
          UPDATE SET OtpCode = @OtpCode, ExpiresAt = @Expiry
        WHEN NOT MATCHED THEN
          INSERT (UserID, OtpCode, ExpiresAt)
          VALUES (@UserID, @OtpCode, @Expiry);
      `);

    // Send email or log OTP for admin/dev
    if (user.IsAdmin && user.Email.endsWith("@site.local")) {
      console.log(`🧪 [DEV MODE] OTP for ADMIN ${user.Email}: ${otp}`);
    } else {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.Email,
        subject: "Your 2FA Code",
        html: `<p>Your verification code is: <b>${otp}</b><br/>It will expire in 5 minutes.</p>`,
      });
    }

    return res.status(200).json({ message: "OTP sent to your email.", userId: user.UserID });
  } catch (err) {
    console.error("❌ Login 2FA error:", err);
    return res.status(500).json({ message: "An error occurred during login." });
  }
}

// VERIFY OTP STEP 2
async function verifyOtpCode(req, res) {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ message: "Missing OTP or user ID." });

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .query("SELECT * FROM OTPs WHERE UserID = @UserID");

    const record = result.recordset[0];
    if (!record || record.OtpCode !== otp) {
      return res.status(401).json({ message: "Invalid OTP code." });
    }

    if (new Date(record.ExpiresAt) < new Date()) {
      return res.status(403).json({ message: "OTP code expired." });
    }

    const userRes = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .query("SELECT * FROM Users WHERE UserID = @UserID");
    const user = userRes.recordset[0];

    await pool
      .request()
      .input("UserID", sql.Int, user.UserID)
      .query("UPDATE Users SET IsOnline = 1 WHERE UserID = @UserID");

    const token = jwt.sign(
      { id: user.UserID, fullName: user.FullName, isAdmin: user.IsAdmin, isBlocked: user.IsBlocked },
      process.env.JWT_SECRET || "RickRoll",
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.UserID },
      process.env.JWT_REFRESH_SECRET || "RefreshSecret",
      { expiresIn: "7d" }
    );

    await pool
      .request()
      .input("UserID", sql.Int, user.UserID)
      .input("Token", sql.NVarChar, refreshToken)
      .query("INSERT INTO RefreshTokens (UserID, Token) VALUES (@UserID, @Token)");

    return res.status(200).json({
      message: "Login successful.",
      token,
      refreshToken,
      user: {
        id: user.UserID,
        fullName: user.FullName,
        isAdmin: user.IsAdmin,
        isBlocked: user.IsBlocked,
      },
    });
  } catch (err) {
    console.error("❌ OTP verification error:", err);
    return res.status(500).json({ message: "Error verifying OTP." });
  }
}

// REGISTER USER
async function registerUser(req, res) {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  const tempDomains = [];
  const domain = email.split("@")[1].toLowerCase();
  if (tempDomains.includes(domain)) {
    return res.status(400).json({ message: "Please use a real email address." });
  }

  try {
    const pool = await poolPromise;
    const check = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email = @Email");

    const existing = check.recordset[0];
    if (existing) {
      if (!existing.EmailConfirmed) {
        const tok = jwt.sign({ email }, process.env.JWT_SECRET || "RickRoll", { expiresIn: "1d" });
        const link = `http://localhost:5000/api/auth/verify-email?token=${tok}`;
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Resend Confirmation Email",
          html: `<a href="${link}">${link}</a>`,
        });
        return res.status(200).json({ message: "A new confirmation link has been sent." });
      }
      return res.status(400).json({ message: "This email is already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool
      .request()
      .input("FullName", sql.NVarChar, fullName)
      .input("Email", sql.NVarChar, email)
      .input("Password", sql.NVarChar, hashed)
      .query(
        `INSERT INTO Users (FullName, Email, Password, IsAdmin, IsOnline, EmailConfirmed, IsBlocked)
         VALUES (@FullName, @Email, @Password, 0, 0, 0, 0)`
      );

    const tok = jwt.sign({ email }, process.env.JWT_SECRET || "RickRoll", { expiresIn: "1d" });
    const link = `http://localhost:5000/api/auth/verify-email?token=${tok}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Confirmation",
      html: `<a href="${link}">${link}</a>`,
    });

    return res.status(201).json({ message: "Registration successful! Please check your email." });
  } catch (err) {
    console.error("❌ Registration error:", err);
    return res.status(500).json({ message: "Registration error." });
  }
}

// VERIFY EMAIL
async function verifyEmail(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  try {
    const dec = jwt.verify(token, process.env.JWT_SECRET || "RickRoll");
    const pool = await poolPromise;
    await pool
      .request()
      .input("Email", sql.NVarChar, dec.email)
      .query("UPDATE Users SET EmailConfirmed = 1 WHERE Email = @Email");

    return res.sendFile(path.join(__dirname, "../public/email-confirm.html"));
  } catch {
    return res.status(400).send("Invalid or expired link.");
  }
}

// LOGOUT
async function logoutUser(req, res) {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("UserID", sql.Int, req.user.id)
      .query("UPDATE Users SET IsOnline = 0 WHERE UserID = @UserID");

    await pool
      .request()
      .input("UserID", sql.Int, req.user.id)
      .query("DELETE FROM RefreshTokens WHERE UserID = @UserID");

    return res.json({ message: "Logout successful." });
  } catch (err) {
    console.error("❌ Logout error:", err);
    return res.status(500).json({ message: "Logout failed." });
  }
}

// LOGOUT BEACON
async function logoutBeacon(req, res) {
  try {
    const userId = parseInt(req.body.userId, 10) || parseInt(req.headers["x-user-id"], 10);
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const pool = await poolPromise;
    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .query("UPDATE Users SET IsOnline = 0 WHERE UserID = @UserID");

    console.log("✅ Beacon logout for user", userId);
    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Beacon logout error:", err);
    return res.sendStatus(500);
  }
}

// RESEND OTP
async function resendOtp(req, res) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "Missing user ID" });

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .query("SELECT Email FROM Users WHERE UserID = @UserID");

    const user = result.recordset[0];
    if (!user) return res.status(404).json({ message: "User not found." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("OtpCode", sql.NVarChar, otp)
      .input("Expiry", sql.DateTime, expires)
      .query(`
        MERGE INTO OTPs AS target
        USING (SELECT @UserID AS UserID) AS source
        ON (target.UserID = source.UserID)
        WHEN MATCHED THEN
          UPDATE SET OtpCode = @OtpCode, ExpiresAt = @Expiry
        WHEN NOT MATCHED THEN
          INSERT (UserID, OtpCode, ExpiresAt)
          VALUES (@UserID, @OtpCode, @Expiry);
      `);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.Email,
      subject: "Your 2FA Code (Resent)",
      html: `<p>Your new verification code is: <b>${otp}</b><br/>It will expire in 5 minutes.</p>`,
    });

    return res.status(200).json({ message: "A new OTP was sent to your email." });
  } catch (err) {
    console.error("❌ Resend OTP error:", err);
    return res.status(500).json({ message: "Failed to resend OTP." });
  }
}

// REFRESH ACCESS TOKEN
async function refreshAccessToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Missing refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "RefreshSecret");
    const pool = await poolPromise;

    const dbCheck = await pool
      .request()
      .input("UserID", sql.Int, decoded.id)
      .input("Token", sql.NVarChar, refreshToken)
      .query("SELECT * FROM RefreshTokens WHERE UserID = @UserID AND Token = @Token");
    if (!dbCheck.recordset.length) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const userRes = await pool
      .request()
      .input("UserID", sql.Int, decoded.id)
      .query("SELECT * FROM Users WHERE UserID = @UserID");
    const user = userRes.recordset[0];

    const newToken = jwt.sign(
      {
        id: user.UserID,
        fullName: user.FullName,
        isAdmin: user.IsAdmin,
        isBlocked: user.IsBlocked,
      },
      process.env.JWT_SECRET || "RickRoll",
      { expiresIn: "15m" }
    );
    return res.json({ token: newToken });
  } catch (err) {
    console.error("❌ Refresh token error:", err);
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
}

// EXPORTS
module.exports = {
  loginUser,
  verifyOtpCode,
  registerUser,
  verifyEmail,
  logoutUser,
  logoutBeacon,
  refreshAccessToken,
  resendOtp,
};
