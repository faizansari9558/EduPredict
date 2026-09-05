require('dotenv').config();
const mysql = require('mysql2/promise');

async function seedAnalyticsData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'EduPredict'
  });

  console.log('Connected to EduPredict database');

  // 1. Seed Skill Proficiency
  const skillsData = [
    // Student 5 (Aisha Khan - CSE)
    { student_id: 5, skill_category: 'Programming', skill_name: 'Python', avg_score: 88.5, max_score: 95.0, attempts: 6, passed_count: 5 },
    { student_id: 5, skill_category: 'Programming', skill_name: 'JavaScript', avg_score: 82.0, max_score: 90.0, attempts: 4, passed_count: 4 },
    { student_id: 5, skill_category: 'Aptitude', skill_name: 'Quantitative Aptitude', avg_score: 75.0, max_score: 85.0, attempts: 5, passed_count: 4 },
    { student_id: 5, skill_category: 'Aptitude', skill_name: 'Logical Reasoning', avg_score: 80.0, max_score: 90.0, attempts: 4, passed_count: 4 },
    { student_id: 5, skill_category: 'Core CS', skill_name: 'Data Structures', avg_score: 78.0, max_score: 88.0, attempts: 5, passed_count: 4 },
    { student_id: 5, skill_category: 'Core CS', skill_name: 'Database Management', avg_score: 65.0, max_score: 75.0, attempts: 3, passed_count: 2 },
    { student_id: 5, skill_category: 'Soft Skills', skill_name: 'Verbal Ability', avg_score: 70.0, max_score: 80.0, attempts: 3, passed_count: 2 },

    // Student 6 (Raj Patel - CSE)
    { student_id: 6, skill_category: 'Programming', skill_name: 'Java', avg_score: 92.0, max_score: 98.0, attempts: 7, passed_count: 7 },
    { student_id: 6, skill_category: 'Programming', skill_name: 'Python', avg_score: 76.0, max_score: 85.0, attempts: 4, passed_count: 3 },
    { student_id: 6, skill_category: 'Aptitude', skill_name: 'Quantitative Aptitude', avg_score: 85.0, max_score: 92.0, attempts: 6, passed_count: 5 },
    { student_id: 6, skill_category: 'Core CS', skill_name: 'Algorithms', avg_score: 88.0, max_score: 95.0, attempts: 5, passed_count: 5 },

    // Student 7 (Priya Sharma - CSE)
    { student_id: 7, skill_category: 'Programming', skill_name: 'Python', avg_score: 62.0, max_score: 70.0, attempts: 3, passed_count: 2 },
    { student_id: 7, skill_category: 'Aptitude', skill_name: 'Quantitative Aptitude', avg_score: 55.0, max_score: 65.0, attempts: 3, passed_count: 1 },
    { student_id: 7, skill_category: 'Core CS', skill_name: 'Operating Systems', avg_score: 58.0, max_score: 68.0, attempts: 2, passed_count: 1 }
  ];

  for (const s of skillsData) {
    await connection.query(`
      INSERT INTO skill_proficiency 
      (student_id, skill_category, skill_name, avg_score, max_score, attempts, passed_count, last_attempted)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
      avg_score = VALUES(avg_score),
      max_score = VALUES(max_score),
      attempts = VALUES(attempts),
      passed_count = VALUES(passed_count),
      last_attempted = NOW()
    `, [s.student_id, s.skill_category, s.skill_name, s.avg_score, s.max_score, s.attempts, s.passed_count]);
  }
  console.log('✓ Seeded skill proficiency data');

  // 2. Seed Assessment Attempts if assessments exist
  const [assessments] = await connection.query("SELECT id, title, assessment_type FROM assessments LIMIT 5");
  if (assessments.length > 0) {
    for (let i = 0; i < assessments.length; i++) {
      const a = assessments[i];
      const scores = [85.0, 72.5, 90.0, 65.0, 78.0];
      await connection.query(`
        INSERT INTO assessment_attempts 
        (assessment_id, student_user_id, started_at, submitted_at, score, status)
        VALUES (?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), DATE_SUB(NOW(), INTERVAL ? DAY), ?, 'evaluated')
      `, [a.id, 5, (i + 1) * 3, (i + 1) * 3, scores[i % scores.length]]);
    }
    console.log('✓ Seeded sample assessment attempts for student 5');
  }

  // 3. Recalculate metrics for all students
  const [students] = await connection.query("SELECT user_id FROM students");
  for (const stu of students) {
    try {
      await connection.query("CALL sp_recalculate_student_metrics(?)", [stu.user_id]);
    } catch (e) {
      console.warn(`Warning calculating metrics for student ${stu.user_id}:`, e.message);
    }
  }
  console.log('✓ Recalculated metrics for students');

  // 4. Update student metrics with realistic scores if zero
  await connection.query(`
    UPDATE student_metrics 
    SET 
      overall_score = 78.50,
      aptitude_score = 82.00,
      coding_score = 75.00,
      assessment_attempts = 5,
      assessment_passed = 4,
      assessment_avg_score = 78.50,
      profile_completion_pct = 85,
      placement_ready_score = 81.10,
      cohort_percentile = 78,
      performance_trend = 'improving'
    WHERE student_id = 5
  `);

  await connection.query(`
    UPDATE student_metrics 
    SET 
      overall_score = 85.00,
      aptitude_score = 88.00,
      coding_score = 82.00,
      assessment_attempts = 6,
      assessment_passed = 6,
      assessment_avg_score = 85.00,
      profile_completion_pct = 90,
      placement_ready_score = 87.00,
      cohort_percentile = 92,
      performance_trend = 'improving'
    WHERE student_id = 6
  `);

  await connection.query(`
    UPDATE student_metrics 
    SET 
      overall_score = 52.00,
      aptitude_score = 55.00,
      coding_score = 49.00,
      assessment_attempts = 3,
      assessment_passed = 1,
      assessment_avg_score = 52.00,
      profile_completion_pct = 60,
      placement_ready_score = 55.20,
      cohort_percentile = 35,
      performance_trend = 'declining'
    WHERE student_id = 7
  `);

  // 5. Seed Department Metrics
  const deptMetrics = [
    { department_id: 1, total_students: 45, avg_score: 74.5, score_stddev: 8.2, pass_rate: 85.0, placement_ready_count: 38, placement_ready_pct: 84.4, avg_profile_completion: 82 },
    { department_id: 2, total_students: 38, avg_score: 71.0, score_stddev: 9.1, pass_rate: 78.0, placement_ready_count: 30, placement_ready_pct: 78.9, avg_profile_completion: 76 },
    { department_id: 3, total_students: 35, avg_score: 68.5, score_stddev: 10.4, pass_rate: 72.0, placement_ready_count: 25, placement_ready_pct: 71.4, avg_profile_completion: 70 }
  ];

  for (const dm of deptMetrics) {
    await connection.query(`
      INSERT INTO department_metrics 
      (department_id, total_students, avg_score, score_stddev, pass_rate, placement_ready_count, placement_ready_pct, avg_profile_completion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      total_students = VALUES(total_students),
      avg_score = VALUES(avg_score),
      score_stddev = VALUES(score_stddev),
      pass_rate = VALUES(pass_rate),
      placement_ready_count = VALUES(placement_ready_count),
      placement_ready_pct = VALUES(placement_ready_pct),
      avg_profile_completion = VALUES(avg_profile_completion)
    `, [dm.department_id, dm.total_students, dm.avg_score, dm.score_stddev, dm.pass_rate, dm.placement_ready_count, dm.placement_ready_pct, dm.avg_profile_completion]);
  }
  console.log('✓ Seeded department metrics');

  // 6. Seed Batch Metrics
  const batchMetrics = [
    { batch_id: 1, department_id: 1, academic_year: '2025-2026', total_students: 24, avg_score: 76.8, score_stddev: 7.5, pass_rate: 88.0, placement_ready_count: 19, placement_ready_pct: 79.2, top_performer_count: 6, at_risk_count: 2 },
    { batch_id: 2, department_id: 1, academic_year: '2025-2026', total_students: 21, avg_score: 72.1, score_stddev: 8.9, pass_rate: 81.0, placement_ready_count: 15, placement_ready_pct: 71.4, top_performer_count: 4, at_risk_count: 2 },
    { batch_id: 3, department_id: 2, academic_year: '2025-2026', total_students: 38, avg_score: 71.0, score_stddev: 9.1, pass_rate: 78.0, placement_ready_count: 26, placement_ready_pct: 68.4, top_performer_count: 7, at_risk_count: 6 },
    { batch_id: 4, department_id: 3, academic_year: '2025-2026', total_students: 35, avg_score: 68.5, score_stddev: 10.4, pass_rate: 72.0, placement_ready_count: 22, placement_ready_pct: 62.8, top_performer_count: 5, at_risk_count: 5 }
  ];

  for (const bm of batchMetrics) {
    await connection.query(`
      INSERT INTO batch_metrics
      (batch_id, department_id, academic_year, total_students, avg_score, score_stddev, pass_rate, placement_ready_count, placement_ready_pct, top_performer_count, at_risk_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      total_students = VALUES(total_students),
      avg_score = VALUES(avg_score),
      score_stddev = VALUES(score_stddev),
      pass_rate = VALUES(pass_rate),
      placement_ready_count = VALUES(placement_ready_count),
      placement_ready_pct = VALUES(placement_ready_pct),
      top_performer_count = VALUES(top_performer_count),
      at_risk_count = VALUES(at_risk_count)
    `, [bm.batch_id, bm.department_id, bm.academic_year, bm.total_students, bm.avg_score, bm.score_stddev, bm.pass_rate, bm.placement_ready_count, bm.placement_ready_pct, bm.top_performer_count, bm.at_risk_count]);
  }
  console.log('✓ Seeded batch metrics');

  // 7. Seed At Risk Students
  await connection.query(`
    INSERT INTO at_risk_students 
    (student_id, batch_id, risk_score, risk_factors, risk_level, teacher_id, intervention_status, intervention_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    risk_score = VALUES(risk_score),
    risk_level = VALUES(risk_level),
    intervention_status = VALUES(intervention_status)
  `, [
    7, 2, 68.50, 
    JSON.stringify({ low_assessment_score: true, incomplete_profile: true, declining_performance: true }),
    'high', 2, 'flagged', 'Low scores in technical assessments; needs remedial guidance in data structures.'
  ]);
  console.log('✓ Seeded at-risk student data');

  console.log('\n🎉 Analytics data seeding complete!');
  await connection.end();
}

seedAnalyticsData().catch(e => { console.error('Seed error:', e); process.exit(1); });
