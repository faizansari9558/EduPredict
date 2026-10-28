const express = require('express');
const {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  uploadDocument,
  getStudentDocuments,
  downloadDocument,
  getPortfolioItems,
  createPortfolioItem,
  getSkills,
  createSkill,
  getAssessmentList,
  startAssessment,
  submitAssessmentResponse,
  submitAssessment
} = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const upload = multer({
  dest: path.resolve(__dirname, '../uploads/.quarantine'),
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype)) return callback(null, true);
    return callback(new Error('Only PDF, JPEG, and PNG documents are allowed.'));
  }
});
fs.mkdirSync(path.resolve(__dirname, '../uploads/.quarantine'), { recursive: true });

// Dashboard
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles('student'),
  getStudentDashboard
);
router.get('/documents/:documentId/download', authenticateToken, downloadDocument);
router.get('/portfolio/:itemType', authenticateToken, authorizeRoles('student'), getPortfolioItems);
router.post('/portfolio/:itemType', authenticateToken, authorizeRoles('student'), createPortfolioItem);
router.get('/skills', authenticateToken, authorizeRoles('student'), getSkills);
router.post('/skills', authenticateToken, authorizeRoles('student'), createSkill);

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
  upload.single('file'),
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
