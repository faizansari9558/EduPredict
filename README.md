# EduPredict 🎓
### Smart Student Academic & Placement Prediction Intelligence System

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Frontend](https://img.shields.io/badge/Stitch%20UI-React%2018%20%7C%20Tailwind%20v4%20%7C%20Vite%205-38bdf8.svg)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933.svg)
![Python](https://img.shields.io/badge/ML%20Service-FastAPI%20%7C%20Scikit--Learn-009688.svg)
![Database](https://img.shields.io/badge/Database-MySQL%208.0%20%7C%20MariaDB-4479A1.svg)
![Accuracy](https://img.shields.io/badge/ML%20Accuracy-89.84%25%20ROC--AUC-brightgreen.svg)

---

## 🌟 Executive Overview

**EduPredict** is an end-to-end intelligent university academic tracking and placement forecasting platform designed for higher education engineering institutions. It unifies institutional registrar records, faculty verification workflows, proctored multi-language coding sandboxes, and explainable machine learning predictions to eliminate guesswork and prepare students well before campus hiring drives begin.

---

## 🔑 Quick Demo Credentials (1-Click Login)

The platform provides 1-click test fill credentials directly on the **[Sign In Page](http://localhost:3001/login)**:

| Persona | Demo Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| 🎓 **Student** | `student@edupredict.edu` | `password123` | [Student Dashboard](http://localhost:3001/student/dashboard) |
| 👨‍🏫 **Faculty Mentor** | `faculty@edupredict.edu` | `password123` | [Teacher Portal](http://localhost:3001/teacher/dashboard) |
| 🛡️ **Institutional Admin** | `admin@edupredict.edu` | `password123` | [Admin Console](http://localhost:3001/admin/dashboard) |

---

## 🌐 Public Pages & Navigation

EduPredict features a high-contrast, 100% window-width responsive public suite:

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | **Home (Landing Page)** | Slim `h-16` sticky header, visible headline, ecosystem overview, 5-stage lifecycle roadmap, compact footer. |
| `/about` | **About Us** | Institutional mission, explainable AI ethos, cryptographic verification pillars. |
| `/help` | **Help & FAQ** | Interactive categorized FAQs for Students, Faculty Mentors, and Administrators. |
| `/contact` | **Contact Us** | Support desk, campus coordinates, interactive demo scheduling form. |
| `/privacy` | **Privacy Policy** | FERPA compliance, ISO 27001 security standards, AES-256 encrypted multi-tenant storage. |
| `/terms` | **Terms of Service** | Academic honesty policies, proctored assessment integrity, authentic credential rules. |
| `/login` | **Sign In** | Persona-based switcher with 1-click test credentials and auto-routing. |
| `/register` | **Register** | Student and Faculty account creation with department selection. |

---

## 🏛️ Three Tailored Ecosystem Portals

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EDUPREDICT MULTI-PORTAL ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎓 STUDENT EXPERIENCE PORTAL                                               │
│     • Longitudinal Profile Readiness Bar & Academic Meta Pill Array         │
│     • Semester-by-Semester CGPA & Percentage Velocity Area Chart            │
│     • Machine Learning Placement Probability Gauge (89.8% ROC-AUC)          │
│     • Proctored Code Compiler Arena (Python, JavaScript, C++, Java)         │
│     • What-If Scenario Career Simulator & SHAP Gap Remediation              │
│     • Smart ATS Resume Studio with PDF Export & Match Score                 │
│                                                                             │
│  👨‍🏫 FACULTY & MENTOR PORTAL                                                │
│     • Assigned Student Cohort Management & Velocity Radar                   │
│     • Marksheet, Internship & Certificate Verification Queue                │
│     • Proctored Assessment Authoring with Testcase & Memory Limit Bounds    │
│     • Early Warning Radar for At-Risk Backlogs and CGPA Slippage            │
│                                                                             │
│  🛡️ DEAN & INSTITUTIONAL ADMIN CONSOLE                                      │
│     • Departmental Head-to-Head Comparisons (CSE, ECE, ME, IT)              │
│     • Recruiter Pre-Screening Filtering Matrix (CGPA, Backlogs, Skills)     │
│     • 1-Click NAAC Criterion 2.6 & NIRF Attainment Report Generation        │
│     • Multi-Tenant User Management & Institutional System Settings          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Machine Learning & Explainability Engine

EduPredict does not operate as a black box. Our dual ML ensemble is trained and benchmarked on 4,800+ historical campus recruitment profiles:

1. **Dual-Model Architecture**:
   - **XGBoost Decision Trees**: Captures non-linear skill interactions and project weights.
   - **Calibrated Logistic Regression**: Provides reliable, smooth probability estimates.
2. **16 Engineered Feature Levers**:
   - Longitudinal CGPA trajectory & velocity.
   - Proctored Coding Sandbox percentiles (LeetCode-style algorithmic performance).
   - Faculty-verified industrial internships and live GitHub repositories.
   - Active backlog penalty curves and attendance rates.
3. **SHAP (SHapley Additive exPlanations) Engine**:
   - Outlines exact positive drivers (e.g. *"+26% Coding Sandbox Scores"*).
   - Pinpoints risk blockers (e.g. *"-18% Active Backlog Impact"*).
   - Generates concrete, prescriptive action roadmaps.

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FULL STACK SYSTEM TOPOLOGY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [Stitch Frontend Application]                (Port 3001)                  │
│     ├── Tailwind CSS v4 CSS-First Design System                             │
│     ├── Plus Jakarta Sans & Material Symbols Typography                     │
│     ├── Recharts Data Visualizations & Real-Time Simulators                 │
│     └── Monaco-Style Proctored Coding Sandbox                               │
│            │                                                                │
│            ▼ REST API Requests                                              │
│   [Node.js + Express Backend API Engine]       (Port 5000)                  │
│     ├── JWT Authentication & Role-Based Guard Middleware                    │
│     ├── Assessment & Sandboxed Autograding Controller                       │
│     ├── Student & Institutional Analytics Aggregations                      │
│     ├── Resume ATS & AI Copilot Services                                    │
│     └── Real-Time Notification System                                       │
│            │                                                                │
│            ├──────────────────────────────────────────┐                     │
│            ▼ SQL Queries                              ▼ REST Inference      │
│   [MySQL 8.0 / MariaDB Database]              [FastAPI ML Microservice]     │
│   (Port 3306)                                 (Port 8000)                   │
- **Backend API**: Node.js, Express.js, MySQL2 with connection pooling, JWT Authentication, bcryptjs.
- **Machine Learning Microservice**: Python 3.12, FastAPI, Scikit-Learn, XGBoost, Pandas, NumPy, Joblib, Uvicorn.
- **Database**: MySQL 8.0 / MariaDB with indexed relational tables, analytical views, and automated recalculation stored procedures.
- **Containerization**: Docker Compose for multi-service production deployment.

---

## ⚡ Quick Start Guide

### Option 1: One-Click Launcher

#### Windows (PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-all.ps1
```

#### Linux / macOS (Bash):
```bash
chmod +x ./scripts/start-all.sh
./scripts/start-all.sh
```

---

### Option 2: Docker Compose (Production Stack)
```bash
docker-compose up --build -d
```
All services will start automatically:
- **Frontend App**: `http://localhost:3000`
- **Express Backend API**: `http://localhost:5000`
- **FastAPI ML Microservice**: `http://localhost:8000`
- **MySQL Database**: `localhost:3306`

---

### Option 3: Manual Startup

1. **Start FastAPI ML Service**:
   ```bash
   python -m pip install -r ml/requirements.txt
   python ml/models/train.py
   python -m uvicorn ml.app:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Start Express Backend**:
   ```bash
   cd backend
   npm install
   node server.js
   ```

3. **Start Legacy Frontend (Port 3000)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Start Google Stitch UI Frontend (Port 3001)**:
   ```bash
   # Windows One-Click:
   .\start-stitch.bat

   # Or manual:
   cd stitch
   npm install
   npm run dev
   ```
   Open `http://localhost:3001` in your browser.

---

## 🔑 Demo Login Credentials

The system is pre-seeded with authorized accounts for evaluation:

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@edupredict.local` | `Admin@123` | `/admin` (System Overview & Dept Rankings) |
| **Teacher** | `sharma@edupredict.local` | `Teacher@123` | `/teacher` (Class Analytics & Verifications) |
| **Student** | `aisha.khan@edupredict.local` | `Student@123` | `/student` (Dashboard, Coding & AI Copilot) |

---

## 🧪 Comprehensive Automated Test Suites

### 1. Master System-Wide E2E Test Suite (24 Test Cases)
```bash
node backend/tests/test_all_features_e2e.js
```
```
================================================================
🌟 MASTER SYSTEM-WIDE E2E TEST SUITE (PHASES 1 - 18)
================================================================
✅ PASS: [Health Check] GET /api/health
✅ PASS: [API Status] GET /api
✅ PASS: [Admin Dashboard] GET /api/admin/dashboard
✅ PASS: [Teacher Dashboard] GET /api/teacher/dashboard
✅ PASS: [Student Dashboard] GET /api/student/dashboard
✅ PASS: [Teacher Assessments] GET /api/assessments
✅ PASS: [Coding Challenges] GET /api/coding/challenges
✅ PASS: [Student Overview] GET /api/analytics/student/5
✅ PASS: [Student Skills] GET /api/analytics/student/5/skills
✅ PASS: [Teacher Class Summary] GET /api/analytics/teacher/2/class-summary
✅ PASS: [At-Risk Students] GET /api/analytics/teacher/2/at-risk
✅ PASS: [Admin System Overview] GET /api/analytics/admin/system-overview
✅ PASS: [Admin Placement Readiness] GET /api/analytics/admin/placement-readiness
✅ PASS: [ML Model Info] GET /api/prediction/model-info
✅ PASS: [Student Prediction & Drivers] GET /api/prediction/student/5
✅ PASS: [Batch Placement Forecast] POST /api/prediction/batch/1
✅ PASS: [Resume ATS Scan] POST /api/student/resume/analyze
✅ PASS: [Career AI Chat] POST /api/career-ai/chat
✅ PASS: [Mock Interview Generator] POST /api/career-ai/mock-questions
✅ PASS: [Skill Roadmap Generator] POST /api/career-ai/roadmap
✅ PASS: [Cover Letter Generator] POST /api/career-ai/cover-letter
✅ PASS: [Notification Inbox] GET /api/notifications
✅ PASS: [Student Placement Scorecard] GET /api/reports/student/5/scorecard
✅ PASS: [Batch CSV Performance Export] GET /api/reports/batch/1/export
================================================================
🏆 MASTER E2E TEST RESULTS: 24 PASSED, 0 FAILED (Total: 24)
================================================================
```

### 2. Python FastAPI ML Microservice Unit & Integration Tests (6 Tests)
```bash
python -m pytest ml/tests/test_api.py
```
```
======================== 6 passed in 4.02s ========================
```

### 3. Frontend Production Build Verification
```bash
cd frontend && npm run build
```
```
✓ 60 modules transformed.
dist/index.html                   0.78 kB │ gzip:  0.42 kB
dist/assets/index-DtcCxoqS.css   55.48 kB │ gzip: 10.34 kB
dist/assets/index-aVNSbSVA.js   296.00 kB │ gzip: 81.95 kB
✓ built in 838ms
```

---

## 📂 Repository Structure

```text
EduPredict/
├── frontend/                  # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/        # NotificationBell, ProtectedRoute, etc.
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Student, Teacher, Admin, Coding, Resume, AI Copilot
│   │   ├── services/          # Centralized API service layer
│   │   └── styles.css         # Design system & tokens
│   └── Dockerfile             # Multi-stage production Nginx build
├── backend/                   # Node.js + Express REST API Server
│   ├── config/                # Database pool connection
│   ├── controllers/           # Auth, Admin, Teacher, Student, Analytics, ML, Reports
│   ├── middleware/            # JWT authentication & RBAC authorization
│   ├── routes/                # Express routing endpoints
│   ├── services/              # ML client, Resume ATS, Career AI, Notifications
│   ├── tests/                 # Automated E2E test suites
│   └── Dockerfile             # Container configuration
├── ml/                        # Python FastAPI ML Subsystem
│   ├── data/                  # Synthetic training dataset generator
│   ├── preprocessing/         # 16-feature domain engineering pipeline
│   ├── models/                # Multi-model benchmarking (89.84% ROC-AUC) & explainability
│   ├── saved_models/          # Serialized placement_model.joblib bundle
│   ├── tests/                 # Pytest test suite
│   ├── app.py                 # FastAPI REST microservice
│   └── Dockerfile             # Container configuration
├── database/                  # SQL Schemas across all 18 phases
├── scripts/                   # start-all.ps1 and start-all.sh one-click launchers
├── docs/                      # PRD, Architecture, Implementation logs, Deployment guide
└── docker-compose.yml         # Full multi-service orchestration
```

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).
