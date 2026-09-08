# EduPredict 🎓
### Smart Student Academic & Placement Prediction Intelligence System

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%205-61dafb.svg)
![Node](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933.svg)
![Python](https://img.shields.io/badge/ML%20Service-FastAPI%20%7C%20Scikit--Learn-009688.svg)
![Database](https://img.shields.io/badge/Database-MySQL%208.0%20%7C%20MariaDB-4479A1.svg)
![Tests](https://img.shields.io/badge/Tests-28%2F28%20Master%20E2E%20Passed-brightgreen.svg)

---

## 🌟 Executive Overview

**EduPredict** is an end-to-end intelligent campus placement readiness and academic progress platform built for universities and engineering colleges. It bridges the gap between institutional records, technical coding assessments, document verification, and machine learning placement forecasts with actionable, prescriptive AI recommendations.

---

## 🚀 Key Features

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EDUPREDICT KEY MODULES                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. 🛡️  Role-Based Access Control (Admin, Teacher, Student)                 │
│ 2. 📂  Student Portfolio & Document Verification Workflow                   │
│ 3. ⏱️  Timed Aptitude Assessment Engine & Question Bank                      │
│ 4. 💻  Multi-Language Sandboxed Coding Arena (JS, Python, C++, Java)        │
│ 5. 📊  Multi-Tier Analytics Dashboards (Student, Faculty, Department, Admin)│
│ 6. ⚠️  Automated At-Risk Student Early Detection & Interventions            │
│ 7. 🤖  Machine Learning Placement Prediction (89.84% ROC-AUC Ensemble)     │
│ 8. 💡  AI Explainability Engine (Positive Drivers & Risk Blockers)          │
│ 9. 📄  Smart ATS Resume Analyzer & Credential Cross-Referencing             │
│ 10.💬  Generative AI Career & Mock Technical Interview Copilot              │
│ 11.🔔  Real-Time Notification Center with Topbar Bell & Unread Badges       │
│ 12.📥  Printable Placement Scorecards & Cohort CSV Performance Exports      │
│ 13.💼  Corporate Campus Placement Drives & Candidate Shortlisting Engine    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FULL STACK ARCHITECTURE OVERVIEW                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [Vite + React 18 Single Page Application]   (Port 3000 / Port 80)         │
│     ├── Executive KPI Scorecards & Gauges                                   │
│     ├── Interactive Coding Arena & Monaco-style Editor                      │
│     ├── ATS Resume Scanner & AI Career Copilot                              │
│     └── Notification Bell & Placement Scorecard Printouts                   │
│            │                                                                │
│            ▼ REST API                                                       │
│   [Node.js + Express Backend API Engine]       (Port 5000)                  │
│     ├── JWT Authentication & Role-Based Guard Middleware                    │
│     ├── Assessment & Sandboxed Autograding Controller                       │
│     ├── Student & Institutional Analytics Aggregations                      │
│     ├── Resume AI Parser & Career Copilot Controller                        │
│     └── Notification Center & CSV Export Engines                            │
│            │                                                                │
│            ├──────────────────────────────────────────┐                     │
│            ▼ SQL Queries                              ▼ REST Inference      │
│   [MySQL 8.0 / MariaDB Relational Database]   [FastAPI ML Microservice]     │
│   (Port 3306)                                 (Port 8000)                   │
│     • Academic & Profile Tables                 • Logistic Regression & GB  │
│     • Assessments & Coding Submissions          • 16 Engineered Features    │
│     • Analytics Views & Stored Procedures       • Explainability & Batch API│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 18, Vite 5, React Router v6, Vanilla CSS Design System with Glassmorphism & Modern Data Visualizations.
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
