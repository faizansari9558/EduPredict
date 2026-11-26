const db = require('../config/db');

function getPagination(query) {
  const requestedLimit = Number.parseInt(query.limit, 10);
  const requestedOffset = Number.parseInt(query.offset, 10);
  return {
    limit: Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 500) : 50,
    offset: Number.isInteger(requestedOffset) && requestedOffset >= 0 ? requestedOffset : 0
  };
}

async function getTeacherDashboard(req, res) {
  try {
    const { id: userId } = req.user;

    const [teacherRows] = await db.query(
      `SELECT t.id, t.department_id, u.full_name, u.email, d.name AS department,
             t.designation, t.employee_code
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

    const [[summaryRows], [cgpaByBatch], [readinessByBatch], [pendingVerifications]] = await Promise.all([
      db.query(
        `SELECT COUNT(DISTINCT s.user_id) AS assigned_students,
                COUNT(DISTINCT CASE WHEN s.verification_status = 'pending' THEN s.user_id END) AS pending_verifications,
                ROUND(AVG(s.cgpa), 2) AS average_cgpa,
                COUNT(DISTINCT CASE WHEN sm.student_id IS NOT NULL THEN s.user_id END) AS analyzed_students,
                COUNT(DISTINCT CASE WHEN sm.placement_ready_score >= 60 THEN s.user_id END) AS placement_ready_students,
                (SELECT COUNT(*) FROM assessments WHERE created_by = ? AND published_at IS NOT NULL) AS active_assessments
         FROM students s
         INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
         LEFT JOIN student_metrics sm
           ON sm.student_id = s.user_id AND sm.assessment_attempts > 0
         WHERE s.department_id = ?`,
        [userId, teacher.department_id]
      ),
      db.query(
        `SELECT b.id, b.name AS batch, COUNT(DISTINCT s.user_id) AS student_count,
                ROUND(AVG(s.cgpa), 2) AS average_cgpa
         FROM students s
         INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
         INNER JOIN batches b ON b.id = s.batch_id
         WHERE s.department_id = ? AND s.cgpa IS NOT NULL
         GROUP BY b.id, b.name
         ORDER BY b.name`,
        [teacher.department_id]
      ),
      db.query(
        `SELECT b.id, b.name AS batch, COUNT(DISTINCT sm.student_id) AS analyzed_students,
                ROUND(AVG(sm.placement_ready_score), 1) AS average_readiness,
                COUNT(DISTINCT CASE WHEN sm.placement_ready_score >= 60 THEN sm.student_id END) AS ready_students
         FROM student_metrics sm
         INNER JOIN students s ON s.user_id = sm.student_id AND s.department_id = ?
         INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
         INNER JOIN batches b ON b.id = s.batch_id
         WHERE sm.assessment_attempts > 0
         GROUP BY b.id, b.name
         ORDER BY b.name`,
        [teacher.department_id]
      ),
      db.query(
        `SELECT s.id, s.enrollment_number, u.full_name, s.cgpa, s.verification_status, s.created_at
         FROM students s
         INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
         WHERE s.department_id = ? AND s.verification_status = 'pending'
         ORDER BY s.created_at DESC
         LIMIT 10`,
        [teacher.department_id]
      )
    ]);

    const row = summaryRows[0] || {};
    const analyzedStudents = Number(row.analyzed_students) || 0;
    const placementReadyStudents = Number(row.placement_ready_students) || 0;
    const summary = {
      assignedStudents: Number(row.assigned_students) || 0,
      activeAssessments: Number(row.active_assessments) || 0,
      pendingVerifications: Number(row.pending_verifications) || 0,
      averageCgpa: row.average_cgpa === null ? null : Number(row.average_cgpa),
      analyzedStudents,
      placementReadyStudents,
      placementReadyPct: analyzedStudents
        ? Math.round((placementReadyStudents / analyzedStudents) * 1000) / 10
        : null
    };

    return res.json({
      success: true,
      data: {
        teacher,
        summary,
        charts: {
          cgpaByBatch,
          readinessByBatch
        },
        pendingVerifications
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
    const { limit, offset } = getPagination(req.query);

    const [[students], [countRows]] = await Promise.all([
      db.query(
        `SELECT s.id, s.user_id, s.enrollment_number, u.full_name, u.email,
                d.name AS department, b.name AS batch, s.verification_status,
                s.cgpa, s.tenth_percentage, s.twelfth_percentage, s.graduation_percentage,
                sm.placement_ready_score, sm.assessment_attempts, s.created_at,
                (SELECT COUNT(*) FROM skill_proficiency sp
                 WHERE sp.student_id = s.user_id) AS skills_count,
                (SELECT COUNT(*) FROM student_portfolio_items p
                 WHERE p.student_id = s.user_id AND p.item_type = 'project') AS projects_count,
                (SELECT COUNT(*) FROM student_portfolio_items p
                 WHERE p.student_id = s.user_id AND p.item_type = 'project'
                   AND p.verification_status = 'verified') AS verified_projects_count
       FROM students s
       INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
       INNER JOIN departments d ON d.id = s.department_id
       INNER JOIN batches b ON b.id = s.batch_id
       LEFT JOIN student_metrics sm
         ON sm.student_id = s.user_id AND sm.assessment_attempts > 0
       WHERE s.department_id = (SELECT department_id FROM teachers WHERE user_id = ?)
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      ),
      db.query(
        `SELECT COUNT(*) AS total
         FROM students s
         INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
         WHERE s.department_id = (SELECT department_id FROM teachers WHERE user_id = ?)`,
        [userId]
      )
    ]);

    return res.json({
      success: true,
      data: students,
      pagination: {
        limit,
        offset,
        total: Number(countRows[0]?.total) || 0
      }
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

    const [students] = await db.query(
      `SELECT s.id, s.user_id, s.enrollment_number, u.full_name, u.email,
              d.name AS department, b.name AS batch, s.verification_status,
              s.cgpa, s.tenth_percentage, s.twelfth_percentage,
              s.graduation_percentage, s.created_at
       FROM students s
       INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
       INNER JOIN departments d ON d.id = s.department_id
       INNER JOIN batches b ON b.id = s.batch_id
       WHERE s.id = ? AND s.department_id = (SELECT department_id FROM teachers WHERE user_id = ?)`,
      [studentId, userId]
    );

    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or you do not have access.'
      });
    }

    const student = students[0];
    const [[skills], [portfolioRows], [documents], [metricsRows], [assessmentResults]] = await Promise.all([
      db.query(
        `SELECT skill_category, skill_name, avg_score, max_score, attempts, passed_count, last_attempted
         FROM skill_proficiency WHERE student_id = ? ORDER BY skill_category, skill_name`,
        [student.user_id]
      ),
      db.query(
        `SELECT id, item_type, payload_json, verification_status, review_notes, created_at
         FROM student_portfolio_items WHERE student_id = ? ORDER BY created_at DESC`,
        [student.user_id]
      ),
      db.query(
        `SELECT document_type, file_name, verification_status, created_at
         FROM documents WHERE user_id = ? ORDER BY created_at DESC`,
        [student.user_id]
      ),
      db.query(
        `SELECT overall_score, aptitude_score, coding_score, assessment_attempts,
                assessment_passed, assessment_avg_score, profile_completion_pct,
                placement_ready_score, cohort_percentile, performance_trend, last_updated
         FROM student_metrics WHERE student_id = ? AND assessment_attempts > 0`,
        [student.user_id]
      ),
      db.query(
        `SELECT a.title, a.assessment_type, aa.score, a.total_marks, aa.submitted_at
         FROM assessment_attempts aa
         INNER JOIN assessments a ON a.id = aa.assessment_id
         WHERE aa.student_user_id = ? AND aa.status = 'evaluated' AND aa.score IS NOT NULL
         ORDER BY aa.submitted_at DESC`,
        [student.user_id]
      )
    ]);
    const portfolio = portfolioRows.map((item) => ({
      ...item,
      payload: typeof item.payload_json === 'string' ? JSON.parse(item.payload_json) : item.payload_json
    }));
    delete student.user_id;

    return res.json({
      success: true,
      data: {
        ...student,
        skills,
        portfolio,
        documents,
        assessmentResults,
        metrics: metricsRows[0] || null
      }
    });
  } catch (error) {
    console.error('Get student details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student details.'
    });
  }
}

