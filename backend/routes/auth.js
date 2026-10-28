const express = require('express');
const { checkUniversityRecord, verifyOtp, register, login, me } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/check-record', checkUniversityRecord);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, me);

module.exports = router;
