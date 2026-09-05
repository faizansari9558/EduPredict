# EduPredict Database Schema

## Overview

The EduPredict database is designed as a MySQL relational schema for academic record management, student verification, assessments, and placement prediction workflows.

## Core Principles

- Use relational tables for institutional data.
- Use `snake_case` column names.
- Keep foreign key references explicit.
- Store only verified academic and identity records.
- Separate authentication, academic, assessment, and document data.

## Planned Tables

### 1. roles
- id (PK)
- name
- description
- created_at

### 2. users
- id (PK)
- role_id (FK -> roles.id)
- email
- password_hash
- user_id_number
- full_name
- phone_number
- status
- created_at
- updated_at

### 3. departments
- id (PK)
- name
- code
- head_user_id (FK -> users.id, nullable)
- created_at

### 4. courses
- id (PK)
- department_id (FK -> departments.id)
- code
- title
- description
- credits
- created_at

### 5. academic_years
- id (PK)
- name
- start_date
- end_date
- is_active

### 6. batches
- id (PK)
- name
- department_id (FK -> departments.id)
- academic_year_id (FK -> academic_years.id)
- created_at

### 7. students
- id (PK)
- user_id (FK -> users.id)
- batch_id (FK -> batches.id)
- department_id (FK -> departments.id)
- enrollment_number
- cgpa
- tenth_percentage
- twelfth_percentage
- graduation_percentage
- verification_status
- created_at
- updated_at

### 8. teachers
- id (PK)
- user_id (FK -> users.id)
- department_id (FK -> departments.id)
- designation
- employee_code
- created_at

### 9. admins
- id (PK)
- user_id (FK -> users.id)
- designation
- created_at

### 10. documents
- id (PK)
- user_id (FK -> users.id)
- document_type
- file_name
- stored_path
- mime_type
- verification_status
- reviewed_by (FK -> users.id, nullable)
- created_at

### 11. assessments
- id (PK)
- title
- description
- assessment_type
- created_by (FK -> users.id)
- created_at
- published_at

### 12. assessment_questions
- id (PK)
- assessment_id (FK -> assessments.id)
- question_text
- question_type
- marks
- options_json
- correct_answer
- created_at

### 13. assessment_attempts
- id (PK)
- assessment_id (FK -> assessments.id)
- student_user_id (FK -> users.id)
- started_at
- submitted_at
- score
- status

### 14. student_assessment_responses
- id (PK)
- attempt_id (FK -> assessment_attempts.id)
- question_id (FK -> assessment_questions.id)
- answer_text
- is_correct

### 15. notifications
- id (PK)
- user_id (FK -> users.id)
- title
- message
- notification_type
- is_read
- created_at

### 16. audit_logs
- id (PK)
- user_id (FK -> users.id, nullable)
- action
- entity_type
- entity_id
- metadata_json
- created_at

## Relationships

- One role has many users.
- One department has many courses, batches, students, and teachers.
- One academic year has many batches.
- One user may have one student/teacher/admin profile.
- One assessment has many questions and many attempts.
- One attempt has many responses.
- One user may receive many notifications.

## Example MySQL DDL

```sql
CREATE DATABASE IF NOT EXISTS EduPredict CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE EduPredict;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_id_number VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(30),
  status ENUM('pending','active','suspended','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

## Future Extensions

- Placement records
- Offer tracking
- Resume AI metadata
- Interview feedback
- Skill-gap recommendations
- Model prediction snapshots
