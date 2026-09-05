/**
 * Career AI Routes
 */

const express = require('express');
const router = express.Router();
const careerAiController = require('../controllers/careerAiController');
const { authenticateToken } = require('../middleware/auth');

router.post('/chat', authenticateToken, careerAiController.chatWithCareerAi);
router.post('/mock-questions', authenticateToken, careerAiController.getMockInterviewQuestions);
router.post('/roadmap', authenticateToken, careerAiController.getCareerRoadmap);
router.post('/cover-letter', authenticateToken, careerAiController.getCoverLetter);

module.exports = router;
