require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixProcedures() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'EduPredict',
    multipleStatements: true
  });

  console.log('Connected to EduPredict database');

  await connection.query('DROP PROCEDURE IF EXISTS sp_recalculate_student_metrics');
  await connection.query('DROP PROCEDURE IF EXISTS sp_detect_at_risk_students');

  const createProc1 = `
    CREATE PROCEDURE sp_recalculate_student_metrics(IN p_student_id INT)
    BEGIN
      DECLARE v_total_score DECIMAL(5,2);
      DECLARE v_aptitude_score DECIMAL(5,2);
      DECLARE v_coding_score DECIMAL(5,2);
      DECLARE v_attempts INT;
      DECLARE v_passed INT;
      DECLARE v_avg_score DECIMAL(5,2);
      DECLARE v_profile_completion INT;
      DECLARE v_placement_score DECIMAL(5,2);
      DECLARE v_percentile INT;
      DECLARE v_batch_id INT;
      
      -- Get batch_id
      SELECT batch_id INTO v_batch_id FROM students WHERE user_id = p_student_id;
      
      -- Calculate Aptitude Assessment Score
      SELECT ROUND(AVG(aa.score), 2) INTO v_aptitude_score
      FROM assessment_attempts aa
      WHERE aa.student_user_id = p_student_id
      AND aa.assessment_id IN (SELECT id FROM assessments WHERE assessment_type = 'aptitude' AND published_at IS NOT NULL);
      
      SET v_aptitude_score = IFNULL(v_aptitude_score, 0);
      
      -- Calculate Coding Assessment Score
      SELECT ROUND(AVG(score), 2) INTO v_coding_score
      FROM coding_submissions
      WHERE student_user_id = p_student_id AND status = 'graded';
      
      SET v_coding_score = IFNULL(v_coding_score, 0);
      
      -- Calculate Overall Score
      SET v_total_score = ROUND((v_aptitude_score * 0.5) + (v_coding_score * 0.5), 2);
      
      -- Count assessment attempts
      SELECT COUNT(*) INTO v_attempts
      FROM assessment_attempts
      WHERE student_user_id = p_student_id;
      
      SELECT COUNT(*) INTO v_passed
      FROM assessment_attempts
      WHERE student_user_id = p_student_id AND score >= 60;
      
      -- Average assessment score
      SELECT ROUND(AVG(score), 2) INTO v_avg_score
      FROM assessment_attempts
      WHERE student_user_id = p_student_id;
      
      SET v_avg_score = IFNULL(v_avg_score, 0);
      
      -- Calculate profile completion percentage
      SELECT ROUND(
        (CASE WHEN s.cgpa IS NOT NULL THEN 25 ELSE 0 END +
         CASE WHEN s.tenth_percentage IS NOT NULL THEN 25 ELSE 0 END +
         CASE WHEN s.twelfth_percentage IS NOT NULL THEN 25 ELSE 0 END +
         CASE WHEN (SELECT COUNT(*) FROM skill_proficiency sp WHERE sp.student_id = p_student_id) > 0 THEN 25 ELSE 0 END), 0
      ) INTO v_profile_completion
      FROM students s
      WHERE s.user_id = p_student_id;
      
      SET v_profile_completion = IFNULL(v_profile_completion, 0);
      
      -- Calculate placement readiness score
      SET v_placement_score = ROUND((v_avg_score * 0.6) + (v_profile_completion * 0.4), 2);
      
      -- Calculate percentile within batch
      SELECT COUNT(*) + 1 INTO v_percentile
      FROM student_metrics sm2
      JOIN students s2 ON sm2.student_id = s2.user_id
      WHERE s2.batch_id = v_batch_id AND sm2.overall_score > v_total_score;
      
      SET v_percentile = IFNULL(v_percentile, 1);

      -- Update or insert student metrics
      INSERT INTO student_metrics (
        student_id, batch_id, overall_score, aptitude_score, coding_score,
        assessment_attempts, assessment_passed, assessment_avg_score,
        profile_completion_pct, placement_ready_score, cohort_percentile
      ) VALUES (
        p_student_id, v_batch_id, v_total_score, v_aptitude_score, v_coding_score,
        v_attempts, v_passed, v_avg_score,
        v_profile_completion, v_placement_score, v_percentile
      )
      ON DUPLICATE KEY UPDATE
        overall_score = v_total_score,
        aptitude_score = v_aptitude_score,
        coding_score = v_coding_score,
        assessment_attempts = v_attempts,
        assessment_passed = v_passed,
        assessment_avg_score = v_avg_score,
        profile_completion_pct = v_profile_completion,
        placement_ready_score = v_placement_score,
        cohort_percentile = v_percentile,
        last_updated = CURRENT_TIMESTAMP;
    END
  `;

  await connection.query(createProc1);
  console.log('✓ sp_recalculate_student_metrics updated');

  const createProc2 = `
    CREATE PROCEDURE sp_detect_at_risk_students(IN p_batch_id INT)
    BEGIN
      INSERT INTO at_risk_students (
        student_id, batch_id, risk_score, risk_factors, risk_level, flagged_date
      )
      SELECT 
        sm.student_id,
        p_batch_id,
        ROUND(
          (CASE WHEN sm.overall_score < 40 THEN 40 ELSE 0 END +
           CASE WHEN sm.overall_score BETWEEN 40 AND 50 THEN 20 ELSE 0 END +
           CASE WHEN sm.profile_completion_pct < 50 THEN 20 ELSE 0 END +
           CASE WHEN sm.profile_completion_pct BETWEEN 50 AND 70 THEN 10 ELSE 0 END +
           CASE WHEN sm.assessment_attempts < 2 THEN 15 ELSE 0 END +
           CASE WHEN sm.performance_trend = 'declining' THEN 15 ELSE 0 END) / 2, 2
        ) AS risk_score,
        JSON_OBJECT(
          'low_assessment_score', sm.overall_score < 40,
          'borderline_score', sm.overall_score BETWEEN 40 AND 50,
          'incomplete_profile', sm.profile_completion_pct < 70,
          'low_engagement', sm.assessment_attempts < 2,
          'declining_performance', sm.performance_trend = 'declining'
        ) AS risk_factors,
        CASE 
          WHEN (sm.overall_score < 40 OR sm.profile_completion_pct < 50) THEN 'critical'
          WHEN (sm.overall_score < 50 OR sm.profile_completion_pct < 70) THEN 'high'
          WHEN sm.assessment_attempts < 2 THEN 'medium'
          ELSE 'low'
        END AS risk_level,
        CURRENT_TIMESTAMP
      FROM student_metrics sm
      JOIN students s ON sm.student_id = s.user_id
      WHERE s.batch_id = p_batch_id
      AND (sm.overall_score < 60 OR sm.profile_completion_pct < 70 OR sm.assessment_attempts < 2)
      AND NOT EXISTS (
        SELECT 1 FROM at_risk_students ars 
        WHERE ars.student_id = sm.student_id AND ars.batch_id = p_batch_id
      )
      ON DUPLICATE KEY UPDATE
        risk_score = VALUES(risk_score),
        risk_factors = VALUES(risk_factors),
        risk_level = VALUES(risk_level),
        updated_at = CURRENT_TIMESTAMP;
    END
  `;

  await connection.query(createProc2);
  console.log('✓ sp_detect_at_risk_students updated');

  await connection.end();
}

fixProcedures().catch(e => { console.error('Procedure update error:', e); process.exit(1); });
