const nodemailer = require('nodemailer');

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

async function sendOtp({ to, otp, purpose }) {
  const transporter = getTransporter();
  if (!transporter) {
    const error = new Error('Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: purpose === 'password_reset' ? 'EduPredict password reset code' : 'EduPredict verification code',
    text: `Your EduPredict verification code is ${otp}. It expires in 10 minutes and can be used once.`
  });
}

async function sendPasswordResetLink({ to, token }) {
  const transporter = getTransporter();
  if (!transporter) {
    const error = new Error('Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'EduPredict password reset',
    text: `Reset your EduPredict password here: ${baseUrl}/reset-password?token=${encodeURIComponent(token)}`
  });
}

module.exports = { sendOtp, sendPasswordResetLink };
