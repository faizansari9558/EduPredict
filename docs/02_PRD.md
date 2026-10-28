# 02 — Product Requirements Document (PRD)

## 1. Document Control
- **Product Name:** EduPredict (Smart Student Academic & Placement Prediction System)
- **Document Version:** 2.0.0
- **Status:** Approved / Active Baseline
- **Target Audience:** Engineering, Product, Faculty Stakeholders, Institutional Leadership

---

## 2. Product Overview & Vision
EduPredict is an AI-enhanced Student Academic & Placement Readiness Intelligence Platform. Its primary goal is to provide higher education institutions with a unified ecosystem for tracking academic performance, verifying student portfolios, conducting multi-disciplinary assessments, detecting at-risk students, and providing transparent, explainable machine learning predictions for campus placement outcomes.

---

## 3. User Personas & Target Segments

### 3.1 Student Persona ("Alex")
- **Profile:** Undergraduate engineering/technical student preparing for campus recruitment.
- **Goals:** Track CGPA, upload academic marksheets/resumes, practice coding and aptitude tests, understand likelihood of placement, and receive prescriptive improvement roadmaps.
- **Pain Points:** Unclear feedback on why applications fail, lack of standardized coding test practice, unverified claims on resume.

### 3.2 Teacher / Faculty Mentor Persona ("Prof. Sharma")
- **Profile:** Department faculty member responsible for 40–60 assigned students.
- **Goals:** Verify student uploaded documents, author aptitude tests and coding problems, review class performance distributions, and intervene early for struggling students.
- **Pain Points:** Overwhelmed with physical paperwork, lack of automated grading for coding problems, difficulty tracking cohort performance across semesters.

### 3.3 Institutional Administrator Persona ("Dr. Vance")
- **Profile:** Dean of Academics / Head of Training & Placement (T&P).
- **Goals:** Oversee department configurations, manage faculty/student accounts, track campus-wide placement metrics, organize corporate recruitment drives, and export regulatory audit reports.
- **Pain Points:** Fragmented data across departments, inaccurate placement forecasts, inability to quickly filter eligible students for corporate recruitment drives.

---

## 4. Product Goals & Success Metrics

| Goal | Description | Key Performance Indicator (KPI) |
| :--- | :--- | :--- |
| **Academic Verification** | Eliminate unverified academic claims | 100% of prediction profiles backed by verified faculty records |
| **Continuous Assessment** | Standardized evaluation of problem solving | Support both MCQ aptitude and multi-language live coding |
| **Prediction Accuracy** | High-precision placement outcome estimation | ML Model ROC-AUC ≥ 88%, F1-Score ≥ 85% |
| **Explainable Guidance** | Provide actionable feedback rather than black-box scores | Identify top positive drivers and critical risk blockers for every student |
| **Corporate Recruitment** | Streamline recruitment drives and shortlisting | Instant automated eligibility filtering and CSV/PDF export |

---

## 5. Scope & Feature Matrix

### 5.1 Student Module
- **Profile Management**: View verified academic records (10th, 12th, CGPA, backlogs), add skills, projects, certifications, internships.
- **Document Center**: Upload PDF marksheets and resumes with real-time verification status tracking (Pending, Approved, Rejected with remarks).
- **Aptitude Test Runner**: Timed test-taking interface with countdown timer, question palette, status indicators, and auto-submission.
- **Coding Arena**: In-browser code editor with line numbers, multi-language support (JS, Python, C++, Java), custom input execution, and hidden test case validation.
- **Placement Forecast & Analytics**: Live prediction probability card, skill-gap radar, cohort percentile ranking, and prescriptive recommendations.
- **AI Career Copilot**: ATS resume review, mock interview question generator, and 30-60-90 day readiness roadmap.

### 5.2 Teacher Module
- **Student Mentorship Dashboard**: Search, filter, and inspect assigned student profiles and academic health metrics.
- **Document Verification Queue**: Review submitted student documents with inline preview, one-click approval, and rejection with feedback reasons.
- **Assessment Builder**: Create and publish aptitude assessments with configurable duration, total marks, difficulty, and question bank integration.
- **Coding Problem Manager**: Create coding challenges, starter code templates, sample public test cases, and hidden test suites.
- **Class Analytics**: Score distributions, quartile breakdowns, assessment discrimination indices, and automated at-risk alerts.

### 5.3 Admin & Institutional Module
- **Academic Structure Setup**: Hierarchical creation and management of Departments, Academic Years, Courses, and Batches.
- **User Management**: Comprehensive CRUD operations for Students, Teachers, and Admin accounts with status management (Active, Suspended).
- **Campus Placement Drives**: Post corporate placement drives with eligibility criteria (min CGPA, max backlogs, required skills) and generate verified shortlists.
- **System-Wide Analytics**: Cross-departmental comparisons, campus placement funnel, and institutional audit logs.

---

## 6. Non-Goals
- EduPredict is not a general Learning Management System (LMS) replacing Moodle/Canvas for courseware assignment delivery.
- EduPredict does not execute student untrusted code in unprotected system shell processes (sandboxed execution only).
- EduPredict does not rely on opaque third-party AI black-boxes for core academic decisions without deterministic verification.

---

## 7. Assumptions & Dependencies
- The institution provides valid student enrollment numbers and faculty IDs.
- Core relational institutional data is hosted in MySQL 8.0 / MariaDB.
- Modern web browsers (Chrome, Edge, Firefox, Safari) with JavaScript enabled are used by clients.
