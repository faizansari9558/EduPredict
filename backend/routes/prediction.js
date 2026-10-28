/**
 * Prediction Routes
 * Endpoints for ML Placement Predictions and Explainability
 */

const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * GET /api/prediction/model-info
 * Get model metadata and metrics
 */
router.get('/model-info', authenticateToken, predictionController.getModelMetadata);

/**
 * GET /api/prediction/student/:studentId
 * Get placement prediction & explainability for student
 */
router.get('/student/:studentId', authenticateToken, async (req,res,next) => {
 if(req.user.role === 'admin' || (req.user.role === 'student' && Number(req.params.studentId) === Number(req.user.id))) return next();
 return res.status(403).json({success:false,message:'Access denied.'});
}, predictionController.getStudentPlacementPrediction);

/**
 * POST /api/prediction/batch/:batchId
 * Get batch placement forecast for cohort
 */
router.post('/batch/:batchId', authenticateToken, authorizeRoles('admin'), predictionController.getBatchPlacementForecast);

module.exports = router;
