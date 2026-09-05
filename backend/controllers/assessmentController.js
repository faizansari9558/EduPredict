const db = require('../config/database');

// Create assessment
const createAssessment = async (req, res) => {
  try {
    const { title, description, assessmentType, duration, totalMarks } = req.body;
    const createdBy = req.user.id;

    if (!title || !assessmentType) {
      return res.status(400).json({ success: false, error: 'Title and assessment type required' });
    }

    const [result] = await db.query(
      `INSERT INTO assessments (title, description, assessment_type, created_by, duration, total_marks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || null, assessmentType, createdBy, duration || 60, totalMarks || 100]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, title, assessmentType, createdBy, status: 'draft' }
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ success: false, error: 'Failed to create assessment' });
  }
};

// Get all assessments for teacher
const getAssessments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const [assessments] = await db.query(
      `SELECT a.id, a.title, a.description, a.assessment_type, a.duration, a.total_marks,
              a.created_by, a.created_at, a.published_at, u.full_name as creator_name,
              COUNT(q.id) as question_count, COUNT(DISTINCT att.id) as attempt_count
       FROM assessments a
       LEFT JOIN users u ON a.created_by = u.id
       LEFT JOIN assessment_questions q ON a.id = q.assessment_id
       LEFT JOIN assessment_attempts att ON a.id = att.assessment_id
       WHERE a.created_by = ? OR ? IN (SELECT role_id FROM users WHERE id = ? AND role_id IN (SELECT id FROM roles WHERE name = 'admin'))
       GROUP BY a.id
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, req.user.role_id, userId, parseInt(limit), parseInt(offset)]
    );

    res.json({ success: true, data: assessments });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assessments' });
  }
};

// Get assessment details with questions
const getAssessmentDetails = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const [assessments] = await db.query(
      `SELECT a.id, a.title, a.description, a.assessment_type, a.duration, a.total_marks,
              a.created_by, a.created_at, a.published_at, u.full_name as creator_name
       FROM assessments a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = ?`,
      [assessmentId]
    );

    if (assessments.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    const [questions] = await db.query(
      `SELECT id, question_text, question_type, marks, difficulty_level, category, options_json, correct_answer
       FROM assessment_questions
       WHERE assessment_id = ?
       ORDER BY id`,
      [assessmentId]
    );

    res.json({
      success: true,
      data: {
        ...assessments[0],
        questions: questions.map(q => ({
          ...q,
          options: q.options_json ? JSON.parse(q.options_json) : null
        }))
      }
    });
  } catch (error) {
    console.error('Get assessment details error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assessment details' });
  }
};

// Update assessment
const updateAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { title, description, duration, totalMarks } = req.body;

    // Verify ownership
    const [owner] = await db.query(
      'SELECT created_by FROM assessments WHERE id = ?',
      [assessmentId]
    );

    if (owner.length === 0 || owner[0].created_by !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await db.query(
      `UPDATE assessments SET title = ?, description = ?, duration = ?, total_marks = ?
       WHERE id = ?`,
      [title, description, duration, totalMarks, assessmentId]
    );

    res.json({ success: true, data: { id: assessmentId, updated: true } });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ success: false, error: 'Failed to update assessment' });
  }
};

// Delete assessment
const deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Verify ownership
    const [owner] = await db.query(
      'SELECT created_by FROM assessments WHERE id = ?',
      [assessmentId]
    );

    if (owner.length === 0 || owner[0].created_by !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await db.query('DELETE FROM assessments WHERE id = ?', [assessmentId]);

    res.json({ success: true, data: { id: assessmentId, deleted: true } });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete assessment' });
  }
};

