/**
 * Career AI Controller
 * Handles context-aware chat, mock interview generation, roadmap generation, and cover letters.
 */

const pool = require('../config/db');
const careerAiService = require('../services/careerAiService');

/**
 * Helper to fetch student profile metadata
 */
async function getStudentProfileContext(studentId) {
  const [rows] = await pool.query(`
    SELECT u.id, u.full_name, u.email, s.cgpa, s.department_id, sm.placement_ready_score
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN student_metrics sm ON u.id = sm.student_id
    WHERE u.id = ?
  `, [studentId]);

  if (rows.length === 0) return null;

  const [skills] = await pool.query(
    'SELECT skill_name FROM skill_proficiency WHERE student_id = ?',
    [studentId]
  );

  const r = rows[0];
  const prob = Number(r.placement_ready_score) || 70;
  let tier = 'Standard';
  if (prob >= 85) tier = 'Super Dream';
  else if (prob >= 70) tier = 'Dream';

  return {
    id: r.id,
    name: r.full_name,
    email: r.email,
    cgpa: r.cgpa || 7.5,
    placement_tier: tier,
    skills: skills.map(s => s.skill_name)
  };
}

/**
 * POST /api/career-ai/chat
 */
exports.chatWithCareerAi = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const profile = await getStudentProfileContext(studentId);
    const response = await careerAiService.generateChatResponse(profile, message, history);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Career AI chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/career-ai/mock-questions
 */
exports.getMockInterviewQuestions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { role, difficulty } = req.body;

    const profile = await getStudentProfileContext(studentId);
    const questions = await careerAiService.generateMockInterviewQuestions(
      profile,
      role || 'Software Engineer',
      difficulty || 'Medium'
    );

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/career-ai/roadmap
 */
exports.getCareerRoadmap = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { target_goal } = req.body;

    const profile = await getStudentProfileContext(studentId);
    const roadmap = await careerAiService.generateRoadmap(profile, target_goal || 'Full-Stack Developer');

    res.json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/career-ai/cover-letter
 */
exports.getCoverLetter = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { company_name, job_title } = req.body;

    const profile = await getStudentProfileContext(studentId);
    const letter = await careerAiService.generateCoverLetter(
      profile,
      company_name || 'Innovate Tech',
      job_title || 'Software Development Engineer'
    );

    res.json({
      success: true,
      data: letter
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
