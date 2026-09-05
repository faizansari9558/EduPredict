const express = require('express');
const {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  uploadDocument,
  getStudentDocuments,
  getAssessmentList,
  startAssessment,
  submitAssessmentResponse,
  submitAssessment
} = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Dashboard
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles('student'),
  getStudentDashboard
);

// Profile Management
router.get(
  '/profile',
  authenticateToken,
  authorizeRoles('student'),
  getStudentProfile
);

router.patch(
  '/profile',
  authenticateToken,
  authorizeRoles('student'),
  updateStudentProfile
);

// Document Management
router.post(
  '/documents',
  authenticateToken,
  authorizeRoles('student'),
  uploadDocument
);

router.get(
  '/documents',
  authenticateToken,
  authorizeRoles('student'),
  getStudentDocuments
);

// Assessment Management
router.get(
  '/assessments',
  authenticateToken,
  authorizeRoles('student'),
  getAssessmentList
);

router.post(
  '/assessments/:assessmentId/start',
  authenticateToken,
  authorizeRoles('student'),
  startAssessment
);

router.post(
  '/assessments/:assessmentId/response',
  authenticateToken,
  authorizeRoles('student'),
  submitAssessmentResponse
);

router.patch(
  '/assessment/:attemptId/submit',
  authenticateToken,
  authorizeRoles('student'),
  submitAssessment
);

module.exports = router;
