/**
 * Report Controller
 * Handles Placement Scorecards, Batch CSV Exports, and Department Analytics Summaries
 */

const pool = require('../config/db');
const mlService = require('../services/mlService');

/**
 * GET /api/reports/student/:studentId/scorecard
 * Generates student placement readiness scorecard
 */
exports.getStudentScorecard = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Fetch student info
    const [stuRows] = await pool.query(`
      SELECT 
        u.id, u.full_name, u.email,
        s.enrollment_number, s.cgpa, s.tenth_percentage, s.twelfth_percentage,
        d.name AS department_name,
        b.name AS batch_name,
        sm.overall_score, sm.aptitude_score, sm.coding_score,
        sm.placement_ready_score, sm.assessment_attempts, sm.assessment_passed,
        sm.profile_completion_pct
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN batches b ON s.batch_id = b.id
      LEFT JOIN student_metrics sm ON u.id = sm.student_id
      WHERE u.id = ?
    `, [studentId]);

    if (stuRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const s = stuRows[0];

    // 2. Fetch skills
    const [skills] = await pool.query(`
      SELECT skill_name, skill_category, avg_score, attempts, passed_count
      FROM skill_proficiency
      WHERE student_id = ?
    `, [studentId]);

    // 3. Fetch documents status
    const [docs] = await pool.query(`
      SELECT document_type, file_name, verification_status
      FROM documents
      WHERE user_id = ?
    `, [studentId]);

    // Format Placement Tier
    const prob = Number(s.placement_ready_score) || 75;
    let tier = 'Standard';
    let expectedPackage = '4.5 - 6.5 LPA';
    if (prob >= 85) { tier = 'Super Dream'; expectedPackage = '12.0 - 24.0 LPA'; }
    else if (prob >= 70) { tier = 'Dream'; expectedPackage = '7.0 - 11.0 LPA'; }
    else if (prob < 50) { tier = 'Needs Remedial'; expectedPackage = 'Under Preparation'; }

    const scorecardData = {
      institution: 'EduPredict Placement & Career Readiness Cell',
      generated_at: new Date().toISOString(),
      student_profile: {
        id: s.id,
        name: s.full_name,
        email: s.email,
        enrollment_number: s.enrollment_number || 'STU-' + s.id,
        department: s.department_name || 'Computer Science',
        batch: s.batch_name || '2024-2028',
        cgpa: s.cgpa || 7.5,
        tenth_percentage: s.tenth_percentage || 75.0,
        twelfth_percentage: s.twelfth_percentage || 75.0,
        profile_completion: s.profile_completion_pct || 80
      },
      academic_and_assessment_metrics: {
        overall_score: Number(s.overall_score) || 75.0,
        aptitude_score: Number(s.aptitude_score) || 70.0,
        coding_score: Number(s.coding_score) || 75.0,
        assessment_attempts: s.assessment_attempts || 0,
        assessment_passed: s.assessment_passed || 0,
        pass_rate_pct: s.assessment_attempts > 0 ? Math.round((s.assessment_passed / s.assessment_attempts) * 100) : 0
      },
      placement_forecast: {
        placement_probability_pct: prob,
        predicted_tier: tier,
        expected_package_range: expectedPackage,
        readiness_status: prob >= 75 ? 'High Readiness' : (prob >= 55 ? 'Moderate Readiness' : 'Needs Support')
      },
      skills_mastery: skills,
      verified_documents: docs
    };

    res.json({
      success: true,
      data: scorecardData
    });
  } catch (error) {
    console.error('Scorecard report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/reports/batch/:batchId/export
 * Exports cohort student performance as CSV
 */
exports.exportBatchReportCSV = async (req, res) => {
  try {
    const { batchId } = req.params;

    const [students] = await pool.query(`
      SELECT 
        u.id AS student_id,
        u.full_name,
        u.email,
        s.enrollment_number,
        d.name AS department_name,
        b.name AS batch_name,
        s.cgpa,
        sm.aptitude_score,
        sm.coding_score,
        sm.overall_score,
        sm.placement_ready_score,
        CASE WHEN ar.risk_score IS NOT NULL THEN 'Yes' ELSE 'No' END AS is_at_risk,
        COALESCE(ar.risk_score, 0) AS risk_score
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN batches b ON s.batch_id = b.id
      LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
      LEFT JOIN at_risk_students ar ON s.user_id = ar.student_id
      WHERE s.batch_id = ?
      ORDER BY sm.overall_score DESC
    `, [batchId]);

    // Build CSV
    const headers = [
      'Student ID', 'Enrollment No', 'Full Name', 'Email', 'Department', 'Batch',
      'CGPA', 'Aptitude Score', 'Coding Score', 'Overall Score',
      'Placement Readiness %', 'At-Risk Flag', 'Risk Score'
    ];

    const rows = students.map(s => [
      s.student_id,
      `"${s.enrollment_number || ''}"`,
      `"${s.full_name}"`,
      s.email,
      `"${s.department_name || ''}"`,
      `"${s.batch_name || ''}"`,
      s.cgpa || 0,
      s.aptitude_score || 0,
      s.coding_score || 0,
      s.overall_score || 0,
      s.placement_ready_score || 0,
      s.is_at_risk,
      s.risk_score
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=batch_${batchId}_performance_report.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Batch CSV export error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
