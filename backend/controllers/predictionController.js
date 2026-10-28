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
  // Query student profile and metrics
  const [stuRows] = await pool.query(`
    SELECT 
      s.user_id,
      s.cgpa,
      s.tenth_percentage,
      s.twelfth_percentage,
      s.graduation_percentage,
      s.backlogs_count,
      sm.overall_score,
      sm.aptitude_score,
      sm.coding_score,
      sm.profile_completion_pct,
      sm.assessment_attempts
    FROM students s
    LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
    WHERE s.user_id = ? AND s.verification_status = 'verified'
  `, [studentId]);

  if (stuRows.length === 0) {
    return null;
  }

  const s = stuRows[0];

  // Query skills count
  const [skillRows] = await pool.query(
    'SELECT COUNT(*) as count FROM skill_proficiency WHERE student_id = ?',
    [studentId]
  );
  const numSkills = skillRows[0]?.count || 0;

  // Query documents / projects count
  const [docRows] = await pool.query(
    `SELECT COUNT(*) as count FROM documents
     WHERE user_id = ? AND verification_status = 'verified'`,
    [studentId]
  );
  const numDocs = docRows[0]?.count || 0;

  const required = ['cgpa', 'tenth_percentage', 'twelfth_percentage', 'backlogs_count', 'aptitude_score', 'coding_score'];
  if (required.some(field => s[field] === null || s[field] === undefined)) {
    return { missing: required.filter(field => s[field] === null || s[field] === undefined) };
  }

  return {
    student_id: s.user_id,
    cgpa: Number(s.cgpa),
    tenth_percentage: Number(s.tenth_percentage),
    twelfth_percentage: Number(s.twelfth_percentage),
    backlogs_count: Number(s.backlogs_count),
    aptitude_score: Number(s.aptitude_score),
    coding_score: Number(s.coding_score),
    num_skills: Number(numSkills),
    num_projects: Math.min(Number(numDocs), 3),
    num_certifications: 0,
    num_internships: 0,
    profile_completion_pct: s.profile_completion_pct === null ? 0 : Number(s.profile_completion_pct)
  };
}

/**
 * GET /api/prediction/student/:studentId
 * Get ML placement prediction and full explainability
 */
exports.getStudentPlacementPrediction = async (req, res) => {
  try {
    const { studentId } = req.params;

    const features = await getStudentFeatureVector(studentId);
    if (!features) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }
    if (features.missing) {
      return res.status(422).json({ success: false, message: 'Verified academic and assessment records are incomplete.', missing: features.missing });
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
      if (f) featuresList.push(f);
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
