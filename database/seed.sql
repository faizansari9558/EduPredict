-- EduPredict Comprehensive Seed Data
-- Default password for all accounts: testpass123
-- Bcrypt hash: $2b$10$rIL7JJdV7Rn/9iYCfIz5J.UKr7JEq7RBKzZYZC9gv5xHHHHHHHHHG

USE EduPredict;

-- ===== ROLES =====
INSERT IGNORE INTO roles (name, description) VALUES
  ('admin', 'Application administrator'),
  ('teacher', 'Faculty user managing academic workflows'),
  ('student', 'Student user with academic and placement records');

-- ===== ACADEMIC YEARS =====
INSERT IGNORE INTO academic_years (name, start_date, end_date, is_active) VALUES
  ('2024-2025', '2024-06-01', '2025-05-31', 1),
  ('2025-2026', '2025-07-01', '2026-06-30', 0),
  ('2026-2027', '2026-07-01', '2027-06-30', 0);

-- ===== DEPARTMENTS =====
INSERT IGNORE INTO departments (name, code) VALUES
  ('Computer Science & Engineering', 'CSE'),
  ('Electronics & Communication', 'ECE'),
  ('Mechanical Engineering', 'ME'),
  ('Civil Engineering', 'CE'),
  ('Electrical Engineering', 'EE');

-- ===== BATCHES =====
INSERT IGNORE INTO batches (name, department_id, academic_year_id) VALUES
  ('CSE-2024-B1', 1, 1),
  ('CSE-2024-B2', 1, 1),
  ('ECE-2024-B1', 2, 1),
  ('ME-2024-B1', 3, 1),
  ('CE-2024-B1', 4, 1),
  ('EE-2024-B1', 5, 1);

-- ===== USERS: ADMIN =====
INSERT IGNORE INTO users (role_id, email, password_hash, user_id_number, full_name, phone_number, status) VALUES
  ((SELECT id FROM roles WHERE name = 'admin'), 'admin@edupredict.local', '$2b$10$rIL7JJdV7Rn/9iYCfIz5J.UKr7JEq7RBKzZYZC9gv5xHHHHHHHHHG', 'ADMIN001', 'Admin User', '9999999999', 'active');

-- ===== USERS: TEACHERS =====
INSERT IGNORE INTO users (role_id, email, password_hash, user_id_number, full_name, phone_number, status) VALUES
  ((SELECT id FROM roles WHERE name = 'teacher'), 'sharma@edupredict.local', '$2b$10$rIL7JJdV7Rn/9iYCfIz5J.UKr7JEq7RBKzZYZC9gv5xHHHHHHHHHG', 'PROF001', 'Dr. Sharma', '9876543211', 'active'),
  ((SELECT id FROM roles WHERE name = 'teacher'), 'patel@edupredict.local', '$2b$10$rIL7JJdV7Rn/9iYCfIz5J.UKr7JEq7RBKzZYZC9gv5xHHHHHHHHHG', 'PROF002', 'Prof. Patel', '9876543212', 'active'),
  ((SELECT id FROM roles WHERE name = 'teacher'), 'gupta@edupredict.local', '$2b$10$rIL7JJdV7Rn/9iYCfIz5J.UKr7JEq7RBKzZYZC9gv5xHHHHHHHHHG', 'PROF003', 'Prof. Gupta', '9876543213', 'active');

-- ===== TEACHER RECORDS =====
INSERT IGNORE INTO teachers (user_id, department_id, designation, employee_code) VALUES
  ((SELECT id FROM users WHERE email = 'sharma@edupredict.local'), 1, 'Associate Professor', 'EMP001'),
  ((SELECT id FROM users WHERE email = 'patel@edupredict.local'), 2, 'Assistant Professor', 'EMP002'),
  ((SELECT id FROM users WHERE email = 'gupta@edupredict.local'), 3, 'Professor', 'EMP003');

