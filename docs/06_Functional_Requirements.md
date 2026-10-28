# 06 — Functional Requirements Specification

## 1. Authentication & Session Management

### 1.1 User Registration
- **FR-AUTH-01**: The system shall allow new users to register by submitting Email, Password, Full Name, Phone Number, and authorized University User ID Number.
- **FR-AUTH-02**: Passwords must be hashed using `bcrypt` with a minimum cost factor of 10 prior to database insertion.
- **FR-AUTH-03**: The system shall validate email uniqueness and University ID Number uniqueness.

### 1.2 User Login & JWT Issuance
- **FR-AUTH-04**: The system shall authenticate credentials against `users` and active status.
- **FR-AUTH-05**: Upon successful authentication, the API shall issue a JSON Web Token (JWT) payload containing:
  - `id`: User primary key.
  - `email`: User email address.
  - `role`: Role string (`admin`, `teacher`, `student`).
  - `userIdNumber`: University identification number.
- **FR-AUTH-06**: JWT shall have an expiration lifetime of 7 days (`7d`).

---

## 2. Student Module

### 2.1 Academic Profile Management
- **FR-STU-01**: Students shall view verified academic metrics: 10th Standard Percentage, 12th Standard Percentage, Undergraduate CGPA, and Active Backlogs count.
- **FR-STU-02**: Students shall manage their portfolio: Technical Skills list, Project titles and descriptions, Certification credentials, and Internship experiences.
- **FR-STU-03**: The system shall calculate a real-time Profile Completion Percentage based on academic, skill, and document fields.

### 2.2 Document Management & Status Tracking
- **FR-STU-04**: Students shall upload academic transcripts and resumes in PDF or image format (max 5MB).
- **FR-STU-05**: Uploaded files shall receive an initial status of `pending`.
- **FR-STU-06**: Students shall view review remarks if a document is marked `rejected` by faculty.

### 2.3 Assessment Participation
- **FR-STU-07**: Students shall view all published aptitude tests and coding challenges assigned to their department/batch.
- **FR-STU-08**: Students can start a timed attempt which initializes a tracking record in `assessment_attempts` or `coding_submissions`.

---

## 3. Teacher / Faculty Module

### 3.1 Student Mentorship & Review
- **FR-TCH-01**: Teachers shall view a paginated list of assigned students within their department.
- **FR-TCH-02**: Teachers shall inspect student academic health, skill profiles, and assessment histories.

### 3.2 Document Verification Workflow
- **FR-TCH-03**: Teachers shall access a verification queue of pending student documents.
- **FR-TCH-04**: Teachers shall approve documents (updating status to `verified`) or reject documents with mandatory feedback comments.

### 3.3 Aptitude Assessment Builder
- **FR-TCH-05**: Teachers shall create assessments with Title, Description, Type, Duration in minutes, Total Marks, and Category.
- **FR-TCH-06**: Teachers shall add MCQ questions with 4 option choices, correct key selection, difficulty level (Easy, Medium, Hard), and point weightage.
- **FR-TCH-07**: Teachers shall toggle assessment status between Draft and Published.

### 3.4 Coding Challenge Authoring
- **FR-TCH-08**: Teachers shall author coding problems with Problem Description, Input/Output format specifications, Constraints, Time Limit (ms), and Memory Limit (MB).
- **FR-TCH-09**: Teachers shall supply Starter Code Templates for JavaScript, Python, C++, and Java.
- **FR-TCH-10**: Teachers shall add Public Sample Test Cases and Hidden Evaluation Test Cases.

---

## 4. Admin & Institutional Module

### 4.1 Institutional Hierarchy Management
- **FR-ADM-01**: Admins shall perform CRUD operations on Departments (Name, Code, Head of Department).
- **FR-ADM-02**: Admins shall manage Academic Years (Start Date, End Date, Active status) and Batches.
- **FR-ADM-03**: Admins shall manage Course configurations and credit assignments.

### 4.2 User & Account Administration
- **FR-ADM-04**: Admins shall create, update, activate, or suspend User accounts across all roles.
- **FR-ADM-05**: Admins shall assign faculty mentors to student batches.

### 4.3 Campus Placement Drives & Shortlisting
- **FR-ADM-06**: Admins shall create Job Placement Drives specifying Company Name, Job Role, Package (LPA), Drive Date, Min CGPA, Max Backlogs, and Required Skills.
- **FR-ADM-07**: Admins shall view automated eligibility matches and generate verified shortlist rosters exportable to CSV format.

---

## 5. Assessment & Coding Execution Engines

### 5.1 Timed Aptitude Runner
- **FR-ENG-01**: Client application shall maintain a synchronized countdown timer.
- **FR-ENG-02**: When time expires, all current responses shall auto-submit immediately.
- **FR-ENG-03**: System shall calculate raw score and percentage automatically upon submission.

### 5.2 Interactive Coding Sandbox
- **FR-ENG-04**: The system shall execute user code against public test cases interactively in an isolated execution sandbox.
- **FR-ENG-05**: Final submission shall execute against all hidden test cases and grade the submission based on percentage of passed assertions (0–100%).
- **FR-ENG-06**: System shall record execution runtime (ms) and memory usage (MB) for each test case execution.

---

## 6. Machine Learning & Predictive Analytics

### 6.1 Placement Prediction Service
- **FR-ML-01**: Node.js backend shall extract 16 engineered features from MySQL tables for a student.
- **FR-ML-02**: Features shall be forwarded to the Python FastAPI microservice `/predict/placement`.
- **FR-ML-03**: The response shall return Placement Probability (0.0% to 100.0%), Placement Status (`High Chance`, `Moderate Chance`, `At Risk`), and Confidence Interval.

### 6.2 Explainability & Guidance
- **FR-ML-04**: The system shall compute individual feature impact drivers:
  - Top 3 Positive Placement Drivers (e.g., High CGPA, strong coding score).
  - Top 3 Risk Blockers (e.g., Active backlogs, low aptitude test score).
- **FR-ML-05**: The system shall output prescriptive improvement recommendations tailored to the student's weakest metrics.
