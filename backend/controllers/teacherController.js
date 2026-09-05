const db = require('../config/db');

async function getTeacherDashboard(req, res) {
  try {
    const { id: userId } = req.user;

    // Get teacher's basic info
    const [teacherRows] = await db.query(
      `SELECT t.id, u.full_name, u.email, d.name AS department, t.designation, t.employee_code
       FROM teachers t
       INNER JOIN users u ON u.id = t.user_id
       INNER JOIN departments d ON d.id = t.department_id
       WHERE t.user_id = ?`,
      [userId]
    );

    if (!teacherRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found.'
      });
    }

    const teacher = teacherRows[0];

    // Get count of assigned students
    const [studentCountRows] = await db.query(
      'SELECT COUNT(*) AS count FROM students WHERE department_id = (SELECT department_id FROM teachers WHERE user_id = ?)',
      [userId]
    );

    // Get count of active assessments
    const [assessmentCountRows] = await db.query(
      'SELECT COUNT(*) AS count FROM assessments WHERE created_by = ? AND published_at IS NOT NULL',
      [userId]
    );

    // Get pending verification count
    const [verificationCountRows] = await db.query(
      'SELECT COUNT(*) AS count FROM students WHERE verification_status = "pending" AND department_id = (SELECT department_id FROM teachers WHERE user_id = ?)',
      [userId]
    );

    const summary = {
      assignedStudents: studentCountRows[0]?.count || 0,
      activeAssessments: assessmentCountRows[0]?.count || 0,
      pendingVerifications: verificationCountRows[0]?.count || 0,
      mentorSlots: 8
    };

    return res.json({
      success: true,
      data: {
        teacher,
        summary,
        alerts: [
          'Review 12 student verification requests.',
          'Publish aptitude results for Semester 5.',
          'Schedule mentorship session with batch leads.'
        ]
      }
    });
  } catch (error) {
    console.error('Get teacher dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard.'
    });
  }
}

async function getTeacherStudents(req, res) {
  try {
    const { id: userId } = req.user;
    const { limit = 50, offset = 0 } = req.query;

    const [students] = await db.query(
      `SELECT s.id, s.enrollment_number, u.full_name, u.email, d.name AS department,
              s.verification_status, s.cgpa, s.created_at
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       INNER JOIN departments d ON d.id = s.department_id
       WHERE d.id = (SELECT department_id FROM teachers WHERE user_id = ?)
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    return res.json({
      success: true,
      data: students,
      pagination: { limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get teacher students error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students.'
    });
  }
}

async function getStudentDetails(req, res) {
  try {
    const { studentId } = req.params;
    const { id: userId } = req.user;

    // Verify teacher can access this student
    const [students] = await db.query(
      `SELECT s.id, s.enrollment_number, u.full_name, u.email, d.name AS department,
              s.verification_status, s.cgpa, s.tenth_percentage, s.twelfth_percentage,
              s.graduation_percentage, s.created_at
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       INNER JOIN departments d ON d.id = s.department_id
       WHERE s.id = ? AND d.id = (SELECT department_id FROM teachers WHERE user_id = ?)`,
      [studentId, userId]
    );

    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or you do not have access.'
      });
    }

    return res.json({
      success: true,
      data: students[0]
    });
  } catch (error) {
    console.error('Get student details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student details.'
    });
  }
}

async function submitStudentVerification(req, res) {
  try {
    const { studentId } = req.params;
    const { verification_status, notes } = req.body;
    const { id: userId } = req.user;

    if (!['not_started', 'pending', 'verified', 'rejected'].includes(verification_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status.'
      });
    }

    // Verify teacher can access this student
    const [access] = await db.query(
      `SELECT 1 FROM students s
       INNER JOIN departments d ON d.id = s.department_id
       WHERE s.id = ? AND d.id = (SELECT department_id FROM teachers WHERE user_id = ?)`,
      [studentId, userId]
    );

    if (!access.length) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to verify this student.'
      });
    }

    const [result] = await db.query(
      'UPDATE students SET verification_status = ? WHERE id = ?',
      [verification_status, studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Student verification status updated successfully.'
    });
  } catch (error) {
    console.error('Submit student verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update verification status.'
    });
  }
}

async function createAssessment(req, res) {
  try {
    const { title, description, assessment_type } = req.body;
    const { id: userId } = req.user;

    if (!title || !assessment_type) {
      return res.status(400).json({
        success: false,
        message: 'Assessment title and type are required.'
      });
    }

    if (!['aptitude', 'coding', 'general'].includes(assessment_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment type.'
      });
    }

    const [result] = await db.query(
      'INSERT INTO assessments (title, description, assessment_type, created_by) VALUES (?, ?, ?, ?)',
      [title, description || null, assessment_type, userId]
    );

    return res.status(201).json({
      success: true,
      message: 'Assessment created successfully.',
      data: {
        id: result.insertId,
        title,
        description,
        assessment_type,
        created_by: userId
      }
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create assessment.'
    });
  }
}

async function getTeacherAssessments(req, res) {
  try {
    const { id: userId } = req.user;
    const { limit = 50, offset = 0 } = req.query;

    const [assessments] = await db.query(
      `SELECT id, title, description, assessment_type, published_at, created_at
       FROM assessments
       WHERE created_by = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    return res.json({
      success: true,
      data: assessments,
      pagination: { limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get teacher assessments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessments.'
    });
  }
}

async function publishAssessment(req, res) {
  try {
    const { assessmentId } = req.params;
    const { id: userId } = req.user;

    // Verify teacher owns this assessment
    const [ownership] = await db.query(
      'SELECT id FROM assessments WHERE id = ? AND created_by = ?',
      [assessmentId, userId]
    );

    if (!ownership.length) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to publish this assessment.'
      });
    }

    const [result] = await db.query(
      'UPDATE assessments SET published_at = CURRENT_TIMESTAMP WHERE id = ?',
      [assessmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Assessment published successfully.'
    });
  } catch (error) {
    console.error('Publish assessment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to publish assessment.'
    });
  }
}

async function getAssessmentResults(req, res) {
  try {
    const { assessmentId } = req.params;
    const { id: userId } = req.user;

    // Verify teacher owns this assessment
    const [ownership] = await db.query(
      'SELECT id FROM assessments WHERE id = ? AND created_by = ?',
      [assessmentId, userId]
    );

    if (!ownership.length) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these results.'
      });
    }

    const [results] = await db.query(
      `SELECT a.id, u.full_name, u.email, a.started_at, a.submitted_at, a.score, a.status
       FROM assessment_attempts a
       INNER JOIN users u ON u.id = a.student_user_id
       WHERE a.assessment_id = ?
       ORDER BY a.started_at DESC`,
      [assessmentId]
    );

    return res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Get assessment results error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment results.'
    });
  }
}

module.exports = {
  getTeacherDashboard,
  getTeacherStudents,
  getStudentDetails,
  createAssessment,
  getTeacherAssessments,
  publishAssessment,
  getAssessmentResults,
  submitStudentVerification
};
