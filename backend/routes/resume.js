/**
 * Resume Routes
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticateToken } = require('../middleware/auth');

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const allowedMimeTypes = {
      '.pdf': ['application/pdf', 'application/octet-stream'],
      '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream'],
      '.txt': ['text/plain', 'application/octet-stream']
    };
    if (allowedMimeTypes[extension]?.includes(file.mimetype)) return callback(null, true);
    return callback(new Error('Upload a PDF, DOCX, or TXT resume.'));
  }
}).single('resume_file');

function handleResumeUpload(req, res, next) {
  resumeUpload(req, res, (error) => {
    if (!error) return next();
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ success: false, message: error.message });
  });
}

/**
 * POST /api/student/resume/analyze
 */
router.post('/analyze', authenticateToken, handleResumeUpload, resumeController.analyzeResume);

module.exports = router;
