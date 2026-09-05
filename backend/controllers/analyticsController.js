/**
 * Analytics Controller
 * Handles all analytics and performance dashboard queries
 * Endpoints for Student, Teacher, Department, and Admin analytics
 */

const pool = require('../config/db');

// ============================================================================
// STUDENT ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/student/:studentId
 * Get student performance overview
 */
exports.getStudentPerformanceOverview = async (req, res) => {
  try {
    const { studentId } = req.params;

    const query = `
      SELECT 
        sm.overall_score,
        sm.aptitude_score,
        sm.coding_score,
        sm.assessment_attempts,
        sm.assessment_passed,
        sm.assessment_avg_score,
        sm.profile_completion_pct,
        sm.placement_ready_score,
        sm.cohort_percentile,
        s.batch_id,
        b.name as batch_name
      FROM student_metrics sm
      JOIN students s ON sm.student_id = s.user_id
      JOIN batches b ON s.batch_id = b.id
      WHERE sm.student_id = ?
    `;

    const [result] = await pool.query(query, [studentId]);

    if (result.length === 0) {
      return res.status(404).json({ 
        message: 'Student metrics not found', 
        data: null 
      });
    }

    const metrics = result[0];

    // Calculate cohort comparison
    const cohortQuery = `
      SELECT 
        ROUND(AVG(overall_score), 2) as cohort_avg_score,
        ROUND(STDDEV(overall_score), 2) as cohort_stddev
      FROM student_metrics sm
      JOIN students s ON sm.student_id = s.user_id
      WHERE s.batch_id = (
        SELECT batch_id FROM students WHERE user_id = ?
      )
    `;

    const [cohortResult] = await pool.query(cohortQuery, [studentId]);
    const cohortStats = cohortResult[0] || {};

    res.json({
      success: true,
      data: {
        overall_score: metrics.overall_score,
        aptitude_score: metrics.aptitude_score,
        coding_score: metrics.coding_score,
        assessment_attempts: metrics.assessment_attempts,
        assessment_passed: metrics.assessment_passed,
        assessment_avg_score: metrics.assessment_avg_score,
        profile_completion_pct: metrics.profile_completion_pct,
        placement_ready_score: metrics.placement_ready_score,
        cohort_percentile: metrics.cohort_percentile,
        batch_name: metrics.batch_name,
        comparison_to_cohort: {
          your_score: metrics.overall_score,
          cohort_average: cohortStats.cohort_avg_score || 0,
          percentile: metrics.cohort_percentile
        }
      }
    });
  } catch (error) {
    console.error('Student overview error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/student/:studentId/assessments
 * Get student assessment performance trends
 */
exports.getStudentAssessmentTrends = async (req, res) => {
  try {
    const { studentId } = req.params;

    const query = `
      SELECT 
        aa.submitted_at as date,
        a.id as assessment_id,
        a.title,
        aa.score,
        a.assessment_type as type,
        TIMESTAMPDIFF(MINUTE, aa.started_at, aa.submitted_at) as time_taken
      FROM assessment_attempts aa
      JOIN assessments a ON aa.assessment_id = a.id
      WHERE aa.student_user_id = ?
      AND aa.status IN ('submitted', 'evaluated')
      ORDER BY aa.submitted_at DESC
      LIMIT 50
    `;

    const [assessments] = await pool.query(query, [studentId]);

    // Calculate performance by category
    const categoryQuery = `
      SELECT 
        COALESCE(a.assessment_type, 'General') as category,
        ROUND(AVG(aa.score), 2) as avg_score,
        COUNT(*) as attempt_count
      FROM assessment_attempts aa
      JOIN assessments a ON aa.assessment_id = a.id
      WHERE aa.student_user_id = ?
      GROUP BY a.assessment_type
    `;

    const [categoryPerformance] = await pool.query(categoryQuery, [studentId]);

    // Detect trend (improving/declining/stable)
    let trend = 'stable';
    if (assessments.length >= 3) {
      const recent = assessments.slice(0, 3).map(a => Number(a.score));
      const older = assessments.slice(3, 6).map(a => Number(a.score));
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
      
      if (recentAvg > olderAvg + 5) trend = 'improving';
      else if (recentAvg < olderAvg - 5) trend = 'declining';
    }

    res.json({
      success: true,
      data: {
        assessments: assessments.map(a => ({
          date: a.date,
          assessment_id: a.assessment_id,
          title: a.title,
          score: Number(a.score),
          category: a.type || 'General',
          time_taken: a.time_taken
        })),
        trend,
        performance_by_category: Object.fromEntries(
          categoryPerformance.map(cp => [cp.category || 'General', Number(cp.avg_score)])
        )
      }
    });
  } catch (error) {
    console.error('Assessment trends error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/student/:studentId/skills
 * Get student skill proficiency
 */
exports.getStudentSkillProficiency = async (req, res) => {
  try {
    const { studentId } = req.params;

    const query = `
      SELECT 
        skill_category,
        skill_name,
        avg_score as proficiency,
        attempts,
        passed_count
      FROM skill_proficiency
      WHERE student_id = ?
      ORDER BY avg_score DESC
    `;

    const [skills] = await pool.query(query, [studentId]);

    res.json({
      success: true,
      data: {
        skills: skills.map(s => ({
          skill: s.skill_name,
          category: s.skill_category,
          proficiency: s.proficiency,
          attempts: s.attempts,
          passed: s.passed_count
        }))
      }
    });
  } catch (error) {
    console.error('Skill proficiency error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/student/:studentId/weaknesses
 * Get student weaknesses and recommendations
 */
exports.getStudentWeaknesses = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get weaknesses (lowest scoring skills)
    const weaknessQuery = `
      SELECT 
        skill_category,
        skill_name,
        avg_score as score
      FROM skill_proficiency
      WHERE student_id = ?
      ORDER BY avg_score ASC
      LIMIT 3
    `;

    const [weaknesses] = await pool.query(weaknessQuery, [studentId]);

    // Get strengths (highest scoring skills)
    const strengthQuery = `
      SELECT 
        skill_category,
        skill_name,
        avg_score as score
      FROM skill_proficiency
      WHERE student_id = ?
      ORDER BY avg_score DESC
      LIMIT 3
    `;

    const [strengths] = await pool.query(strengthQuery, [studentId]);

    res.json({
      success: true,
      data: {
        weaknesses: weaknesses.map(w => ({
          skill: w.skill_name,
          score: w.score,
          recommendation: `Focus on improving your ${w.skill_name} skills through practice and targeted resources.`
        })),
        strengths: strengths.map(s => ({
          skill: s.skill_name,
          score: s.score
        })),
        recommended_focus_areas: weaknesses.map(w => w.skill_name)
      }
    });
  } catch (error) {
    console.error('Weaknesses error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// TEACHER ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/teacher/:teacherId/class-summary
 * Get teacher class performance summary
 */
exports.getTeacherClassSummary = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const query = `
      SELECT 
        COUNT(DISTINCT aa.student_user_id) as assigned_students,
        ROUND(AVG(aa.score), 2) as class_average,
        ROUND(STDDEV(aa.score), 2) as score_stddev
      FROM assessment_attempts aa
      JOIN assessments a ON aa.assessment_id = a.id
      WHERE a.created_by = ?
      AND aa.status IN ('submitted', 'evaluated')
    `;

    const [summary] = await pool.query(query, [teacherId]);
    const stats = summary[0] || {};

    // Get median score
    const [scoreRows] = await pool.query(`
      SELECT aa.score 
      FROM assessment_attempts aa
      JOIN assessments a ON aa.assessment_id = a.id
      WHERE a.created_by = ?
      AND aa.status IN ('submitted', 'evaluated')
      ORDER BY aa.score ASC
    `, [teacherId]);

    let classMedian = 0;
    if (scoreRows.length > 0) {
      const mid = Math.floor(scoreRows.length / 2);
      classMedian = scoreRows.length % 2 !== 0 
        ? Number(scoreRows[mid].score)
        : Number(((Number(scoreRows[mid - 1].score) + Number(scoreRows[mid].score)) / 2).toFixed(2));
    }

    // Get score distribution
    const distributionQuery = `
      SELECT 
        SUM(CASE WHEN aa.score >= 80 THEN 1 ELSE 0 END) as high_performers,
        SUM(CASE WHEN aa.score >= 60 AND aa.score < 80 THEN 1 ELSE 0 END) as good_performers,
        SUM(CASE WHEN aa.score >= 40 AND aa.score < 60 THEN 1 ELSE 0 END) as average_performers,
        SUM(CASE WHEN aa.score < 40 THEN 1 ELSE 0 END) as low_performers
      FROM assessment_attempts aa
      JOIN assessments a ON aa.assessment_id = a.id
      WHERE a.created_by = ?
    `;

    const [distribution] = await pool.query(distributionQuery, [teacherId]);
    const dist = distribution[0] || {};

    // Get at-risk students count
    const atRiskQuery = `
      SELECT COUNT(*) as count FROM at_risk_students
      WHERE risk_score >= 50
    `;

    const [atRisk] = await pool.query(atRiskQuery);

    res.json({
      success: true,
      data: {
        assigned_students: stats.assigned_students || 0,
        class_average: stats.class_average || 0,
        class_median: classMedian,
        high_performers: dist.high_performers || 0,
        at_risk_students: atRisk[0]?.count || 0,
        score_distribution: {
          '80-100': dist.high_performers || 0,
          '60-80': dist.good_performers || 0,
          '40-60': dist.average_performers || 0,
          '0-40': dist.low_performers || 0
        }
      }
    });
  } catch (error) {
    console.error('Class summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/teacher/:teacherId/at-risk
 * Get teacher's at-risk students
 */
exports.getTeacherAtRiskStudents = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const query = `
      SELECT 
        ars.id,
        ars.student_id,
        u.full_name as name,
        ars.risk_score,
        ars.risk_level,
        ars.risk_factors,
        ars.intervention_status,
        sm.overall_score,
        ars.flagged_date
      FROM at_risk_students ars
      JOIN users u ON ars.student_id = u.id
      LEFT JOIN student_metrics sm ON ars.student_id = sm.student_id
      WHERE ars.teacher_id = ? OR ars.risk_score >= 50
      ORDER BY ars.risk_score DESC
      LIMIT 20
    `;

    const [students] = await pool.query(query, [teacherId]);

    res.json({
      success: true,
      data: {
        at_risk_students: students.map(s => ({
          student_id: s.student_id,
          name: s.name,
          overall_score: s.overall_score,
          risk_factors: s.risk_factors ? JSON.parse(s.risk_factors) : {},
          risk_score: s.risk_score,
          risk_level: s.risk_level,
          intervention_status: s.intervention_status,
          last_flagged: s.flagged_date
        }))
      }
    });
  } catch (error) {
    console.error('At-risk students error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/teacher/:teacherId/assessments/:assessmentId
 * Get assessment question analytics
 */
exports.getAssessmentAnalytics = async (req, res) => {
  try {
    const { teacherId, assessmentId } = req.params;

    // Get assessment info
    const assessmentQuery = `
      SELECT a.title, a.created_by, a.created_at
      FROM assessments a
      WHERE a.id = ? AND a.created_by = ?
    `;

    const [assessment] = await pool.query(assessmentQuery, [assessmentId, teacherId]);

    if (assessment.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized or assessment not found' });
    }

    // Get question analytics
    const questionsQuery = `
      SELECT 
        aq.id,
        aq.question_text,
        qa.total_responses,
        qa.correct_responses,
        qa.difficulty_index,
        qa.discrimination_index
      FROM assessment_question_analytics qa
      JOIN assessment_questions aq ON qa.question_id = aq.id
      WHERE qa.assessment_id = ?
    `;

    const [questions] = await pool.query(questionsQuery, [assessmentId]);

    // Get attempt summary
    const attemptQuery = `
      SELECT 
        COUNT(*) as total_attempts,
        ROUND(COUNT(*) / (SELECT COUNT(*) FROM assessment_attempts WHERE assessment_id = ?) * 100, 2) as completion_rate,
        ROUND(AVG(score), 2) as average_score
      FROM assessment_attempts
      WHERE assessment_id = ? AND status IN ('submitted', 'evaluated')
    `;

    const [attempts] = await pool.query(attemptQuery, [assessmentId, assessmentId]);

    res.json({
      success: true,
      data: {
        assessment_title: assessment[0].title,
        total_attempts: attempts[0]?.total_attempts || 0,
        completion_rate: attempts[0]?.completion_rate || 0,
        average_score: attempts[0]?.average_score || 0,
        question_analytics: questions.map(q => ({
          question_id: q.id,
          question_text: q.question_text,
          correct_count: q.correct_responses || 0,
          incorrect_count: (q.total_responses || 0) - (q.correct_responses || 0),
          difficulty_index: q.difficulty_index || 0.5,
          discrimination_index: q.discrimination_index || 0
        }))
      }
    });
  } catch (error) {
    console.error('Assessment analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// DEPARTMENT ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/department/:departmentId
 * Get department performance overview
 */
exports.getDepartmentOverview = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const query = `
      SELECT 
        d.name as department_name,
        COUNT(DISTINCT s.user_id) as total_students,
        ROUND(AVG(sm.overall_score), 2) as avg_score,
        ROUND(STDDEV(sm.overall_score), 2) as score_stddev,
        ROUND(SUM(CASE WHEN sm.overall_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.user_id) * 100, 2) as pass_rate,
        ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END), 0) as placement_ready_count,
        ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.user_id) * 100, 2) as placement_ready_pct
      FROM departments d
      LEFT JOIN students s ON d.id = s.department_id
      LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
      WHERE d.id = ?
      GROUP BY d.id, d.name
    `;

    const [result] = await pool.query(query, [departmentId]);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Department overview error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/department/:departmentId/batches
 * Get department batch comparison
 */
exports.getDepartmentBatchComparison = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const query = `
      SELECT 
        b.name as batch_name,
        ay.name as academic_year,
        COUNT(DISTINCT s.user_id) as student_count,
        ROUND(AVG(sm.overall_score), 2) as avg_score,
        ROUND(SUM(CASE WHEN sm.overall_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.user_id) * 100, 2) as pass_rate,
        ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END), 0) as placement_ready_count
      FROM batches b
      LEFT JOIN academic_years ay ON b.academic_year_id = ay.id
      LEFT JOIN students s ON b.id = s.batch_id
      LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
      WHERE b.department_id = ?
      GROUP BY b.id, b.name, ay.name
      ORDER BY ay.name DESC
    `;

    const [batches] = await pool.query(query, [departmentId]);

    res.json({
      success: true,
      data: {
        batches: batches.map(b => ({
          batch_name: b.batch_name,
          academic_year: b.academic_year,
          student_count: b.student_count,
          avg_score: b.avg_score,
          pass_rate: b.pass_rate,
          placement_ready_count: b.placement_ready_count
        }))
      }
    });
  } catch (error) {
    console.error('Batch comparison error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/department/:departmentId/skills
 * Get skill distribution in department
 */
exports.getDepartmentSkillDistribution = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const query = `
      SELECT 
        sp.skill_category,
        sp.skill_name,
        COUNT(DISTINCT sp.student_id) as student_count,
        ROUND(AVG(sp.avg_score), 2) as avg_proficiency,
        ROUND(SUM(CASE WHEN sp.avg_score >= 70 THEN 1 ELSE 0 END) / COUNT(DISTINCT sp.student_id) * 100, 2) as proficient_pct
      FROM skill_proficiency sp
      JOIN students s ON sp.student_id = s.user_id
      WHERE s.department_id = ?
      GROUP BY sp.skill_category, sp.skill_name
      ORDER BY avg_proficiency DESC
    `;

    const [skills] = await pool.query(query, [departmentId]);

    res.json({
      success: true,
      data: {
        skills: skills.map(s => ({
          skill: s.skill_name,
          category: s.skill_category,
          proficient_count: s.student_count,
          avg_proficiency: s.avg_proficiency,
          proficient_pct: s.proficient_pct
        }))
      }
    });
  } catch (error) {
    console.error('Skill distribution error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// ADMIN ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/admin/system-overview
 * Get system-wide analytics overview
 */
exports.getSystemOverview = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT CASE WHEN r.name = 'student' THEN u.id END) as total_students,
        COUNT(DISTINCT CASE WHEN r.name = 'teacher' THEN u.id END) as total_teachers,
        COUNT(DISTINCT CASE WHEN r.name = 'admin' THEN u.id END) as total_admins,
        COUNT(DISTINCT d.id) as total_departments,
        COUNT(DISTINCT a.id) as total_assessments,
        ROUND(AVG(sm.overall_score), 2) as system_avg_score,
        ROUND(SUM(CASE WHEN sm.overall_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT sm.student_id) * 100, 2) as system_pass_rate,
        ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END), 0) as placement_ready_students
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      CROSS JOIN departments d
      CROSS JOIN assessments a
      LEFT JOIN student_metrics sm ON u.role_id = (SELECT id FROM roles WHERE name = 'student') AND u.id = sm.student_id
    `;

    const [result] = await pool.query(query);

    const stats = result[0] || {};
    const totalStudents = stats.total_students || 0;
    const placementReadyPct = totalStudents > 0 ? 
      ((stats.placement_ready_students || 0) / totalStudents * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        total_users: (stats.total_students || 0) + (stats.total_teachers || 0) + (stats.total_admins || 0),
        total_students: stats.total_students || 0,
        total_teachers: stats.total_teachers || 0,
        total_admins: stats.total_admins || 0,
        total_departments: stats.total_departments || 0,
        total_assessments: stats.total_assessments || 0,
        system_avg_score: stats.system_avg_score || 0,
        system_pass_rate: stats.system_pass_rate || 0,
        placement_ready_students: stats.placement_ready_students || 0,
        placement_ready_pct: placementReadyPct
      }
    });
  } catch (error) {
    console.error('System overview error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/admin/departments
 * Get comparative metrics for all departments
 */
exports.getDepartmentComparison = async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id,
        d.name,
        COUNT(DISTINCT s.user_id) as student_count,
        ROUND(AVG(sm.overall_score), 2) as avg_score,
        ROUND(SUM(CASE WHEN sm.overall_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.user_id) * 100, 2) as pass_rate,
        ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.user_id) * 100, 2) as placement_ready_pct
      FROM departments d
      LEFT JOIN students s ON d.id = s.department_id
      LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
      GROUP BY d.id, d.name
      ORDER BY avg_score DESC
    `;

    const [departments] = await pool.query(query);

    // Add ranking
    const rankedDepts = departments.map((dept, index) => ({
      rank: index + 1,
      ...dept
    }));

    res.json({
      success: true,
      data: {
        departments: rankedDepts
      }
    });
  } catch (error) {
    console.error('Department comparison error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/admin/placement-readiness
 * Get placement readiness statistics
 */
exports.getPlacementReadiness = async (req, res) => {
  try {
    const query = `
      SELECT 
        d.name as department_name,
        COUNT(DISTINCT s.user_id) as total_students,
        ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END), 0) as ready_count,
        ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.user_id) * 100, 2) as ready_pct,
        ROUND(SUM(CASE WHEN sm.placement_ready_score >= 40 AND sm.placement_ready_score < 60 THEN 1 ELSE 0 END), 0) as borderline_count,
        ROUND(SUM(CASE WHEN sm.placement_ready_score < 40 THEN 1 ELSE 0 END), 0) as not_ready_count
      FROM departments d
      LEFT JOIN students s ON d.id = s.department_id
      LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
      GROUP BY d.id, d.name
      ORDER BY ready_pct DESC
    `;

    const [data] = await pool.query(query);

    res.json({
      success: true,
      data: {
        placement_readiness: data.map(d => ({
          department: d.department_name,
          total_students: d.total_students,
          ready_count: d.ready_count,
          ready_pct: d.ready_pct,
          borderline_count: d.borderline_count,
          not_ready_count: d.not_ready_count
        }))
      }
    });
  } catch (error) {
    console.error('Placement readiness error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