-- ===== USERS: STUDENTS =====
INSERT IGNORE INTO users (role_id, email, password_hash, user_id_number, full_name, phone_number, status) VALUES
  ((SELECT id FROM roles WHERE name = 'student'), 'aisha.khan@edupredict.local', '$2b$10$rIL7JJdV7Rn/9iYCfIz5J.UKr7JEq7RBKzZYZC9gv5xHHHHHHHHHG', 'STU001', 'Aisha Khan', '8765432101', 'active'),
  ((SELECT id FROM roles WHERE name = 'student'), 'raj.patel@edupredict.local', '$2b$10$rIL7JJdV7Rn/9iYCfIz5J.UKr7JEq7RBKzZYZC9gv5xHHHHHHHHHG', 'STU002', 'Raj Patel', '8765432102', 'active'),
  ((SELECT id FROM roles WHERE name = 'student'), 'priya.sharma@edupredict.local', '$2b$10$rIL7JJdV7Rn/9iYCfIz5J.UKr7JEq7RBKzZYZC9gv5xHHHHHHHHHG', 'STU003', 'Priya Sharma', '8765432103', 'active'),
  ((SELECT id FROM roles WHERE name = 'student'), 'arjun.gupta@edupredict.local', '$2b$10$rIL7JJdV7Rn/9iYCfIz5J.UKr7JEq7RBKzZYZC9gv5xHHHHHHHHHG', 'STU004', 'Arjun Gupta', '8765432104', 'active'),
  ((SELECT id FROM roles WHERE name = 'student'), 'neha.singh@edupredict.local', '$2b$10$rIL7JJdV7Rn/9iYCfIz5J.UKr7JEq7RBKzZYZC9gv5xHHHHHHHHHG', 'STU005', 'Neha Singh', '8765432105', 'active');

-- ===== STUDENT RECORDS =====
INSERT IGNORE INTO students (user_id, batch_id, department_id, enrollment_number, cgpa, tenth_percentage, twelfth_percentage, graduation_percentage, verification_status) VALUES
  ((SELECT id FROM users WHERE email = 'aisha.khan@edupredict.local'), 1, 1, 'CSE-2024-001', 8.96, 92.5, 94.2, NULL, 'pending'),
  ((SELECT id FROM users WHERE email = 'raj.patel@edupredict.local'), 1, 1, 'CSE-2024-002', 8.45, 88.5, 90.1, NULL, 'not_started'),
  ((SELECT id FROM users WHERE email = 'priya.sharma@edupredict.local'), 2, 1, 'CSE-2024-003', 9.12, 95.0, 96.5, NULL, 'verified'),
  ((SELECT id FROM users WHERE email = 'arjun.gupta@edupredict.local'), 3, 2, 'ECE-2024-001', 8.67, 90.0, 91.5, NULL, 'pending'),
  ((SELECT id FROM users WHERE email = 'neha.singh@edupredict.local'), 4, 3, 'ME-2024-001', 8.23, 85.5, 87.0, NULL, 'not_started');

-- ===== DOCUMENTS =====
INSERT IGNORE INTO documents (user_id, document_type, file_name, stored_path, mime_type, verification_status) VALUES
  ((SELECT id FROM users WHERE email = 'aisha.khan@edupredict.local'), '10th Mark Sheet', '10th-aisha.pdf', 'documents/aisha/10th-marksheet.pdf', 'application/pdf', 'verified'),
  ((SELECT id FROM users WHERE email = 'aisha.khan@edupredict.local'), '12th Mark Sheet', '12th-aisha.pdf', 'documents/aisha/12th-marksheet.pdf', 'application/pdf', 'pending'),
  ((SELECT id FROM users WHERE email = 'raj.patel@edupredict.local'), '10th Mark Sheet', '10th-raj.pdf', 'documents/raj/10th-marksheet.pdf', 'application/pdf', 'pending'),
  ((SELECT id FROM users WHERE email = 'priya.sharma@edupredict.local'), '12th Mark Sheet', '12th-priya.pdf', 'documents/priya/12th-marksheet.pdf', 'application/pdf', 'verified');

