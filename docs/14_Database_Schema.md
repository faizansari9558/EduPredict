# 14 — Database Schema & DDL Reference

## 1. Database Setup & Initialization

### 1.1 Prerequisites
- MySQL 8.0+ or MariaDB 10.5+
- Database Name: `EduPredict`
- Character Set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

### 1.2 Quick Setup via CLI
```bash
# 1. Create database and load base schema
mysql -u root -p < database/schema.sql

# 2. Seed master roles, departments, users, and problems
mysql -u root -p EduPredict < database/seed.sql
```

---

## 2. Core Table DDL Definitions

```sql
CREATE DATABASE IF NOT EXISTS EduPredict CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE EduPredict;

-- 1. Roles Master Table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_id_number VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(30) NULL,
  status ENUM('pending', 'active', 'suspended', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  head_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_departments_head FOREIGN KEY (head_user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
);

-- 4. Academic Years Table
CREATE TABLE IF NOT EXISTS academic_years (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Batches Table
CREATE TABLE IF NOT EXISTS batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_batches_department FOREIGN KEY (department_id) REFERENCES departments(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_batches_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 6. Students Table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  batch_id INT NOT NULL,
  department_id INT NOT NULL,
  enrollment_number VARCHAR(100) NOT NULL UNIQUE,
  cgpa DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  tenth_percentage DECIMAL(5,2) NULL,
  twelfth_percentage DECIMAL(5,2) NULL,
  graduation_percentage DECIMAL(5,2) NULL,
  backlogs_count INT NOT NULL DEFAULT 0,
  verification_status ENUM('unverified', 'pending', 'verified', 'rejected') NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_students_batch FOREIGN KEY (batch_id) REFERENCES batches(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_students_department FOREIGN KEY (department_id) REFERENCES departments(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 7. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department_id INT NOT NULL,
  designation VARCHAR(100) NOT NULL DEFAULT 'Assistant Professor',
  employee_code VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_teachers_department FOREIGN KEY (department_id) REFERENCES departments(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 8. Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  document_type ENUM('marksheet_10', 'marksheet_12', 'transcript', 'resume', 'certificate', 'id_proof') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  stored_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  verification_status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  reviewed_by INT NULL,
  review_remarks TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_documents_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
);

-- 9. Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  assessment_type ENUM('aptitude', 'technical', 'general') NOT NULL DEFAULT 'aptitude',
  duration INT NOT NULL DEFAULT 60,
  total_marks DECIMAL(6,2) NOT NULL DEFAULT 100.00,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  CONSTRAINT fk_assessments_creator FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 10. Coding Problems Table
CREATE TABLE IF NOT EXISTS coding_problems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  time_limit_ms INT NOT NULL DEFAULT 2000,
  memory_limit_mb INT NOT NULL DEFAULT 128,
  problem_statement LONGTEXT NOT NULL,
  input_format TEXT NULL,
  output_format TEXT NULL,
  constraints_text TEXT NULL,
  created_by INT NOT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_coding_problems_creator FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);
```
