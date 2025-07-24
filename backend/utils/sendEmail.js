const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"SecureGuard" <${process.env.EMAIL_USER}>`,
      to,                  // тук подаваш email-а на потребителя
      subject,
      text,
    });
    console.log(`📨 Имейл изпратен: ${subject} до ${to}`);
  } catch (err) {
    console.error("❌ Неуспешен опит за изпращане на имейл:", err.message);
  }
};

module.exports = sendEmail;
