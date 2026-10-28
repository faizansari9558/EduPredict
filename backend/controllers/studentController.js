const path = require('path');
const fs = require('fs/promises');
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

    query += updates.join(', ') + " WHERE user_id = ? AND verification_status <> 'verified'";
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
    const { document_type } = req.body;

    if (!document_type || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Document type and a supported document file are required.'
      });
    }

    const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);
    if (!allowedTypes.has(req.file.mimetype)) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ success: false, message: 'Only PDF, JPEG, and PNG documents are allowed.' });
    }

    const bytes = await fs.readFile(req.file.path);
    const isPdf = req.file.mimetype === 'application/pdf' && bytes.subarray(0, 5).toString() === '%PDF-';
    const isJpeg = req.file.mimetype === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8;
    const isPng = req.file.mimetype === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (!isPdf && !isJpeg && !isPng) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ success: false, message: 'The uploaded content does not match its declared file type.' });
    }

    const userRoot = path.resolve(__dirname, '../uploads', String(userId));
    await fs.mkdir(userRoot, { recursive: true });
    const safeName = `${Date.now()}-${require('crypto').randomBytes(12).toString('hex')}${path.extname(req.file.originalname).toLowerCase()}`;
    const finalPath = path.join(userRoot, safeName);
    await fs.rename(req.file.path, finalPath);
    const stored_path = path.relative(path.resolve(__dirname, '..'), finalPath).replace(/\\/g, '/');

    const [result] = await db.query(
      `INSERT INTO documents (user_id, document_type, file_name, stored_path, mime_type)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, document_type, req.file.originalname, stored_path, req.file.mimetype]
    );

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      data: {
        id: result.insertId,
        document_type,
        file_name: req.file.originalname,
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

  async function downloadDocument(req, res) {
    try {
      const [rows] = await db.query(
        `SELECT file_name, stored_path FROM documents WHERE id = ? AND user_id = ?`,
        [req.params.documentId, req.user.id]
      );
      if (!rows.length) return res.status(404).json({ success: false, message: 'Document not found.' });
      const root = path.resolve(__dirname, '..');
      const filePath = path.resolve(root, rows[0].stored_path);
      if (!filePath.startsWith(`${root}${path.sep}`)) return res.status(400).json({ success: false, message: 'Invalid document path.' });
      await fs.access(filePath);
      return res.download(filePath, rows[0].file_name);
    } catch (error) {
      if (error.code === 'ENOENT') return res.status(404).json({ success: false, message: 'Document file is unavailable.' });
      console.error('Download document error:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve document.' });
    }
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

  async function getPortfolioItems(req, res) {
    const allowedTypes = new Set(['project', 'certification', 'internship']);
    const itemType = req.params.itemType;
    if (!allowedTypes.has(itemType)) return res.status(400).json({ success: false, message: 'Invalid portfolio item type.' });
    try {
      const [rows] = await db.query(
        `SELECT id, payload_json, verification_status, review_notes, created_at, updated_at
         FROM student_portfolio_items WHERE student_id = ? AND item_type = ? ORDER BY created_at DESC`,
        [req.user.id, itemType]
      );
      return res.json({
        success: true,
        data: rows.map(row => ({ id: row.id, ...JSON.parse(row.payload_json), status: row.verification_status, review_notes: row.review_notes, created_at: row.created_at, updated_at: row.updated_at }))
      });
    } catch (error) {
      console.error('Get portfolio items error:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve portfolio items.' });
    }
  }

  async function createPortfolioItem(req, res) {
    const allowedTypes = new Set(['project', 'certification', 'internship']);
    const itemType = req.params.itemType;
    if (!allowedTypes.has(itemType) || !req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid portfolio item.' });
    }

    async function getSkills(req, res) {
      try {
        const [rows] = await db.query(
          `SELECT id, skill_category AS category, skill_name AS name, avg_score AS score,
                  CASE WHEN avg_score >= 80 THEN 'Advanced' WHEN avg_score >= 60 THEN 'Intermediate' ELSE 'Foundational' END AS level
           FROM skill_proficiency WHERE student_id = ? ORDER BY skill_name`,
          [req.user.id]
        );
        return res.json({ success: true, data: rows });
      } catch (error) {
        console.error('Get skills error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve skills.' });
      }
    }

    async function createSkill(req, res) {
      const { category, name } = req.body || {};
      if (!category || !name) return res.status(400).json({ success: false, message: 'Skill category and name are required.' });
      try {
        const [result] = await db.query(
          `INSERT INTO skill_proficiency (student_id, skill_category, skill_name)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE skill_category = VALUES(skill_category)`,
          [req.user.id, category.trim(), name.trim()]
        );
        return res.status(201).json({ success: true, data: { id: result.insertId, category: category.trim(), name: name.trim(), score: 0, level: 'Foundational' } });
      } catch (error) {
        console.error('Create skill error:', error);
        return res.status(500).json({ success: false, message: 'Failed to save skill.' });
      }
    }
    try {
      const [result] = await db.query(
        `INSERT INTO student_portfolio_items (student_id, item_type, payload_json)
         VALUES (?, ?, ?)`,
        [req.user.id, itemType, JSON.stringify(req.body)]
      );
      return res.status(201).json({ success: true, data: { id: result.insertId, ...req.body, status: 'pending' } });
    } catch (error) {
      console.error('Create portfolio item error:', error);
      return res.status(500).json({ success: false, message: 'Failed to save portfolio item.' });
    }
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
      'SELECT id, duration FROM assessments WHERE id = ? AND published_at IS NOT NULL',
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

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + Number(assessmentRows[0].duration || 60) * 60 * 1000);
    return res.status(201).json({
      success: true,
      message: 'Assessment started.',
      data: { attempt_id: result.insertId, started_at: startedAt.toISOString(), expires_at: expiresAt.toISOString() }
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

    const [attempts] = await db.query(
      `SELECT aa.id, aa.status, aa.started_at, a.duration
       FROM assessment_attempts aa JOIN assessments a ON a.id = aa.assessment_id
       WHERE aa.id = ? AND aa.student_user_id = ?`,
      [attemptId, req.user.id]
    );
    const attempt = attempts[0];
    if (!attempt) return res.status(403).json({ success: false, message: 'Assessment attempt is not yours.' });
    if (attempt.status !== 'in_progress') return res.status(409).json({ success: false, message: 'This assessment attempt is already submitted.' });
    if (Date.now() > new Date(attempt.started_at).getTime() + Number(attempt.duration || 60) * 60 * 1000) {
      return res.status(409).json({ success: false, message: 'The assessment time limit has expired.' });
    }
    const [existing] = await db.query(
      'SELECT id FROM student_assessment_responses WHERE attempt_id = ? AND question_id = ?',
      [attemptId, questionId]
    );
    if (existing.length) {
      await db.query('UPDATE student_assessment_responses SET answer_text = ? WHERE id = ?', [answer_text || null, existing[0].id]);
    } else {
      await db.query(
        'INSERT INTO student_assessment_responses (attempt_id, question_id, answer_text) VALUES (?, ?, ?)',
        [attemptId, questionId, answer_text || null]
      );
    }

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
      `SELECT aa.id, aa.student_user_id, aa.status, aa.started_at, a.duration
       FROM assessment_attempts aa JOIN assessments a ON a.id = aa.assessment_id
       WHERE aa.id = ?`,
      [attemptId]
    );

    if (attempt.length === 0 || attempt[0].student_user_id !== studentId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    if (attempt[0].status !== 'in_progress') return res.status(409).json({ success: false, error: 'Assessment attempt is already submitted.' });

    const expired = Date.now() > new Date(attempt[0].started_at).getTime() + Number(attempt[0].duration || 60) * 60 * 1000;
    const [answers] = await db.query(
      `SELECT r.id, r.answer_text, q.correct_answer, q.marks
       FROM student_assessment_responses r
       JOIN assessment_questions q ON q.id = r.question_id
       WHERE r.attempt_id = ?`,
      [attemptId]
    );
    let score = 0;
    for (const answer of answers) {
      const correct = answer.correct_answer !== null &&
        String(answer.answer_text || '').trim() === String(answer.correct_answer).trim();
      await db.query('UPDATE student_assessment_responses SET is_correct = ? WHERE id = ?', [correct ? 1 : 0, answer.id]);
      if (correct) score += Number(answer.marks || 0);
    }

    await db.query(
      `UPDATE assessment_attempts 
       SET submitted_at = CURRENT_TIMESTAMP, status = 'evaluated', score = ?
       WHERE id = ?`,
      [score, attemptId]
    );

    res.json({ success: true, data: { id: attemptId, submitted: true, score, expired } });
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
  downloadDocument,
  getStudentDocuments,
  getPortfolioItems,
  createPortfolioItem,
  getSkills,
  createSkill,
  getAssessmentList,
  startAssessment,
  submitAssessmentResponse,
  submitAssessment
};
