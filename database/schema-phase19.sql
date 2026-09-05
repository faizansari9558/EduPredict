-- ============================================================================
-- EduPredict Phase 19: Campus Placement Drives & Candidate Shortlisting Engine
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_drives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  job_role VARCHAR(150) NOT NULL,
  package_lpa DECIMAL(5,2) NOT NULL DEFAULT 6.00,
  min_cgpa DECIMAL(3,2) NOT NULL DEFAULT 6.50,
  min_aptitude_score DECIMAL(5,2) NOT NULL DEFAULT 60.00,
  min_coding_score DECIMAL(5,2) NOT NULL DEFAULT 60.00,
  required_skills JSON NULL,
  job_description TEXT NULL,
  status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_drives_creator FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_drive_id INT NOT NULL,
  student_id INT NOT NULL,
  ml_match_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  status ENUM('applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected') NOT NULL DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_apps_drive FOREIGN KEY (job_drive_id) REFERENCES job_drives(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_apps_student FOREIGN KEY (student_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT uq_student_drive UNIQUE (job_drive_id, student_id)
);