-- ===== ASSESSMENT CATEGORIES =====
INSERT IGNORE INTO assessment_categories (name, description, color_code) VALUES
  ('Aptitude', 'General aptitude and reasoning', '#3B82F6'),
  ('Coding', 'Programming and algorithm problems', '#10B981'),
  ('General Knowledge', 'General knowledge and awareness', '#F59E0B'),
  ('Technical', 'Technical subject-specific questions', '#8B5CF6'),
  ('Communication', 'English and communication skills', '#EC4899');

-- ===== SAMPLE ASSESSMENTS =====
INSERT IGNORE INTO assessments (title, description, assessment_type, created_by, duration, total_marks) VALUES
  ('Aptitude Mock Test 1', 'Full-length aptitude assessment covering quantitative, logical reasoning, and verbal skills', 'aptitude', (SELECT id FROM users WHERE email = 'sharma@edupredict.local'), 60, 100),
  ('Logical Reasoning Basics', 'Intermediate level reasoning problems for foundational understanding', 'aptitude', (SELECT id FROM users WHERE email = 'patel@edupredict.local'), 45, 75),
  ('General Knowledge Quiz', 'Latest news and current events assessment', 'general', (SELECT id FROM users WHERE email = 'gupta@edupredict.local'), 30, 50);

-- ===== SAMPLE QUESTIONS =====
INSERT IGNORE INTO assessment_questions (assessment_id, question_text, question_type, marks, difficulty_level, category, options_json, correct_answer) VALUES
  ((SELECT id FROM assessments WHERE title = 'Aptitude Mock Test 1' LIMIT 1),
   'What is the value of 25% of 200?',
   'mcq', 2, 'easy', 'Quantitative',
   '["25", "50", "75", "100"]', '50'),

  ((SELECT id FROM assessments WHERE title = 'Aptitude Mock Test 1' LIMIT 1),
   'If a train travels at 60 km/h for 2 hours, what is the distance covered?',
   'mcq', 2, 'easy', 'Quantitative',
   '["60 km", "120 km", "180 km", "240 km"]', '120 km'),

  ((SELECT id FROM assessments WHERE title = 'Aptitude Mock Test 1' LIMIT 1),
   'Find the missing number: 2, 5, 10, 17, ?, 37',
   'mcq', 3, 'medium', 'Reasoning',
   '["24", "26", "28", "30"]', '26'),

  ((SELECT id FROM assessments WHERE title = 'Logical Reasoning Basics' LIMIT 1),
   'Which word does NOT belong in this group?',
   'mcq', 2, 'easy', 'Verbal',
   '["Red", "Blue", "Green", "Smooth"]', 'Smooth');

-- ===== NOTIFICATIONS =====
INSERT IGNORE INTO notifications (user_id, title, message, notification_type, is_read) VALUES
  ((SELECT id FROM users WHERE email = 'aisha.khan@edupredict.local'), 'Document Verified', 'Your 10th mark sheet has been verified', 'verification', 1),
  ((SELECT id FROM users WHERE email = 'aisha.khan@edupredict.local'), 'New Assessment Available', 'Prof. Sharma published Aptitude Mock Test 1', 'assessment', 0),
  ((SELECT id FROM users WHERE email = 'raj.patel@edupredict.local'), 'Complete Profile', 'Complete your profile to appear in placement listings', 'profile', 0);

-- ===== VERIFICATION =====
SELECT '✓ Seed data loaded successfully' as status;
SELECT CONCAT('Roles: ', COUNT(*)) as data FROM roles;
SELECT CONCAT('Users: ', COUNT(*)) as data FROM users;
SELECT CONCAT('Students: ', COUNT(*)) as data FROM students;
SELECT CONCAT('Teachers: ', COUNT(*)) as data FROM teachers;
SELECT CONCAT('Departments: ', COUNT(*)) as data FROM departments;
