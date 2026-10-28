const jwt = require('jsonwebtoken');
const db = require('../config/db');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required.'
    });
  }

  try {
    if (!process.env.JWT_SECRET) return res.status(503).json({success:false,message:'Authentication is not configured.'});
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {algorithms:['HS256']});
    const [users] = await db.query(`SELECT u.id,u.email,r.name AS role FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=? AND u.status='active'`, [decoded.id]);
    if (!users.length) return res.status(401).json({success:false,message:'Account is unavailable.'});
    req.user = users[0];
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.'
      });
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
