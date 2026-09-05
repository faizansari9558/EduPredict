/**
 * Prediction Routes
 * Endpoints for ML Placement Predictions and Explainability
 */

const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/prediction/model-info
 * Get model metadata and metrics
 */
router.get('/model-info', authenticateToken, predictionController.getModelMetadata);

/**
 * GET /api/prediction/student/:studentId
 * Get placement prediction & explainability for student
 */
router.get('/student/:studentId', authenticateToken, predictionController.getStudentPlacementPrediction);

/**
 * POST /api/prediction/batch/:batchId
 * Get batch placement forecast for cohort
 */
router.post('/batch/:batchId', authenticateToken, predictionController.getBatchPlacementForecast);

module.exports = router;
