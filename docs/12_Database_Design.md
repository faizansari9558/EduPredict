# 12 — Database Design & Data Modeling

## 1. Database Principles & Normalization

The EduPredict database is architected on **MySQL 8.0** following strict relational principles:
- **Third Normal Form (3NF)**: Redundancy is minimized across core transactional tables.
- **Referential Integrity**: Foreign keys enforce cascading updates and restrict deletions of dependent historical records.
- **Naming Conventions**: Standardized `snake_case` naming for tables, columns, constraints, and stored routines.
- **Separation of Concerns**: Isolated schemas for Authentication, Academic Records, Assessment Systems, Coding Challenges, Analytics Caches, and Placement Drives.

---

## 2. Table Domain Groups

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE DOMAIN TAXONOMY                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ AUTH & USERS ]           [ ACADEMIC STRUCTURE ]    [ STUDENT PORTFOLIO ] │
│  • roles                    • departments             • students            │
│  • users                    • academic_years          • student_profiles    │
│  • admins                   • batches                 • documents           │
│  • teachers                 • courses                 • audit_logs          │
│                                                                             │
│  [ APTITUDE ENGINE ]        [ CODING ENGINE ]         [ ANALYTICS & CACHE ] │
│  • assessments              • coding_problems         • student_metrics     │
│  • assessment_questions     • coding_testcases        • skill_proficiency   │
│  • assessment_attempts      • coding_templates        • at_risk_students    │
│  • student_assessment_      • coding_submissions      • department_metrics  │
│    responses                • coding_results          • batch_metrics       │
│  • question_bank            • coding_environments     • 8 Analytical Views  │
│                                                                             │
│  [ NOTIFICATIONS & DRIVES ]                                                 │
│  • notifications                                                            │
│  • job_drives                                                               │
│  • job_drive_applications                                                   │
│  • job_drive_shortlists                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Table Specifications

### 3.1 Authentication & Institutional Core
- **`roles`**: Master user roles (`id`, `name`, `description`).
- **`users`**: System accounts (`id`, `role_id`, `email`, `password_hash`, `user_id_number`, `full_name`, `phone_number`, `status`).
- **`departments`**: Academic units (`id`, `name`, `code`, `head_user_id`).
- **`academic_years`**: Institutional sessions (`id`, `name`, `start_date`, `end_date`, `is_active`).
- **`batches`**: Student cohorts (`id`, `name`, `department_id`, `academic_year_id`).

### 3.2 Student Portfolios & Verification
- **`students`**: Academic metrics (`id`, `user_id`, `batch_id`, `department_id`, `enrollment_number`, `cgpa`, `tenth_percentage`, `twelfth_percentage`, `verification_status`).
- **`student_profiles`**: Extended skills, projects, and certifications (`id`, `user_id`, `skills_json`, `projects_json`, `certifications_json`, `internships_json`).
- **`documents`**: Verification files (`id`, `user_id`, `document_type`, `file_name`, `stored_path`, `mime_type`, `verification_status`, `reviewed_by`, `review_remarks`).

### 3.3 Assessment & Coding Engines
- **`assessments`**: Test headers (`id`, `title`, `description`, `assessment_type`, `duration`, `total_marks`, `created_by`, `published_at`).
- **`assessment_questions`**: Questions (`id`, `assessment_id`, `question_text`, `question_type`, `marks`, `difficulty_level`, `category`, `options_json`, `correct_answer`).
- **`assessment_attempts`**: Student attempts (`id`, `assessment_id`, `student_user_id`, `started_at`, `submitted_at`, `score`, `status`).
- **`coding_problems`**: Challenge definitions (`id`, `title`, `slug`, `difficulty`, `time_limit_ms`, `memory_limit_mb`, `problem_statement`, `created_by`, `is_published`).
- **`coding_testcases`**: Test suites (`id`, `problem_id`, `input`, `expected_output`, `is_hidden`, `points`).
- **`coding_submissions`**: Submissions (`id`, `problem_id`, `student_user_id`, `language`, `code`, `status`, `grade_score`, `passed_testcases`, `total_testcases`).

### 3.4 Analytics & Precomputed Cache
- **`student_metrics`**: Pre-aggregated summary metrics for instant dashboard queries (`student_id`, `overall_score`, `aptitude_score`, `coding_score`, `placement_ready_score`, `cohort_percentile`).
- **`at_risk_students`**: Identified intervention cases (`id`, `student_id`, `risk_level`, `risk_reasons_json`, `flagged_at`, `resolved_at`).

### 3.5 Placement Drives & Shortlists
- **`job_drives`**: Company recruitment events (`id`, `company_name`, `role_title`, `package_lpa`, `min_cgpa`, `max_backlogs`, `required_skills_json`, `drive_date`, `status`).
- **`job_drive_shortlists`**: Filtered candidate rosters (`id`, `drive_id`, `student_id`, `match_score`, `shortlisted_at`).

---

## 4. Indexing & Query Optimization Strategy

| Index Name | Table | Indexed Columns | Optimization Purpose |
| :--- | :--- | :--- | :--- |
| `idx_users_email` | `users` | `email` | Sub-millisecond login credential lookups |
| `idx_users_role` | `users` | `role_id`, `status` | Filter users by role and active status |
| `idx_students_batch` | `students` | `batch_id`, `department_id` | Cohort and department filtering |
| `idx_assessments_published` | `assessments` | `published_at` | Rapid listing of active student tests |
| `idx_coding_sub_student` | `coding_submissions` | `student_user_id`, `problem_id` | Student submission history queries |
| `idx_metrics_student` | `student_metrics` | `student_id` | Instant dashboard metrics retrieval |
| `idx_drives_date` | `job_drives` | `drive_date`, `status` | Active recruitment drive queries |
