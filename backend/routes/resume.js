/**
 * Resume Routes
 */

const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/student/resume/analyze
 */
router.post('/analyze', authenticateToken, resumeController.analyzeResume);

module.exports = router;
