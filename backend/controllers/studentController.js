const db = require('../config/db');

async function getStudentDashboard(req, res) {
  try {
    const { id: userId } = req.user;

    // Get student's basic info
    const [studentRows] = await db.query(
      `SELECT s.id, u.full_name, u.email, d.name AS department, b.name AS batch,
              s.enrollment_number, s.cgpa, s.verification_status
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       INNER JOIN departments d ON d.id = s.department_id
       INNER JOIN batches b ON b.id = s.batch_id
       WHERE s.user_id = ?`,
      [userId]
    );

    if (!studentRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    const student = studentRows[0];

    // Get profile completion percentage (simple calculation)
    const profileCompletion = student.cgpa ? 82 : 45;

    // Get verified documents count
    const [docsRows] = await db.query(
      'SELECT COUNT(*) AS verified_count FROM documents WHERE user_id = ? AND verification_status = "verified"',
      [userId]
    );

    // Get next assessment
    const [assessmentRows] = await db.query(
      `SELECT id, title, assessment_type FROM assessments
       WHERE published_at IS NOT NULL
       ORDER BY published_at DESC LIMIT 1`
    );

    const summary = {
      cgpa: student.cgpa || '—',
      profileCompletion,
      verifiedDocs: docsRows[0]?.verified_count || 0,
      nextAssessment: assessmentRows.length > 0 ? '2 Days' : 'No upcoming'
    };

    return res.json({
      success: true,
      data: {
        student,
        summary,
        upcoming: [
          'Academic performance review this Friday',
          'Upload internship certificate for verification',
          'Complete aptitude mock assessment'
        ]
      }
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard.'
    });
  }
}

async function getStudentProfile(req, res) {
  try {
    const { id: userId } = req.user;

    const [rows] = await db.query(
      `SELECT s.id, u.full_name, u.email, u.phone_number, d.name AS department, b.name AS batch,
              s.enrollment_number, s.cgpa, s.tenth_percentage, s.twelfth_percentage,
              s.graduation_percentage, s.verification_status, s.created_at
       FROM students s
       INNER JOIN users u ON u.id = s.user_id
       INNER JOIN departments d ON d.id = s.department_id
       INNER JOIN batches b ON b.id = s.batch_id
       WHERE s.user_id = ?`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.'
    });
  }
}

async function updateStudentProfile(req, res) {
  try {
    const { id: userId } = req.user;
    const { tenth_percentage, twelfth_percentage, graduation_percentage } = req.body;

    let query = 'UPDATE students SET ';
    const updates = [];
    const params = [];

    if (tenth_percentage !== undefined) {
      updates.push('tenth_percentage = ?');
      params.push(tenth_percentage);
    }
    if (twelfth_percentage !== undefined) {
      updates.push('twelfth_percentage = ?');
      params.push(twelfth_percentage);
    }
    if (graduation_percentage !== undefined) {
      updates.push('graduation_percentage = ?');
      params.push(graduation_percentage);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update.'
      });
    }

    query += updates.join(', ') + ' WHERE user_id = ?';
    params.push(userId);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully.'
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.'
    });
  }
}

async function uploadDocument(req, res) {
  try {
    const { id: userId } = req.user;
    const { document_type, file_name, mime_type } = req.body;

    if (!document_type || !file_name) {
      return res.status(400).json({
        success: false,
        message: 'Document type and file name are required.'
      });
    }

    const stored_path = `uploads/${userId}/${file_name}`;

    const [result] = await db.query(
      `INSERT INTO documents (user_id, document_type, file_name, stored_path, mime_type)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, document_type, file_name, stored_path, mime_type || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      data: {
        id: result.insertId,
        document_type,
        file_name,
        stored_path
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload document.'
    });
  }
}

async function getStudentDocuments(req, res) {
  try {
    const { id: userId } = req.user;

    const [documents] = await db.query(
      `SELECT id, document_type, file_name, verification_status, created_at
       FROM documents
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get student documents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents.'
    });
  }
}

async function getAssessmentList(req, res) {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const [assessments] = await db.query(
      `SELECT id, title, description, assessment_type, published_at
       FROM assessments
       WHERE published_at IS NOT NULL
       ORDER BY published_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    return res.json({
      success: true,
      data: assessments,
      pagination: { limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Get assessment list error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessments.'
    });
  }
}

async function startAssessment(req, res) {
  try {
    const { assessmentId } = req.params;
    const { id: userId } = req.user;

    // Verify assessment exists and is published
    const [assessmentRows] = await db.query(
      'SELECT id FROM assessments WHERE id = ? AND published_at IS NOT NULL',
      [assessmentId]
    );

    if (!assessmentRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not published.'
      });
    }

    // Create assessment attempt
    const [result] = await db.query(
      `INSERT INTO assessment_attempts (assessment_id, student_user_id, status)
       VALUES (?, ?, 'in_progress')`,
      [assessmentId, userId]
    );

    return res.status(201).json({
      success: true,
      message: 'Assessment started.',
      data: { attempt_id: result.insertId }
    });
  } catch (error) {
    console.error('Start assessment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start assessment.'
    });
  }
}

async function submitAssessmentResponse(req, res) {
  try {
    const { attemptId, questionId, answer_text } = req.body;

    if (!attemptId || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Attempt ID and question ID are required.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO student_assessment_responses (attempt_id, question_id, answer_text)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE answer_text = ?`,
      [attemptId, questionId, answer_text || null, answer_text || null]
    );

    return res.json({
      success: true,
      message: 'Response submitted.'
    });
  } catch (error) {
    console.error('Submit assessment response error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit response.'
    });
  }
}

// Submit assessment (mark as completed)
async function submitAssessment(req, res) {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.id;

    // Verify the attempt belongs to the student
    const [attempt] = await db.query(
      'SELECT id, student_user_id FROM assessment_attempts WHERE id = ?',
      [attemptId]
    );

    if (attempt.length === 0 || attempt[0].student_user_id !== studentId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Update assessment attempt to submitted
    await db.query(
      `UPDATE assessment_attempts 
       SET submitted_at = CURRENT_TIMESTAMP, status = 'submitted'
       WHERE id = ?`,
      [attemptId]
    );

    res.json({ success: true, data: { id: attemptId, submitted: true } });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit assessment' });
  }
}

module.exports = {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  uploadDocument,
  getStudentDocuments,
  getAssessmentList,
  startAssessment,
  submitAssessmentResponse,
  submitAssessment
};
