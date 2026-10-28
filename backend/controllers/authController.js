const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');

function createToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be configured");
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role_name || user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res) {
  return res.status(403).json({success:false,message:'Contact your institutional administrator to create your account.'});
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const identifier = email.trim().toLowerCase();
    const [rows] = await db.query(
      `SELECT u.id, u.email, u.password_hash, r.name AS role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE (u.email = ? OR LOWER(u.user_id_number) = ?) AND u.status = 'active'`,
      [identifier, identifier]
    );
    const user = rows[0];
    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({success:false, message:'Invalid credentials.'});
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(503).json({success:false,message:'Authentication service unavailable.'});
  }
}

async function checkUniversityRecord(req, res) {
  return res.status(503).json({success:false,message:'Email verification is not configured. Contact your administrator.'});
}
async function verifyOtp(req, res) {
  return res.status(503).json({success:false,message:'Email verification is not configured. Contact your administrator.'});
}

async function me(req, res) {
  return res.json({
    success: true,
    user: req.user
  });
}

module.exports = {
  checkUniversityRecord,
  verifyOtp,
  register,
  login,
  me
};
