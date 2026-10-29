-- Development-only analytics fixture.
-- Adds linked metrics and placement records without changing users or students.
USE EduPredict;

START TRANSACTION;

INSERT INTO student_metrics
  (student_id, batch_id, overall_score, aptitude_score, coding_score,
   assessment_attempts, assessment_passed, assessment_avg_score,
   profile_completion_pct, placement_ready_score, cohort_percentile, performance_trend)
SELECT s.user_id, s.batch_id,
  CASE s.user_id WHEN 5 THEN 86.00 WHEN 6 THEN 74.00 WHEN 7 THEN 68.00
                 WHEN 8 THEN 91.00 WHEN 9 THEN 57.00 END,
  CASE s.user_id WHEN 5 THEN 88.00 WHEN 6 THEN 76.00 WHEN 7 THEN 70.00
                 WHEN 8 THEN 94.00 WHEN 9 THEN 52.00 END,
  CASE s.user_id WHEN 5 THEN 84.00 WHEN 6 THEN 71.00 WHEN 7 THEN 63.00
                 WHEN 8 THEN 89.00 WHEN 9 THEN 48.00 END,
  3, 2,
  CASE s.user_id WHEN 5 THEN 86.00 WHEN 6 THEN 73.50 WHEN 7 THEN 66.50
                 WHEN 8 THEN 91.50 WHEN 9 THEN 50.00 END,
  CASE s.user_id WHEN 5 THEN 100 WHEN 6 THEN 92 WHEN 7 THEN 84
                 WHEN 8 THEN 100 WHEN 9 THEN 68 END,
  CASE s.user_id WHEN 5 THEN 84.00 WHEN 6 THEN 72.00 WHEN 7 THEN 58.00
                 WHEN 8 THEN 93.00 WHEN 9 THEN 35.00 END,
  CASE s.user_id WHEN 5 THEN 82 WHEN 6 THEN 67 WHEN 7 THEN 54
                 WHEN 8 THEN 95 WHEN 9 THEN 28 END,
  CASE s.user_id WHEN 9 THEN 'declining' WHEN 7 THEN 'stable' ELSE 'improving' END
FROM students s
WHERE s.user_id IN (5, 6, 7, 8, 9)
ON DUPLICATE KEY UPDATE
  overall_score = VALUES(overall_score),
  aptitude_score = VALUES(aptitude_score),
  coding_score = VALUES(coding_score),
  assessment_attempts = VALUES(assessment_attempts),
  assessment_passed = VALUES(assessment_passed),
  assessment_avg_score = VALUES(assessment_avg_score),
  profile_completion_pct = VALUES(profile_completion_pct),
  placement_ready_score = VALUES(placement_ready_score),
  cohort_percentile = VALUES(cohort_percentile),
  performance_trend = VALUES(performance_trend);

INSERT INTO job_drives
  (company_name, job_title, job_role, package_lpa, min_cgpa,
   min_aptitude_score, min_coding_score, required_skills, job_description, status, created_by)
SELECT 'EduPredict Demo Technologies', 'Software Engineer', 'Engineering',
  14.00, 7.00, 70.00, 65.00, JSON_ARRAY('JavaScript', 'SQL'),
  'Synthetic development fixture for dashboard analysis.', 'completed', 1
WHERE NOT EXISTS (
  SELECT 1 FROM job_drives WHERE company_name = 'EduPredict Demo Technologies'
);

INSERT INTO job_drives
  (company_name, job_title, job_role, package_lpa, min_cgpa,
   min_aptitude_score, min_coding_score, required_skills, job_description, status, created_by)
SELECT 'EduPredict Demo Systems', 'Data Analyst', 'Analytics',
  8.00, 6.50, 60.00, 55.00, JSON_ARRAY('Python', 'SQL'),
  'Synthetic development fixture for dashboard analysis.', 'completed', 1
WHERE NOT EXISTS (
  SELECT 1 FROM job_drives WHERE company_name = 'EduPredict Demo Systems'
);

INSERT INTO job_drives
  (company_name, job_title, job_role, package_lpa, min_cgpa,
   min_aptitude_score, min_coding_score, required_skills, job_description, status, created_by)
SELECT 'EduPredict Demo Services', 'Graduate Engineer Trainee', 'Core Engineering',
  4.50, 6.00, 50.00, 45.00, JSON_ARRAY('Communication'),
  'Synthetic development fixture for dashboard analysis.', 'completed', 1
WHERE NOT EXISTS (
  SELECT 1 FROM job_drives WHERE company_name = 'EduPredict Demo Services'
);

INSERT INTO job_applications (job_drive_id, student_id, ml_match_score, status)
SELECT jd.id, ja.student_id, ja.ml_match_score, ja.status
FROM (
  SELECT 'EduPredict Demo Technologies' AS company_name, 5 AS student_id, 92.00 AS ml_match_score, 'selected' AS status
  UNION ALL SELECT 'EduPredict Demo Technologies', 8, 96.00, 'selected'
  UNION ALL SELECT 'EduPredict Demo Systems', 6, 78.00, 'selected'
  UNION ALL SELECT 'EduPredict Demo Systems', 7, 69.00, 'shortlisted'
  UNION ALL SELECT 'EduPredict Demo Services', 9, 61.00, 'selected'
) ja
JOIN job_drives jd ON jd.company_name = ja.company_name
WHERE NOT EXISTS (
  SELECT 1 FROM job_applications existing
  WHERE existing.job_drive_id = jd.id AND existing.student_id = ja.student_id
);

INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata_json)
SELECT 1, 'Analytics demo metrics loaded', 'student_metrics', NULL,
       JSON_OBJECT('source', 'development fixture', 'students', 5)
WHERE NOT EXISTS (
  SELECT 1 FROM audit_logs
  WHERE action = 'Analytics demo metrics loaded' AND entity_type = 'student_metrics'
);

INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata_json)
SELECT 1, 'Analytics demo placements loaded', 'job_applications', NULL,
       JSON_OBJECT('source', 'development fixture', 'applications', 5)
WHERE NOT EXISTS (
  SELECT 1 FROM audit_logs
  WHERE action = 'Analytics demo placements loaded' AND entity_type = 'job_applications'
);

COMMIT;
