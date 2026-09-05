const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Teacher routes for assessment management
router.post('/', authenticateToken, authorizeRoles('teacher'), assessmentController.createAssessment);
router.get('/', authenticateToken, authorizeRoles('teacher', 'admin'), assessmentController.getAssessments);
router.get('/:assessmentId', authenticateToken, assessmentController.getAssessmentDetails);
router.patch('/:assessmentId', authenticateToken, authorizeRoles('teacher'), assessmentController.updateAssessment);
router.delete('/:assessmentId', authenticateToken, authorizeRoles('teacher'), assessmentController.deleteAssessment);

// Question management
router.post('/:assessmentId/questions', authenticateToken, authorizeRoles('teacher'), assessmentController.addQuestion);
router.get('/:assessmentId/questions', authenticateToken, assessmentController.getQuestions);
router.patch('/questions/:questionId', authenticateToken, authorizeRoles('teacher'), assessmentController.updateQuestion);
router.delete('/questions/:questionId', authenticateToken, authorizeRoles('teacher'), assessmentController.deleteQuestion);

// Question bank (public questions for reuse)
router.get('/bank/all', authenticateToken, authorizeRoles('teacher', 'admin'), assessmentController.getQuestionBank);
router.post('/bank/add', authenticateToken, authorizeRoles('teacher'), assessmentController.addToQuestionBank);

// Assessment publishing and results
router.patch('/:assessmentId/publish', authenticateToken, authorizeRoles('teacher'), assessmentController.publishAssessment);
router.get('/:assessmentId/results', authenticateToken, authorizeRoles('teacher'), assessmentController.getAssessmentResults);

module.exports = router;
