const express = require('express');
const {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  updateAcademicRecords,
  uploadDocument,
  getStudentDocuments,
  downloadDocument,
  getPortfolioItems,
  createPortfolioItem,
  getSkills,
  createSkill,
  getStudentResults,
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

const academicRecordUpload = upload.fields([
  { name: 'cgpa_document', maxCount: 1 },
  { name: 'tenth_document', maxCount: 1 },
  { name: 'twelfth_document', maxCount: 1 },
  { name: 'graduation_document', maxCount: 1 }
]);
const portfolioCertificateUpload = upload.single('certificate');
function handleAcademicRecordUpload(req, res, next) {
  academicRecordUpload(req, res, (error) => {
    if (!error) return next();
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ success: false, message: error.message });
  });
}
function handlePortfolioCertificateUpload(req, res, next) {
  portfolioCertificateUpload(req, res, (error) => {
    if (!error) return next();
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ success: false, message: error.message });
  });
}

// Dashboard
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles('student'),
  getStudentDashboard
);
router.get('/documents/:documentId/download', authenticateToken, downloadDocument);
router.get('/portfolio/:itemType', authenticateToken, authorizeRoles('student'), getPortfolioItems);
router.post(
  '/portfolio/:itemType',
  authenticateToken,
  authorizeRoles('student'),
  handlePortfolioCertificateUpload,
  createPortfolioItem
);
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
router.put(
  '/academic-records',
  authenticateToken,
  authorizeRoles('student'),
  handleAcademicRecordUpload,
  updateAcademicRecords
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
router.get('/results', authenticateToken, authorizeRoles('student'), getStudentResults);

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
