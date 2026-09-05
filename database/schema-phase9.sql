-- Phase 9: Analytics & Performance Dashboards Schema
-- Add these tables and views to EduPredict database

USE EduPredict;

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- Student Metrics Table (Cached Analytics)
-- Purpose: Store aggregated student performance metrics for quick dashboard access
CREATE TABLE IF NOT EXISTS student_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL UNIQUE,
  batch_id INT,
  overall_score DECIMAL(5,2) DEFAULT 0.00,
  aptitude_score DECIMAL(5,2) DEFAULT 0.00,
  coding_score DECIMAL(5,2) DEFAULT 0.00,
  assessment_attempts INT DEFAULT 0,
  assessment_passed INT DEFAULT 0,
  assessment_avg_score DECIMAL(5,2) DEFAULT 0.00,
  profile_completion_pct INT DEFAULT 0,
  placement_ready_score DECIMAL(5,2) DEFAULT 0.00,
  cohort_percentile INT DEFAULT 0,
  performance_trend ENUM('improving', 'declining', 'stable') DEFAULT 'stable',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_metrics_student FOREIGN KEY (student_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_overall_score (overall_score),
  INDEX idx_cohort_percentile (cohort_percentile),
  INDEX idx_batch_id (batch_id),
  INDEX idx_placement_ready_score (placement_ready_score)
);

-- Skill Proficiency Table
-- Purpose: Track student performance in different skill categories
CREATE TABLE IF NOT EXISTS skill_proficiency (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  skill_category VARCHAR(100) NOT NULL,
  skill_name VARCHAR(150) NOT NULL,
  avg_score DECIMAL(5,2) DEFAULT 0.00,
  max_score DECIMAL(5,2) DEFAULT 0.00,
  attempts INT DEFAULT 0,
  passed_count INT DEFAULT 0,
  last_attempted TIMESTAMP NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_skill_student FOREIGN KEY (student_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY unique_student_skill (student_id, skill_category, skill_name),
  INDEX idx_avg_score (avg_score),
  INDEX idx_skill_category (skill_category)
);

-- At-Risk Students Table
-- Purpose: Flag and track students who are at risk of poor placement/academic performance
CREATE TABLE IF NOT EXISTS at_risk_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  batch_id INT,
  risk_score DECIMAL(5,2) NOT NULL,
  risk_factors JSON,
  risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  flagged_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  teacher_id INT,
  intervention_status ENUM('flagged', 'contacted', 'intervening', 'improved', 'resolved') DEFAULT 'flagged',
  intervention_notes TEXT,
  last_contacted TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_atrisk_student FOREIGN KEY (student_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_atrisk_batch FOREIGN KEY (batch_id) REFERENCES batches(id),
  CONSTRAINT fk_atrisk_teacher FOREIGN KEY (teacher_id) REFERENCES users(id),
  INDEX idx_risk_score (risk_score),
  INDEX idx_risk_level (risk_level),
  INDEX idx_intervention_status (intervention_status),
  INDEX idx_batch_id (batch_id)
);

-- Assessment Performance Analytics Table
-- Purpose: Track question-level performance metrics for assessment quality analysis
CREATE TABLE IF NOT EXISTS assessment_question_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assessment_id INT NOT NULL,
  question_id INT NOT NULL,
  total_responses INT DEFAULT 0,
  correct_responses INT DEFAULT 0,
  incorrect_responses INT DEFAULT 0,
  avg_time_seconds INT DEFAULT 0,
  difficulty_index DECIMAL(3,2) DEFAULT 0.50,
  discrimination_index DECIMAL(3,2) DEFAULT 0.00,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_qa_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_qa_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY unique_assessment_question (assessment_id, question_id),
  INDEX idx_difficulty_index (difficulty_index),
  INDEX idx_discrimination_index (discrimination_index)
);

-- Department Performance Analytics Table
-- Purpose: Store aggregated department-level metrics
CREATE TABLE IF NOT EXISTS department_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL UNIQUE,
  total_students INT DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0.00,
  score_stddev DECIMAL(5,2) DEFAULT 0.00,
  pass_rate DECIMAL(5,2) DEFAULT 0.00,
  placement_ready_count INT DEFAULT 0,
  placement_ready_pct DECIMAL(5,2) DEFAULT 0.00,
  avg_profile_completion INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dept_metrics FOREIGN KEY (department_id) REFERENCES departments(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_avg_score (avg_score),
  INDEX idx_placement_ready_pct (placement_ready_pct)
);

