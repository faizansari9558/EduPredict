const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { sendOtp, sendPasswordResetLink, demoEmailEnabled } = require('../services/emailService');

const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

function createToken(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured');
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role_name || user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function hashToken(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function newOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function unavailableEmail(res, error) {
  if (error.code === 'EMAIL_NOT_CONFIGURED') {
    return res.status(503).json({
      success: false,
      message: 'Email verification is unavailable. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and optionally SMTP_FROM.'
    });
  }
  console.error('Email delivery error:', error);
  return res.status(503).json({ success: false, message: 'Email delivery is temporarily unavailable.' });
}

async function issueOtp(email, purpose) {
  const otp = newOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await db.query(
    `UPDATE auth_otp_challenges SET consumed_at = CURRENT_TIMESTAMP
     WHERE email = ? AND purpose = ? AND consumed_at IS NULL`,
    [email, purpose]
  );
  await db.query(
    `INSERT INTO auth_otp_challenges (email, purpose, otp_hash, expires_at)
     VALUES (?, ?, ?, ?)`,
    [email, purpose, hashToken(otp), expiresAt]
  );
  const delivery = await sendOtp({ to: email, otp, purpose });
  return delivery?.demo ? { otp } : null;
}

async function checkUniversityRecord(req, res) {
  const { email, userIdNumber, fullName } = req.body || {};
  if (!email || !userIdNumber || !fullName) {
    return res.status(400).json({ success: false, message: 'Email, university ID, and full name are required.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [existingUsers] = await db.query(
      `SELECT id FROM users
       WHERE email = ? AND LOWER(user_id_number) = ?`,
      [normalizedEmail, userIdNumber.trim().toLowerCase()]
    );
    if (existingUsers.length) {
      return res.status(409).json({
        success: false,
        message: 'This university identity already has an account. Please sign in instead of registering again.'
      });
    }
    const [rows] = await db.query(
      `SELECT email, user_id_number, full_name, consumed_user_id
       FROM institutional_identity_records
       WHERE email = ? AND LOWER(user_id_number) = ? AND LOWER(full_name) = LOWER(?)`,
      [normalizedEmail, userIdNumber.trim().toLowerCase(), fullName.trim()]
    );
    if (!rows.length || rows[0].consumed_user_id) {
      return res.status(404).json({ success: false, message: 'The supplied institutional identity could not be verified.' });
    }

    const demo = await issueOtp(normalizedEmail, 'onboarding');
    return res.json({
      success: true,
      message: 'A verification code was sent to the institutional email address.',
      ...(demoEmailEnabled() && demo ? { demoOtp: demo.otp, demoOnly: true } : {})
    });
  } catch (error) {
    return unavailableEmail(res, error);
  }
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body || {};
  if (!email || !/^\d{6}$/.test(String(otp || ''))) {
    return res.status(400).json({ success: false, message: 'A valid six-digit verification code is required.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await db.query(
      `SELECT id, otp_hash, expires_at, attempts
       FROM auth_otp_challenges
       WHERE email = ? AND purpose = 'onboarding' AND consumed_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail]
    );
    const challenge = rows[0];
    if (!challenge || new Date(challenge.expires_at) <= new Date() || challenge.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(400).json({ success: false, message: 'The verification code is expired or unavailable.' });
    }
    if (hashToken(String(otp)) !== challenge.otp_hash) {
      await db.query('UPDATE auth_otp_challenges SET attempts = attempts + 1 WHERE id = ?', [challenge.id]);
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await db.query(
      'UPDATE auth_otp_challenges SET verification_token_hash = ? WHERE id = ?',
      [hashToken(verificationToken), challenge.id]
    );
    return res.json({ success: true, message: 'Email verified. You may now activate your account.', verificationToken });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(503).json({ success: false, message: 'Authentication service unavailable.' });
  }
}

async function register(req, res) {
  const { email, userIdNumber, fullName, password, verificationToken } = req.body || {};
  if (!email || !userIdNumber || !fullName || !password || !verificationToken) {
    return res.status(400).json({ success: false, message: 'Verified identity, password, and verification token are required.' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
  }

  let connection;
  try {
    const normalizedEmail = email.trim().toLowerCase();
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [records] = await connection.query(
      `SELECT i.*, r.id AS role_id
       FROM institutional_identity_records i
       JOIN roles r ON r.name = i.role_name
       WHERE i.email = ? AND LOWER(i.user_id_number) = ? AND i.consumed_user_id IS NULL
       FOR UPDATE`,
      [normalizedEmail, userIdNumber.trim().toLowerCase()]
    );
    const [proofs] = await connection.query(
      `SELECT id FROM auth_otp_challenges
       WHERE email = ? AND purpose = 'onboarding' AND verification_token_hash = ?
         AND consumed_at IS NULL AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
      [normalizedEmail, hashToken(verificationToken)]
    );
    if (!records.length || !proofs.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Identity verification is missing or expired.' });
    }

    const record = records[0];
    const passwordHash = await hashPassword(password);
    const [result] = await connection.query(
      `INSERT INTO users (role_id, email, password_hash, user_id_number, full_name, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [record.role_id, record.email, passwordHash, record.user_id_number, record.full_name]
    );
    if (record.role_name === 'student') {
      if (!record.department_id || !record.batch_id) {
        await connection.rollback();
        return res.status(409).json({ success: false, message: 'The institutional record is missing student placement data.' });
      }
      await connection.query(
        `INSERT INTO students (user_id, batch_id, department_id, enrollment_number)
         VALUES (?, ?, ?, ?)`,
        [result.insertId, record.batch_id, record.department_id, record.user_id_number]
      );
    }
    await connection.query('UPDATE institutional_identity_records SET consumed_user_id = ? WHERE id = ?', [result.insertId, record.id]);
    await connection.query('UPDATE auth_otp_challenges SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?', [proofs[0].id]);
    await connection.commit();
    return res.status(201).json({ success: true, message: 'Account activated successfully.' });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'An account already exists for this institutional identity.' });
    }
    console.error('Registration error:', error);
    return res.status(503).json({ success: false, message: 'Account activation is temporarily unavailable.' });
  } finally {
    if (connection) connection.release();
  }
}

async function requestPasswordReset(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
  try {
    const [users] = await db.query(
      `SELECT u.id, u.email FROM users u WHERE u.email = ? AND u.status = 'active'`,
      [email]
    );
    if (users.length) {
      const token = crypto.randomBytes(32).toString('hex');
      await db.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))`,
        [users[0].id, hashToken(token)]
      );
      const delivery = await sendPasswordResetLink({ to: users[0].email, token });
      if (demoEmailEnabled() && delivery?.demo) {
        return res.json({
          success: true,
          message: 'Demo reset email generated for local development.',
          demoResetUrl: delivery.resetUrl,
          demoOnly: true
        });
      }
    }
    return res.json({ success: true, message: 'If the account exists, a reset link has been sent.' });
  } catch (error) {
    return unavailableEmail(res, error);
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body || {};
  if (!token || !password || String(password).length < 8) {
    return res.status(400).json({ success: false, message: 'A valid reset token and password of at least 8 characters are required.' });
  }
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
       FOR UPDATE`,
      [hashToken(token)]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'The reset link is invalid or expired.' });
    }
    await connection.query('UPDATE users SET password_hash = ? WHERE id = ?', [await hashPassword(password), rows[0].user_id]);
    await connection.query('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [rows[0].id]);
    await connection.commit();
    return res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Password reset error:', error);
    return res.status(503).json({ success: false, message: 'Password reset is temporarily unavailable.' });
  } finally {
    if (connection) connection.release();
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email or university ID and password are required.' });
    const identifier = email.trim().toLowerCase();
    const [rows] = await db.query(
      `SELECT u.id, u.email, u.password_hash, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE (u.email = ? OR LOWER(u.user_id_number) = ?) AND u.status = 'active'`,
      [identifier, identifier]
    );
    const user = rows[0];
    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    return res.json({
      success: true,
      message: 'Login successful.',
      token: createToken(user),
      user: { id: user.id, email: user.email, role: user.role_name }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(503).json({ success: false, message: 'Authentication service unavailable.' });
  }
}

async function me(req, res) {
  return res.json({ success: true, user: req.user });
}

module.exports = {
  checkUniversityRecord, verifyOtp, register, requestPasswordReset, resetPassword, login, me
};
