const express = require('express');
const {
  getTeacherDashboard,
  getTeacherStudents,
  getStudentDetails,
  createAssessment,
  getTeacherAssessments,
  publishAssessment,
  getAssessmentResults,
  submitStudentVerification
} = require('../controllers/teacherController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Dashboard
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles('teacher'),
  getTeacherDashboard
);

// Student Management
router.get(
  '/students',
  authenticateToken,
  authorizeRoles('teacher'),
  getTeacherStudents
);

router.get(
  '/students/:studentId',
  authenticateToken,
  authorizeRoles('teacher'),
  getStudentDetails
);

router.patch(
  '/students/:studentId/verify',
  authenticateToken,
  authorizeRoles('teacher'),
  submitStudentVerification
);

// Assessment Management
router.post(
  '/assessments',
  authenticateToken,
  authorizeRoles('teacher'),
  createAssessment
);

router.get(
  '/assessments',
  authenticateToken,
  authorizeRoles('teacher'),
  getTeacherAssessments
);

router.patch(
  '/assessments/:assessmentId/publish',
  authenticateToken,
  authorizeRoles('teacher'),
  publishAssessment
);

router.get(
  '/assessments/:assessmentId/results',
  authenticateToken,
  authorizeRoles('teacher'),
  getAssessmentResults
);

const review = require('../controllers/documentReviewController');
router.get('/verifications',authenticateToken,authorizeRoles('teacher'),review.list);
router.put('/verifications/:itemId',authenticateToken,authorizeRoles('teacher'),review.review);
module.exports = router;
