# 15 — API Documentation

## 1. API Architecture & Standards

- **Base URL:** `http://127.0.0.1:5000/api`
- **ML Base URL:** `http://127.0.0.1:8000`
- **Data Format:** `application/json`
- **Authentication:** `Authorization: Bearer <JWT_TOKEN>`

---

## 2. API Endpoint Catalog

### 2.1 Health & Diagnostics
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status and active MySQL connection heartbeat |
| `GET` | `/health` (Port 8000) | Public | FastAPI microservice liveness check |
| `GET` | `/model-info` (Port 8000) | Public | Model metadata, features, and ROC-AUC score |

---

### 2.2 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account with role selection |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive signed 7-day JWT |

---

### 2.3 Student APIs (`/api/student`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/student/profile` | Student | Get authenticated student's full academic and verified profile |
| `PUT` | `/api/student/profile` | Student | Update skills, projects, certifications, and internships |
| `POST` | `/api/student/documents` | Student | Upload verification document (Multipart/Form-Data PDF) |
| `GET` | `/api/student/documents` | Student | List uploaded documents and faculty verification remarks |
| `POST` | `/api/student/assessments/:id/start` | Student | Initialize timed attempt for an aptitude test |
| `POST` | `/api/student/assessments/:id/response` | Student | Save response to a specific test question |
| `PATCH` | `/api/student/assessment/:attemptId/submit` | Student | Submit assessment attempt and compute final score |

---

### 2.4 Teacher APIs (`/api/teacher`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/teacher/dashboard` | Teacher | Get teacher summary statistics and assigned student count |
| `GET` | `/api/teacher/students` | Teacher | Get paginated list of assigned students in department |
| `GET` | `/api/teacher/documents/pending` | Teacher | Get queue of unreviewed student document uploads |
| `PATCH` | `/api/teacher/documents/:id/verify` | Teacher | Mark document as `verified` or `rejected` with remarks |

---

### 2.5 Admin APIs (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/overview` | Admin | System-wide counts (Students, Teachers, Depts, Drives) |
| `GET` | `/api/admin/users` | Admin | Paginated list of users with search, filter, role filtering |
| `PATCH` | `/api/admin/users/:id/status` | Admin | Update user status (`active`, `suspended`, `rejected`) |
| `GET` | `/api/admin/departments` | Admin | List all departments with student counts |
| `POST` | `/api/admin/departments` | Admin | Create new academic department |

---

### 2.6 Assessment Studio (`/api/assessments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assessments` | Teacher/Admin | List authored assessments |
| `POST` | `/api/assessments` | Teacher/Admin | Create new assessment header (Duration, Marks, Category) |
| `GET` | `/api/assessments/:id` | Teacher/Student | Get assessment details and question roster |
| `POST` | `/api/assessments/:id/questions` | Teacher/Admin | Add question with MCQ options and answer key |
| `PATCH` | `/api/assessments/:id/publish` | Teacher/Admin | Toggle publish state (making test live for students) |
| `GET` | `/api/assessments/:id/results` | Teacher/Admin | View all student attempt results and score rankings |

---

### 2.7 Coding Assessment Engine (`/api/coding`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/coding/challenges` | All | List published coding problems with solve status |
| `GET` | `/api/coding/:problemId` | All | Fetch problem details, constraints, sample test cases |
| `POST` | `/api/coding/:problemId/run` | Student | Interactively execute code against sample test cases |
| `POST` | `/api/coding/:problemId/submit` | Student | Autograde submission against hidden test case suite |
| `GET` | `/api/coding/:problemId/submissions` | Student | Fetch personal submission history for challenge |
| `POST` | `/api/coding` | Teacher/Admin | Author new coding problem with test case suites |
| `PATCH` | `/api/coding/:problemId/publish` | Teacher/Admin | Toggle live published state for problem |

---

### 2.8 Analytics Engine (`/api/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/student/:id` | Student/Faculty | Student performance overview and cohort percentile |
| `GET` | `/api/analytics/student/:id/skills` | Student/Faculty | Skill proficiency radar breakdown |
| `GET` | `/api/analytics/teacher/:id/class-summary` | Teacher | Class score distribution and quartile analysis |
| `GET` | `/api/analytics/teacher/:id/at-risk` | Teacher | List identified at-risk students requiring intervention |
| `GET` | `/api/analytics/department/:id` | Faculty/Admin | Department-wide aggregates and batch comparisons |
| `GET` | `/api/analytics/admin/system-overview` | Admin | Campus-wide placement funnel and pass rates |

---

### 2.9 Machine Learning & Explainability (`/api/prediction` & FastAPI)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/prediction/student/:id` | Student/Faculty | Real-time placement probability and risk factors |
| `POST` | `/predict/placement` (Port 8000) | Service/Internal | 16-feature vector inference returning probability |
| `POST` | `/predict/explain` (Port 8000) | Service/Internal | Computes positive placement drivers and risk blockers |
| `POST` | `/predict/batch` (Port 8000) | Service/Internal | High-throughput batch cohort placement forecasting |

---

### 2.10 Career AI, Resume, Notifications & Job Drives
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/student/resume/analyze` | Student | 0–100 ATS resume score against verified credentials |
| `POST` | `/api/career-ai/interview-prep` | Student | Generates targeted technical & HR interview questions |
| `POST` | `/api/career-ai/roadmap` | Student | Generates personalized 30-60-90 day milestone roadmap |
| `GET` | `/api/notifications` | Authenticated | Retrieve unread and historical notifications |
| `GET` | `/api/job-drives` | Authenticated | List campus placement drives with eligibility status |
| `POST` | `/api/job-drives/:id/shortlist` | Admin | Execute automated candidate eligibility filter |
| `GET` | `/api/reports/student/:id/scorecard` | Authenticated | Export formatted placement readiness scorecard |