-- Batch (Cohort) Performance Analytics Table
-- Purpose: Compare performance metrics across different batches
CREATE TABLE IF NOT EXISTS batch_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL UNIQUE,
  department_id INT,
  academic_year_id INT,
  total_students INT DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0.00,
  score_stddev DECIMAL(5,2) DEFAULT 0.00,
  pass_rate DECIMAL(5,2) DEFAULT 0.00,
  placement_ready_count INT DEFAULT 0,
  placement_ready_pct DECIMAL(5,2) DEFAULT 0.00,
  top_performer_count INT DEFAULT 0,
  at_risk_count INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_batch_metrics FOREIGN KEY (batch_id) REFERENCES batches(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_batch_metrics_dept FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT fk_batch_metrics_ay FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  INDEX idx_avg_score (avg_score),
  INDEX idx_academic_year_id (academic_year_id)
);

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- View 1: Department Performance Overview
-- Aggregates student metrics at the department level
CREATE OR REPLACE VIEW vw_department_performance AS
SELECT 
  d.id AS department_id,
  d.name AS department_name,
  COUNT(DISTINCT s.user_id) AS student_count,
  ROUND(AVG(sm.overall_score), 2) AS avg_score,
  ROUND(STDDEV(sm.overall_score), 2) AS score_stddev,
  ROUND(SUM(CASE WHEN sm.overall_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.user_id) * 100, 2) AS pass_rate,
  ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END), 0) AS placement_ready_count,
  ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.user_id) * 100, 2) AS placement_ready_pct
FROM departments d
LEFT JOIN students s ON d.id = s.department_id
LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
GROUP BY d.id, d.name;

-- View 2: Batch Performance Comparison
-- Compares metrics across different batches within a department
CREATE OR REPLACE VIEW vw_batch_performance AS
SELECT 
  b.id AS batch_id,
  b.name AS batch_name,
  ay.name AS academic_year,
  d.id AS department_id,
  d.name AS department_name,
  COUNT(DISTINCT s.user_id) AS student_count,
  ROUND(AVG(sm.overall_score), 2) AS avg_score,
  ROUND(SUM(CASE WHEN sm.overall_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.user_id) * 100, 2) AS pass_rate,
  ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END), 0) AS placement_ready_count
FROM batches b
LEFT JOIN academic_years ay ON b.academic_year_id = ay.id
LEFT JOIN departments d ON b.department_id = d.id
LEFT JOIN students s ON b.id = s.batch_id
LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
GROUP BY b.id, b.name, ay.name, d.id, d.name;

-- View 3: Skill Distribution Across Department
-- Shows proficiency distribution for each skill in a department
CREATE OR REPLACE VIEW vw_skill_distribution AS
SELECT 
  d.id AS department_id,
  d.name AS department_name,
  sp.skill_category,
  sp.skill_name,
  COUNT(DISTINCT sp.student_id) AS student_count,
  ROUND(AVG(sp.avg_score), 2) AS avg_proficiency,
  ROUND(SUM(CASE WHEN sp.avg_score >= 70 THEN 1 ELSE 0 END) / COUNT(DISTINCT sp.student_id) * 100, 2) AS proficient_pct
FROM skill_proficiency sp
JOIN students s ON sp.student_id = s.user_id
JOIN departments d ON s.department_id = d.id
GROUP BY d.id, d.name, sp.skill_category, sp.skill_name;

-- View 4: Assessment Performance Analytics
-- Aggregates question-level analytics for assessment quality
CREATE OR REPLACE VIEW vw_assessment_quality AS
SELECT 
  a.id AS assessment_id,
  a.title AS assessment_title,
  a.created_by AS teacher_id,
  COUNT(DISTINCT qa.question_id) AS total_questions,
  ROUND(AVG(qa.difficulty_index), 2) AS avg_difficulty,
  ROUND(AVG(qa.discrimination_index), 2) AS avg_discrimination,
  COUNT(DISTINCT ar.student_user_id) AS total_attempts,
  ROUND(AVG(ar.score), 2) AS avg_score
FROM assessments a
LEFT JOIN assessment_question_analytics qa ON a.id = qa.assessment_id
LEFT JOIN assessment_attempts ar ON a.id = ar.assessment_id
GROUP BY a.id, a.title, a.created_by;

-- View 5: Student Performance Comparison (with Cohort Stats)
-- Compares individual student metrics with cohort averages
CREATE OR REPLACE VIEW vw_student_cohort_comparison AS
SELECT 
  sm.student_id,
  u.full_name AS student_name,
  s.batch_id,
  b.name AS batch_name,
  sm.overall_score AS student_score,
  ROUND(AVG(sm2.overall_score), 2) AS cohort_avg_score,
  ROUND(sm.overall_score - AVG(sm2.overall_score), 2) AS score_diff_from_cohort,
  sm.cohort_percentile,
  ROUND(STDDEV(sm2.overall_score), 2) AS cohort_stddev,
  ROUND((sm.overall_score - AVG(sm2.overall_score)) / STDDEV(sm2.overall_score), 2) AS z_score
