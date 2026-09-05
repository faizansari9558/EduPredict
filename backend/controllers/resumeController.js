/**
 * Resume Controller
 * Handles Resume Parsing, ATS Score evaluation, and Cross-verification
 */

const resumeService = require('../services/resumeService');

/**
 * POST /api/student/resume/analyze
 * Analyzes resume text or structured resume payload
 */
exports.analyzeResume = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { resume_text, target_role } = req.body;

    if (!resume_text || typeof resume_text !== 'string' || resume_text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is required for ATS analysis.'
      });
    }

    const analysis = await resumeService.analyzeResume(
      studentId,
      resume_text,
      target_role || 'Software Development'
    );

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Resume analysis controller error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