async function getTeacherAnalytics(req, res) {
  try {
    const { id: userId } = req.user;
    const [teacherRows] = await db.query(
      'SELECT department_id FROM teachers WHERE user_id = ?',
      [userId]
    );
    if (!teacherRows.length) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
    }

    const departmentId = teacherRows[0].department_id;
    const [[summaryRows], [skillCategories], [readinessDistribution], [atRiskStudents], [projectRows]] = await Promise.all([
      db.query(
        `SELECT COUNT(DISTINCT s.user_id) AS assigned_students,
                COUNT(DISTINCT CASE WHEN sm.student_id IS NOT NULL THEN s.user_id END) AS analyzed_students,
                ROUND(AVG(sm.placement_ready_score), 1) AS average_readiness,
                COUNT(DISTINCT CASE WHEN sm.placement_ready_score < 60 THEN s.user_id END) AS below_readiness_count
         FROM students s
         INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
         LEFT JOIN student_metrics sm
           ON sm.student_id = s.user_id AND sm.assessment_attempts > 0
         WHERE s.department_id = ?`,
        [departmentId]
      ),
      db.query(
        `SELECT sp.skill_category AS category,
                ROUND(AVG(sp.avg_score / sp.max_score * 100), 1) AS average_proficiency,
                COUNT(DISTINCT sp.student_id) AS students_assessed
         FROM skill_proficiency sp
         INNER JOIN students s ON s.user_id = sp.student_id AND s.department_id = ?
         INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
         WHERE sp.attempts > 0 AND sp.max_score > 0
         GROUP BY sp.skill_category
         ORDER BY sp.skill_category`,
        [departmentId]
      ),
      db.query(
        `SELECT CASE
                  WHEN sm.placement_ready_score >= 80 THEN '80-100'
                  WHEN sm.placement_ready_score >= 60 THEN '60-79'
                  ELSE '0-59'
                END AS band,
                COUNT(DISTINCT sm.student_id) AS students
         FROM student_metrics sm
         INNER JOIN students s ON s.user_id = sm.student_id AND s.department_id = ?
         INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
         WHERE sm.assessment_attempts > 0
         GROUP BY band
         ORDER BY band DESC`,
        [departmentId]
      ),
      db.query(
        `SELECT s.id, s.enrollment_number, u.full_name, s.cgpa, sm.placement_ready_score
         FROM student_metrics sm
         INNER JOIN students s ON s.user_id = sm.student_id AND s.department_id = ?
         INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
         WHERE sm.assessment_attempts > 0 AND sm.placement_ready_score < 60
         ORDER BY sm.placement_ready_score ASC
         LIMIT 10`,
        [departmentId]
      ),
      db.query(
        `SELECT COUNT(*) AS verified_projects
         FROM student_portfolio_items p
         INNER JOIN students s ON s.user_id = p.student_id AND s.department_id = ?
         INNER JOIN users u ON u.id = s.user_id AND u.status = 'active'
         WHERE p.item_type = 'project' AND p.verification_status = 'verified'`,
        [departmentId]
      )
    ]);

    const summaryRow = summaryRows[0] || {};
    const assignedStudents = Number(summaryRow.assigned_students) || 0;
    return res.json({
      success: true,
      data: {
        summary: {
          assignedStudents,
          analyzedStudents: Number(summaryRow.analyzed_students) || 0,
          averageReadiness: summaryRow.average_readiness == null ? null : Number(summaryRow.average_readiness),
          belowReadinessCount: Number(summaryRow.below_readiness_count) || 0,
          verifiedProjectsPerStudent: assignedStudents
            ? Number((Number(projectRows[0]?.verified_projects || 0) / assignedStudents).toFixed(1))
            : null
        },
        skillCategories,
        readinessDistribution,
        atRiskStudents
      }
    });
  } catch (error) {
    console.error('Get teacher analytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve teacher analytics.' });
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

    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    if (!cleanTitle || !assessment_type) {
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
      [cleanTitle, typeof description === 'string' && description.trim() ? description.trim() : null, assessment_type, userId]
    );

    return res.status(201).json({
      success: true,
      message: 'Assessment created successfully.',
      data: {
        id: result.insertId,
        title: cleanTitle,
        description: typeof description === 'string' && description.trim() ? description.trim() : null,
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
    const { limit, offset } = getPagination(req.query);

    const [[assessments], [countRows]] = await Promise.all([
      db.query(
        `SELECT a.id, a.title, a.description, a.assessment_type, a.total_marks,
                a.published_at, a.created_at,
                (SELECT COUNT(*) FROM assessment_questions q WHERE q.assessment_id = a.id) AS total_questions,
                (SELECT COUNT(*) FROM assessment_attempts aa
                 WHERE aa.assessment_id = a.id AND aa.status IN ('submitted', 'evaluated')) AS submissions,
                (SELECT COUNT(*) FROM assessment_attempts aa
                 WHERE aa.assessment_id = a.id AND aa.status = 'evaluated') AS evaluated_attempts,
                (SELECT ROUND(AVG(aa.score), 2) FROM assessment_attempts aa
                 WHERE aa.assessment_id = a.id AND aa.status = 'evaluated') AS average_score
         FROM assessments a
         WHERE a.created_by = ?
         ORDER BY a.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      ),
      db.query('SELECT COUNT(*) AS total FROM assessments WHERE created_by = ?', [userId])
    ]);

    return res.json({
      success: true,
      data: assessments,
      pagination: { limit, offset, total: Number(countRows[0]?.total) || 0 }
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
      `SELECT a.id, a.total_marks, t.department_id
       FROM assessments a
       INNER JOIN teachers t ON t.user_id = ?
       WHERE a.id = ? AND a.created_by = ?`,
      [userId, assessmentId, userId]
    );

    if (!ownership.length) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these results.'
      });
    }

    const [results] = await db.query(
      `SELECT a.id, s.enrollment_number, u.full_name, u.email,
              a.started_at, a.submitted_at, a.score, a.status,
              ? AS total_marks
       FROM assessment_attempts a
       INNER JOIN users u ON u.id = a.student_user_id AND u.status = 'active'
       INNER JOIN students s ON s.user_id = a.student_user_id
       WHERE a.assessment_id = ? AND s.department_id = ?
         AND a.status = 'evaluated' AND a.score IS NOT NULL
       ORDER BY a.score DESC, a.submitted_at ASC`,
      [ownership[0].total_marks, assessmentId, ownership[0].department_id]
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
  getTeacherAnalytics,
  createAssessment,
  getTeacherAssessments,
  publishAssessment,
  getAssessmentResults,
  submitStudentVerification
};