FROM student_metrics sm
JOIN users u ON sm.student_id = u.id
JOIN students s ON sm.student_id = s.user_id
JOIN batches b ON s.batch_id = b.id
JOIN student_metrics sm2 ON s.batch_id = sm2.batch_id
GROUP BY sm.student_id, u.full_name, s.batch_id, b.name, sm.overall_score, sm.cohort_percentile;

-- View 6: At-Risk Students Summary
-- Shows at-risk students with their risk factors and intervention status
CREATE OR REPLACE VIEW vw_at_risk_summary AS
SELECT 
  ars.id,
  ars.student_id,
  u.full_name AS student_name,
  s.batch_id,
  b.name AS batch_name,
  ars.risk_score,
  ars.risk_level,
  ars.risk_factors,
  ars.intervention_status,
  DATEDIFF(NOW(), ars.last_contacted) AS days_since_contact,
  sm.overall_score,
  sm.profile_completion_pct
FROM at_risk_students ars
JOIN users u ON ars.student_id = u.id
JOIN students s ON ars.student_id = s.user_id
JOIN batches b ON s.batch_id = b.id
LEFT JOIN student_metrics sm ON ars.student_id = sm.student_id
ORDER BY ars.risk_score DESC;

-- View 7: Teacher Class Analytics
-- Aggregates all metrics for a teacher's assessments and student performance
CREATE OR REPLACE VIEW vw_teacher_class_analytics AS
SELECT 
  a.created_by AS teacher_id,
  u.full_name AS teacher_name,
  COUNT(DISTINCT aa.student_user_id) AS assessed_students,
  ROUND(AVG(aa.score), 2) AS class_avg_score,
  ROUND(STDDEV(aa.score), 2) AS class_score_stddev,
  ROUND(MIN(aa.score), 2) AS class_min_score,
  ROUND(MAX(aa.score), 2) AS class_max_score,
  ROUND(SUM(CASE WHEN aa.score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT aa.student_user_id) * 100, 2) AS pass_rate,
  COUNT(DISTINCT a.id) AS assessments_created
FROM assessments a
LEFT JOIN assessment_attempts aa ON a.id = aa.assessment_id
JOIN users u ON a.created_by = u.id
GROUP BY a.created_by, u.full_name;

-- View 8: System-Wide Analytics
-- High-level metrics for admin dashboard
CREATE OR REPLACE VIEW vw_system_analytics AS
SELECT 
  COUNT(DISTINCT u.id) AS total_users,
  SUM(CASE WHEN r.name = 'student' THEN 1 ELSE 0 END) AS total_students,
  SUM(CASE WHEN r.name = 'teacher' THEN 1 ELSE 0 END) AS total_teachers,
  SUM(CASE WHEN r.name = 'admin' THEN 1 ELSE 0 END) AS total_admins,
  COUNT(DISTINCT d.id) AS total_departments,
  COUNT(DISTINCT a.id) AS total_assessments,
  ROUND(AVG(sm.overall_score), 2) AS system_avg_score,
  ROUND(SUM(CASE WHEN sm.overall_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT sm.student_id) * 100, 2) AS system_pass_rate,
  ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END), 0) AS placement_ready_students,
  ROUND(SUM(CASE WHEN sm.placement_ready_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT sm.student_id) * 100, 2) AS placement_ready_pct
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
CROSS JOIN departments d
CROSS JOIN assessments a
LEFT JOIN student_metrics sm ON u.id = sm.student_id;

-- ============================================================================
-- STORED PROCEDURES FOR ANALYTICS CALCULATION
-- ============================================================================

