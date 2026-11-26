/**
 * Prediction Controller
 * Handles ML-based Placement Prediction, Explainability, and Batch Forecasting
 */

const pool = require('../config/db');
const mlService = require('../services/mlService');

/**
 * Helper to build feature vector for a student from DB
 */
async function getStudentFeatureVector(studentId) {
  const [stuRows] = await pool.query(`
    SELECT 
      s.user_id,
      s.cgpa,
      s.tenth_percentage,
      s.twelfth_percentage,
      s.backlogs_count,
      sm.profile_completion_pct
    FROM students s
    LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
    WHERE s.user_id = ? AND s.verification_status = 'verified'
  `, [studentId]);

  if (stuRows.length === 0) {
    return null;
  }

  const s = stuRows[0];

  const [skillRows] = await pool.query(
    'SELECT COUNT(*) as count FROM skill_proficiency WHERE student_id = ?',
    [studentId]
  );
  const [portfolioRows] = await pool.query(
    `SELECT
       SUM(item_type = 'project') AS num_projects,
       SUM(item_type = 'certification') AS num_certifications,
       SUM(item_type = 'internship') AS num_internships
     FROM student_portfolio_items
     WHERE student_id = ? AND verification_status = 'verified'`,
    [studentId]
  );
  const [aptitudeRows] = await pool.query(
    `SELECT AVG(aa.score * 100 / NULLIF(COALESCE(NULLIF(a.total_marks, 0), (
              SELECT SUM(q.marks) FROM assessment_questions q WHERE q.assessment_id = a.id
            ), 0), 0)) AS aptitude_score,
            COUNT(aa.score * 100 / NULLIF(COALESCE(NULLIF(a.total_marks, 0), (
              SELECT SUM(q.marks) FROM assessment_questions q WHERE q.assessment_id = a.id
            ), 0), 0)) AS completed_assessments
     FROM assessment_attempts aa
     JOIN assessments a ON a.id = aa.assessment_id
     WHERE aa.student_user_id = ? AND a.assessment_type = 'aptitude'
       AND aa.status = 'evaluated' AND aa.submitted_at IS NOT NULL AND aa.score IS NOT NULL`,
    [studentId]
  );
  const [codingRows] = await pool.query(
    `SELECT AVG(scored.score) AS coding_score, COUNT(scored.score) AS completed_assessments
     FROM (
       SELECT aa.score * 100 / NULLIF(COALESCE(NULLIF(a.total_marks, 0), (
                SELECT SUM(q.marks) FROM assessment_questions q WHERE q.assessment_id = a.id
              ), 0), 0) AS score
       FROM assessment_attempts aa
       JOIN assessments a ON a.id = aa.assessment_id
       WHERE aa.student_user_id = ? AND a.assessment_type = 'coding'
         AND aa.status = 'evaluated' AND aa.submitted_at IS NOT NULL AND aa.score IS NOT NULL
       UNION ALL
       SELECT cs.score
       FROM coding_submissions cs
       WHERE cs.student_user_id = ? AND cs.status = 'graded' AND cs.score IS NOT NULL
     ) AS scored`,
    [studentId, studentId]
  );

  const student = stuRows[0];
  const requiredAcademicFields = [
    ['cgpa', 'verified CGPA'],
    ['tenth_percentage', 'verified 10th percentage'],
    ['twelfth_percentage', 'verified 12th percentage'],
    ['backlogs_count', 'backlog information']
  ];
  const missing = requiredAcademicFields
    .filter(([field]) => student[field] === null || student[field] === undefined)
    .map(([, label]) => label);
  if (Number(aptitudeRows[0]?.completed_assessments || 0) === 0) {
    missing.push('a completed aptitude assessment');
  }
  if (Number(codingRows[0]?.completed_assessments || 0) === 0) {
    missing.push('a graded coding assessment');
  }
  if (missing.length) return { missing };

  const portfolio = portfolioRows[0] || {};
  const numSkills = Number(skillRows[0]?.count) || 0;

  return {
    student_id: student.user_id,
    cgpa: Number(student.cgpa),
    tenth_percentage: Number(student.tenth_percentage),
    twelfth_percentage: Number(student.twelfth_percentage),
    backlogs_count: Number(student.backlogs_count),
    aptitude_score: Number(aptitudeRows[0].aptitude_score),
    coding_score: Number(codingRows[0].coding_score),
    num_skills: numSkills,
    num_projects: Number(portfolio.num_projects) || 0,
    num_certifications: Number(portfolio.num_certifications) || 0,
    num_internships: Number(portfolio.num_internships) || 0,
    profile_completion_pct: student.profile_completion_pct === null || student.profile_completion_pct === undefined
      ? 0
      : Number(student.profile_completion_pct)
  };
}

/**
 * GET /api/prediction/student/:studentId
 * Get ML placement prediction and full explainability
 */
exports.getStudentPlacementPrediction = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.id;

    const features = await getStudentFeatureVector(studentId);
    if (!features) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }
    if (features.missing) {
      return res.status(422).json({
        success: false,
        message: 'Complete verified academic records and the required aptitude and coding assessments before viewing a placement analysis.',
        missing: features.missing
      });
    }

    const predictionPayload = await mlService.predictAndExplain(features);

    // Update cached placement ready score in student_metrics
    const probPct = predictionPayload.prediction?.placement_probability_pct || 0;
    try {
      await pool.query(`
        UPDATE student_metrics 
        SET placement_ready_score = ?
        WHERE student_id = ?
      `, [probPct, studentId]);
    } catch (dbErr) {
      console.warn('Could not update student_metrics cache:', dbErr.message);
    }

    res.json({
      success: true,
      data: {
        student_id: Number(studentId),
        features_evaluated: features,
        prediction: predictionPayload.prediction,
        explanation: predictionPayload.explanation
      }
    });
  } catch (error) {
    console.error('Prediction controller error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/prediction/batch/:batchId
 * Batch forecasting for all students in a batch
 */
exports.getBatchPlacementForecast = async (req, res) => {
  try {
    const { batchId } = req.params;

    const [students] = await pool.query(
      'SELECT user_id FROM students WHERE batch_id = ?',
      [batchId]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found in this batch.' });
    }

    const featuresList = [];
    for (const stu of students) {
      const f = await getStudentFeatureVector(stu.user_id);
      if (f && !f.missing) featuresList.push(f);
    }

    const batchForecast = await mlService.predictBatch(Number(batchId), featuresList);

    res.json({
      success: true,
      data: batchForecast
    });
  } catch (error) {
    console.error('Batch prediction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/prediction/model-info
 * Get model metadata, accuracy, and feature importances
 */
exports.getModelMetadata = async (req, res) => {
  try {
    const info = await mlService.getModelInfo();
    if (!info) return res.status(503).json({ success: false, message: 'ML model metadata is unavailable.' });

    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