// Add question to assessment
const addQuestion = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { questionText, questionType, marks, difficulty, category, options, correctAnswer } = req.body;

    if (!questionText || !questionType) {
      return res.status(400).json({ success: false, error: 'Question text and type required' });
    }

    // Verify assessment exists and user owns it
    const [assessment] = await db.query(
      'SELECT created_by FROM assessments WHERE id = ?',
      [assessmentId]
    );

    if (assessment.length === 0 || assessment[0].created_by !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const [result] = await db.query(
      `INSERT INTO assessment_questions 
       (assessment_id, question_text, question_type, marks, difficulty_level, category, options_json, correct_answer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assessmentId,
        questionText,
        questionType,
        marks || 1,
        difficulty || 'medium',
        category || null,
        options ? JSON.stringify(options) : null,
        correctAnswer || null
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        questionText,
        questionType,
        marks,
        difficulty,
        category
      }
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ success: false, error: 'Failed to add question' });
  }
};

// Get questions for assessment
const getQuestions = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const [questions] = await db.query(
      `SELECT id, question_text, question_type, marks, difficulty_level, category, 
              options_json, correct_answer, created_at
       FROM assessment_questions
       WHERE assessment_id = ?
       ORDER BY id`,
      [assessmentId]
    );

    res.json({
      success: true,
      data: questions.map(q => ({
        ...q,
        options: q.options_json ? JSON.parse(q.options_json) : null
      }))
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch questions' });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { questionText, marks, difficulty, category, options, correctAnswer } = req.body;

    // Verify user owns the assessment
    const [question] = await db.query(
      `SELECT aq.id, a.created_by FROM assessment_questions aq
       JOIN assessments a ON aq.assessment_id = a.id
       WHERE aq.id = ?`,
      [questionId]
    );

    if (question.length === 0 || question[0].created_by !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await db.query(
      `UPDATE assessment_questions 
       SET question_text = ?, marks = ?, difficulty_level = ?, category = ?, options_json = ?, correct_answer = ?
       WHERE id = ?`,
      [
        questionText,
        marks,
        difficulty,
        category,
        options ? JSON.stringify(options) : null,
        correctAnswer,
        questionId
      ]
    );

    res.json({ success: true, data: { id: questionId, updated: true } });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ success: false, error: 'Failed to update question' });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    // Verify user owns the assessment
    const [question] = await db.query(
      `SELECT aq.id, a.created_by FROM assessment_questions aq
       JOIN assessments a ON aq.assessment_id = a.id
       WHERE aq.id = ?`,
      [questionId]
    );

    if (question.length === 0 || question[0].created_by !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await db.query('DELETE FROM assessment_questions WHERE id = ?', [questionId]);

    res.json({ success: true, data: { id: questionId, deleted: true } });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete question' });
  }
};

// Get question bank (all public/shared questions)
const getQuestionBank = async (req, res) => {
  try {
    const { category, difficulty, limit = 20, offset = 0 } = req.query;

    let query = `SELECT aq.id, aq.question_text, aq.question_type, aq.marks, 
                        aq.difficulty_level, aq.category, aq.options_json,
                        a.title as assessment_title, u.full_name as creator
                 FROM assessment_questions aq
                 JOIN assessments a ON aq.assessment_id = a.id
                 JOIN users u ON a.created_by = u.id
                 WHERE a.published_at IS NOT NULL`;

    const params = [];

    if (category) {
      query += ' AND aq.category = ?';
      params.push(category);
    }

    if (difficulty) {
      query += ' AND aq.difficulty_level = ?';
      params.push(difficulty);
    }

    query += ` ORDER BY aq.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [questions] = await db.query(query, params);

    res.json({
      success: true,
      data: questions.map(q => ({
        ...q,
        options: q.options_json ? JSON.parse(q.options_json) : null
      }))
    });
  } catch (error) {
    console.error('Get question bank error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch question bank' });
  }
};

// Add existing question to assessment from bank
const addToQuestionBank = async (req, res) => {
  try {
    const { questionText, questionType, marks, difficulty, category, options, correctAnswer } = req.body;

    // Create question in bank (assessment_id = null for bank questions)
    const [result] = await db.query(
      `INSERT INTO assessment_questions 
       (question_text, question_type, marks, difficulty_level, category, options_json, correct_answer)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        questionText,
        questionType,
        marks || 1,
        difficulty || 'medium',
        category || null,
        options ? JSON.stringify(options) : null,
        correctAnswer || null
      ]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, message: 'Question added to bank' }
    });
  } catch (error) {
    console.error('Add to question bank error:', error);
    res.status(500).json({ success: false, error: 'Failed to add to question bank' });
  }
};

// Publish assessment
const publishAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Verify ownership
    const [owner] = await db.query(
      'SELECT created_by FROM assessments WHERE id = ?',
      [assessmentId]
    );

    if (owner.length === 0 || owner[0].created_by !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Check minimum questions
    const [questions] = await db.query(
      'SELECT COUNT(*) as count FROM assessment_questions WHERE assessment_id = ?',
      [assessmentId]
    );

    if (questions[0].count === 0) {
      return res.status(400).json({ success: false, error: 'Assessment must have at least 1 question' });
    }

    await db.query(
      'UPDATE assessments SET published_at = CURRENT_TIMESTAMP WHERE id = ?',
      [assessmentId]
    );

    res.json({ success: true, data: { id: assessmentId, published: true } });
  } catch (error) {
    console.error('Publish assessment error:', error);
    res.status(500).json({ success: false, error: 'Failed to publish assessment' });
  }
};

// Get assessment results
const getAssessmentResults = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Verify ownership
    const [owner] = await db.query(
      'SELECT created_by FROM assessments WHERE id = ?',
      [assessmentId]
    );

    if (owner.length === 0 || owner[0].created_by !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const [results] = await db.query(
      `SELECT aa.id as attempt_id, aa.student_user_id, u.full_name, u.email,
              aa.started_at, aa.submitted_at, aa.score, aa.status
       FROM assessment_attempts aa
       JOIN users u ON aa.student_user_id = u.id
       WHERE aa.assessment_id = ?
       ORDER BY aa.submitted_at DESC NULLS LAST`,
      [assessmentId]
    );

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Get assessment results error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch results' });
  }
};

module.exports = {
  createAssessment,
  getAssessments,
  getAssessmentDetails,
  updateAssessment,
  deleteAssessment,
  addQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionBank,
  addToQuestionBank,
  publishAssessment,
  getAssessmentResults
};