-- Procedure: Recalculate Student Metrics
-- Purpose: Update all student metrics in batch (typically run periodically)
DELIMITER $$

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
  
  -- Calculate Aptitude Assessment Score (40% weight)
  SELECT ROUND(AVG(aa.score), 2) INTO v_aptitude_score
  FROM assessment_attempts aa
  WHERE aa.student_user_id = p_student_id
  AND aa.assessment_id IN (SELECT id FROM assessments WHERE type = 'aptitude' AND status = 'published')
  LIMIT 100;
  
  SET v_aptitude_score = IFNULL(v_aptitude_score, 0);
  
  -- Calculate Coding Assessment Score (40% weight)
  SELECT ROUND(AVG(score), 2) INTO v_coding_score
  FROM coding_submissions
  WHERE student_user_id = p_student_id AND status = 'graded'
  LIMIT 100;
  
  SET v_coding_score = IFNULL(v_coding_score, 0);
  
  -- Calculate Overall Score (weighted average)
  SET v_total_score = ROUND((v_aptitude_score * 0.4) + (v_coding_score * 0.4), 2);
  
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
  
  -- Calculate placement readiness score (60% assessments + 40% profile)
  SET v_placement_score = ROUND((v_avg_score * 0.6) + (v_profile_completion * 0.4), 2);
  
  -- Calculate percentile within batch
  SELECT COUNT(*) + 1 INTO v_percentile
  FROM student_metrics sm2
  JOIN students s2 ON sm2.student_id = s2.user_id
  WHERE s2.batch_id = v_batch_id AND sm2.overall_score > v_total_score;
  
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
END$$

DELIMITER ;

-- Procedure: Detect At-Risk Students
-- Purpose: Identify and flag students at risk based on multiple factors
DELIMITER $$

CREATE PROCEDURE sp_detect_at_risk_students(IN p_batch_id INT)
BEGIN
  DECLARE v_risk_threshold DECIMAL(5,2);
  SET v_risk_threshold = 50;
  
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
END$$

DELIMITER ;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_student_metrics_batch ON student_metrics(batch_id);
CREATE INDEX idx_skill_prof_student ON skill_proficiency(student_id);
CREATE INDEX idx_skill_prof_category ON skill_proficiency(skill_category);
CREATE INDEX idx_atrisk_batch ON at_risk_students(batch_id);
CREATE INDEX idx_atrisk_status ON at_risk_students(intervention_status);
CREATE INDEX idx_qa_assessment ON assessment_question_analytics(assessment_id);
CREATE INDEX idx_dept_metrics_dept ON department_metrics(department_id);
CREATE INDEX idx_batch_metrics_dept ON batch_metrics(department_id);

-- ============================================================================
-- INITIAL DATA TRIGGERS (Optional)
-- ============================================================================

-- Trigger: Auto-recalculate metrics when assessment response is added
DELIMITER $$

CREATE TRIGGER trg_student_metrics_on_assessment 
AFTER INSERT ON assessment_attempts
FOR EACH ROW
BEGIN
  CALL sp_recalculate_student_metrics(NEW.student_user_id);
END$$

DELIMITER ;

-- Trigger: Auto-recalculate metrics when coding submission is graded
DELIMITER $$

CREATE TRIGGER trg_student_metrics_on_coding_submission 
AFTER UPDATE ON coding_submissions
FOR EACH ROW
BEGIN
  IF NEW.status = 'graded' AND OLD.status != 'graded' THEN
    CALL sp_recalculate_student_metrics(NEW.student_user_id);
  END IF;
END$$

DELIMITER ;

-- ============================================================================
-- NOTES
-- ============================================================================
/*
Phase 9 Analytics Schema includes:

TABLES:
1. student_metrics - Cached student performance metrics (overall score, aptitude, coding, profile completion)
2. skill_proficiency - Skill-based performance tracking for each student
3. at_risk_students - Flagging and tracking at-risk students with intervention status
4. assessment_question_analytics - Question-level metrics for assessment quality analysis
5. department_metrics - Department-wide aggregated metrics
6. batch_metrics - Batch-specific metrics for cohort comparison

VIEWS:
1. vw_department_performance - Department-level performance overview
2. vw_batch_performance - Batch comparison across department
3. vw_skill_distribution - Skill proficiency distribution in departments
4. vw_assessment_quality - Assessment quality metrics
5. vw_student_cohort_comparison - Student vs cohort performance
6. vw_at_risk_summary - At-risk students with intervention tracking
7. vw_teacher_class_analytics - Teacher's class-level metrics
8. vw_system_analytics - System-wide admin metrics

STORED PROCEDURES:
1. sp_recalculate_student_metrics - Recalculate all metrics for a student
2. sp_detect_at_risk_students - Identify and flag at-risk students in a batch

TRIGGERS:
1. trg_student_metrics_on_assessment - Auto-update metrics on new assessment response
2. trg_student_metrics_on_coding_submission - Auto-update metrics on coding submission grade

To use:
1. Run this script: mysql -u root EduPredict < database/schema-phase9.sql
2. Verify: SELECT * FROM student_metrics;
3. Run metrics: CALL sp_recalculate_student_metrics(1);
4. Detect at-risk: CALL sp_detect_at_risk_students(1);
*/
