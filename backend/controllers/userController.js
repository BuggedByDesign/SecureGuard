const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔐 Смяна на парола – проверка на текуща и смяна
async function requestChangePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Fill in all fields." });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .query("SELECT Password FROM Users WHERE UserID = @UserID");

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(currentPassword, user.Password);
    if (!isMatch) return res.status(401).json({ message: "Wrong current password." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("Password", sql.NVarChar, hashed)
      .query("UPDATE Users SET Password = @Password WHERE UserID = @UserID");

    return res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("❌ Password change error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// 🔁 Потвърждение на парола (по избор)
async function confirmChangePassword(req, res) {
  return res.json({ message: "ConfirmChangePassword not implemented." });
}

// 📧 Заявка за смяна на имейл – изпраща OTP към новия имейл
async function requestChangeEmail(req, res) {
  const { newEmail } = req.body;
  const userId = req.user.id;

  if (!newEmail) return res.status(400).json({ message: "New email is required" });

  try {
    const pool = await poolPromise;

    const check = await pool
      .request()
      .input("Email", sql.NVarChar, newEmail)
      .query("SELECT * FROM Users WHERE Email = @Email");

    if (check.recordset.length)
      return res.status(400).json({ message: "This email is already in use." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("OtpCode", sql.NVarChar, otp)
      .input("Expiry", sql.DateTime, expires)
      .input("Purpose", sql.NVarChar, "change-email")
      .input("EmailTarget", sql.NVarChar, newEmail)
      .query(`
        MERGE INTO OTPs AS target
        USING (SELECT @UserID AS UserID, @Purpose AS Purpose) AS source
        ON (target.UserID = source.UserID AND target.Purpose = source.Purpose)
        WHEN MATCHED THEN
          UPDATE SET OtpCode = @OtpCode, ExpiresAt = @Expiry, EmailTarget = @EmailTarget
        WHEN NOT MATCHED THEN
          INSERT (UserID, OtpCode, ExpiresAt, Purpose, EmailTarget)
          VALUES (@UserID, @OtpCode, @Expiry, @Purpose, @EmailTarget);
      `);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newEmail,
      subject: "Email Change Verification Code",
      html: `<p>Your email verification code is: <b>${otp}</b>. Expires in 5 minutes.</p>`,
    });

    return res.status(200).json({ message: "Verification code sent to new email." });
  } catch (err) {
    console.error("❌ requestChangeEmail:", err);
    return res.status(500).json({ message: "Could not send verification code." });
  }
}

// ✅ Потвърждение на смяна на имейл
async function confirmChangeEmail(req, res) {
  const { otp } = req.body;
  const userId = req.user.id;

  if (!otp) return res.status(400).json({ message: "OTP is required" });

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("Purpose", sql.NVarChar, "change-email")
      .query("SELECT * FROM OTPs WHERE UserID = @UserID AND Purpose = @Purpose");

    const record = result.recordset[0];
    if (!record || record.OtpCode !== otp)
      return res.status(400).json({ message: "Invalid code." });

    if (new Date(record.ExpiresAt) < new Date())
      return res.status(403).json({ message: "Code expired." });

    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("Email", sql.NVarChar, record.EmailTarget)
      .query("UPDATE Users SET Email = @Email WHERE UserID = @UserID");

    return res.status(200).json({ message: "Email changed successfully." });
  } catch (err) {
    console.error("❌ confirmChangeEmail:", err);
    return res.status(500).json({ message: "Could not change email." });
  }
}

module.exports = {
  requestChangePassword,
  confirmChangePassword,
  requestChangeEmail,
  confirmChangeEmail,
};
