/**
 * Report Routes
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.get('/student/:studentId/scorecard', authenticateToken, reportController.getStudentScorecard);
router.get('/batch/:batchId/export', authenticateToken, reportController.exportBatchReportCSV);

module.exports = router;
