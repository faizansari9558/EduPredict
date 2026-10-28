# EduPredict

> **Smart Student Academic & Placement Prediction System**

EduPredict is an enterprise-grade educational intelligence platform designed for universities and higher education institutions. It centralizes student academic records, automates faculty document verification, delivers timed aptitude and multi-language coding assessments, detects at-risk students through real-time analytics, and provides machine-learning-driven placement forecasting with explainable guidance.

---

## 1. Project Overview

Higher education institutions often struggle with fragmented academic data, unverified student resumes, delayed intervention for struggling students, and lack of objective predictive foresight into campus placement readiness.

EduPredict resolves these challenges by providing:
- **Verified Digital Portfolios**: Immutable student records backed by faculty document verification.
- **Integrated Assessment Arenas**: Timed aptitude testing and a multi-language coding IDE with sandbox execution and autograding.
- **Predictive Placement Analytics**: Scikit-learn machine learning models (89.84% ROC-AUC) delivering placement probabilities and prescriptive improvement roadmaps.
- **Campus Placement Drives**: Automated corporate drive matching, eligibility filtering (CGPA, backlogs, skills), and shortlist generation.

---

## 2. Main Features

- **Role-Based Portals**: Tailored interfaces for Students, Teachers, and System Administrators.
- **Document Verification Workflow**: Multi-format document upload (PDF/images) with faculty approval/rejection queues.
- **Aptitude Assessment Engine**: Categorized question bank, timed test delivery, synchronized countdowns, and automatic grading.
- **Coding Assessment Engine**: Interactive code editor with line numbers, multi-language support (JS, Python, C++, Java), and hidden test case evaluation.
- **Dashboard Analytics & At-Risk Alerts**: Real-time performance tracking, cohort percentile ranking, and automated early warning flags.
- **Machine Learning Inference**: 16-feature Scikit-learn predictive model served via high-performance FastAPI microservice.
- **AI Explainability**: Feature impact analysis detailing top positive placement drivers and critical risk blockers.
- **Resume AI & Career Copilot**: ATS resume match scoring, mock technical/HR interview generation, and 30-60-90 day milestone roadmaps.
- **Campus Placement Drives**: Corporate drive postings, automated candidate eligibility checks, and shortlist CSV/PDF exports.

---

## 3. User Roles

| Role | Operational Scope & Permissions |
| :--- | :--- |
| **Student** | Maintain academic portfolio, upload marksheets/resumes, attempt aptitude quizzes and coding challenges, view placement forecasts, and apply for recruitment drives. |
| **Teacher / Faculty** | Verify student documents, author aptitude tests and coding challenges, inspect class score distributions, and monitor at-risk student alerts. |
| **Administrator** | Manage institutional hierarchy (Departments, Batches, Courses), administer user accounts, post campus placement drives, and export audit reports. |

---

## 4. Technology Stack

### Frontend
- **Framework:** React 18 SPA
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS v4 (Stitch UI) / Modern Custom CSS
- **Visualizations:** Recharts & SVG Metric Gauges

### Backend API
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **File Handling:** Multer (Multipart uploads)
- **Sandboxing:** Node.js VM execution context

### Database
- **Engine:** MySQL 8.0 / MariaDB 10.5+
- **Management:** phpMyAdmin / CLI
- **Architecture:** 3NF relational schema, analytical materialized views, stored procedures

### Machine Learning
- **Language:** Python 3.12
- **Frameworks:** Scikit-learn, XGBoost, Pandas, NumPy
- **API Framework:** FastAPI & Uvicorn ASGI Server
- **Models:** Logistic Regression (89.84% ROC-AUC), Random Forest, Gradient Boosting

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       COMPLETE EDUPREDICT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [Vite + React 18 SPA]                (Port 3000: Legacy / Port 3001: Stitc│
│            │                                                                │
│            ▼                                                                │
│   [Node.js Express Backend API]        (Port 5000)                          │
│     ├── Auth & RBAC (Admin, Teacher, Student)                               │
│     ├── Assessment & Coding Sandbox Engine                                  │
│     ├── Analytics & At-Risk Detection Service                               │
│     ├── Resume AI & Career Copilot                                          │
│     ├── Notification Center & Real-time Alerts                              │
│     └── Placement Drives & Shortlisting Engine                              │
│            │                                                                │
│            ├──────────────────────────────────────────┐                     │
│            ▼                                          ▼                     │
│   [MySQL Relational Database]             [FastAPI ML Microservice]         │
│   (Port 3306)                             (Port 8000)                       │
│     • Users, Batches, Departments           • 16-Feature Scikit-learn Model │
│     • Assessments & Submissions             • 89.84% ROC-AUC Placement Score│
│     • Analytical Views & Procedures         • Explainability Drivers & SHAP │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Project Structure

```
EduPredict/
├── frontend/             # Original React 18 + Vite SPA (Port 3000)
│   ├── src/              # Pages, components, context, and services
│   └── package.json
├── stitch/               # Google Stitch React 18 + Tailwind v4 UI (Port 3001)
│   ├── src/              # Modern glassmorphic pages, layouts, and charts
│   └── package.json
├── backend/              # Node.js + Express REST API (Port 5000)
│   ├── config/           # MySQL database pool configuration
│   ├── controllers/      # 13 Modular controller handlers
│   ├── middleware/       # JWT auth & RBAC route guards
│   ├── routes/           # 14 REST API endpoint routers
│   ├── services/         # ML client, AI copilot, Resume, and Notification services
│   ├── scripts/          # Database schema and seed init scripts
│   ├── tests/            # Master E2E and integration test suites
│   └── server.js         # Backend server entry point
├── ml/                   # Python FastAPI ML Microservice (Port 8000)
│   ├── data/             # Training datasets and synthetic generator
│   ├── models/           # Training scripts and explainability engine
│   ├── preprocessing/    # Scikit-learn feature transformers
│   ├── saved_models/     # Serialized model bundles and metrics
│   ├── tests/            # FastAPI PyTest test suite
│   ├── app.py            # ASGI application entry point
│   └── requirements.txt  # Python ML dependencies
├── database/             # Relational database scripts
│   ├── schema.sql        # Authoritative master MySQL schema
│   └── seed.sql          # Seed dataset (Roles, Depts, Users, Problems)
├── docs/                 # Standardized project documentation (01 to 25 + Roadmap)
├── scripts/              # Launch and automation scripts
├── .env.example          # Environment variable template
├── .gitignore            # Git exclusion rules
├── docker-compose.yml    # Production multi-container orchestration
├── start.bat             # Fast launcher (Legacy Frontend + Backend + ML)
├── start-stitch.bat      # Fast launcher (Stitch UI + Backend + ML)
├── stop.bat              # Service teardown script
└── package.json          # Root launcher scripts
```

---

## 7. Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 to v3.12
- **MySQL**: v8.0 or higher / MariaDB 10.5+
- **Git**

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/faizansari9558/EduPredict.git
   cd EduPredict
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to configure your MySQL database credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`).*

3. **Install Dependencies**:
   ```bash
   # Backend dependencies
   cd backend && npm install

   # Frontend dependencies
   cd ../frontend && npm install

   # Stitch Frontend dependencies
   cd ../stitch && npm install

   # Python ML virtual environment & dependencies
   cd ..
   python -m venv .venv
   .venv\Scripts\activate      # Windows (.venv/bin/activate on Linux/macOS)
   pip install -r ml/requirements.txt
   ```

---

## 8. Database Setup

1. **Create and Seed MySQL Database**:
   ```bash
   # Load master relational schema
   mysql -u root -p < database/schema.sql

   # Seed initial data (Roles, Departments, Users, Assessments)
   mysql -u root -p EduPredict < database/seed.sql
   ```

2. **Verify Database Connection**:
   Start the backend and visit: `http://127.0.0.1:5000/api/health`

---

## 9. Running Frontend

### Option A: Standard Frontend (Port 3000)
```bash
cd frontend
npm run dev
```
Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

### Option B: Google Stitch Modern UI (Port 3001)
```bash
cd stitch
npm run dev
```
Open [http://127.0.0.1:3001](http://127.0.0.1:3001) in your browser.

---

## 10. Running Backend

```bash
cd backend
node server.js
```
The REST API will be active at [http://127.0.0.1:5000/api](http://127.0.0.1:5000/api).

---

## 11. Running ML Service

```bash
# Activate virtual environment
.venv\Scripts\activate

# Launch FastAPI ASGI server
python -m uvicorn ml.app:app --host 127.0.0.1 --port 8000
```
Interactive OpenAPI Swagger docs available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

> **Fast Launch:** On Windows, you can launch all three services simultaneously by double-clicking `start.bat` or `start-stitch.bat`. Stop all running services by running `stop.bat`.

---

## 12. Development Roadmap

The platform has completed all 19 planned engineering phases:
- **Phase 0–3:** Foundation, MySQL Relational Database, JWT Auth & RBAC
- **Phase 4–6:** Admin, Teacher, and Student Portals with Document Verification
- **Phase 7–8:** Aptitude Assessment Engine & Multi-Language Coding Sandbox
- **Phase 9–12:** Analytics Dashboards, ML Pipeline, FastAPI Microservice & AI Explainability
- **Phase 13–14:** Resume AI (ATS Scorer) & Generative Career/Interview Copilot
- **Phase 15–19:** Notifications, Scorecards, E2E Testing, Docker Packaging, Campus Placement Drives

*Detailed phase documentation is maintained in [docs/PROJECT_ROADMAP.md](docs/PROJECT_ROADMAP.md).*

---

## 13. Documentation Index

Comprehensive technical documentation is cataloged inside the `docs/` directory:

| Document | Description |
| :--- | :--- |
| [`01_Project_Introduction.md`](docs/01_Project_Introduction.md) | Executive summary, vision, and core purpose |
| [`02_PRD.md`](docs/02_PRD.md) | Full Product Requirements Document and personas |
| [`03_IRD.md`](docs/03_IRD.md) | Institutional governance, hierarchy, and compliance |
| [`04_SRS.md`](docs/04_SRS.md) | Formal IEEE 830 Software Requirements Specification |
| [`05_Scope.md`](docs/05_Scope.md) | In-scope vs out-of-scope functional boundaries |
| [`06_Functional_Requirements.md`](docs/06_Functional_Requirements.md) | Granular functional specifications per module |
| [`07_Non_Functional_Requirements.md`](docs/07_Non_Functional_Requirements.md) | Latency targets, security controls, and reliability |
| [`08_User_Roles_and_Workflows.md`](docs/08_User_Roles_and_Workflows.md) | RBAC matrix, user journeys, and state transitions |
| [`09_System_Architecture.md`](docs/09_System_Architecture.md) | Multi-tier architecture and communication sequences |
| [`10_HLD.md`](docs/10_HLD.md) | High-Level Design and subsystem descriptions |
| [`11_LLD.md`](docs/11_LLD.md) | Low-Level Design and controller-service patterns |
| [`12_Database_Design.md`](docs/12_Database_Design.md) | Relational principles, domain taxonomy, and indexing |
| [`13_ER_Diagram.md`](docs/13_ER_Diagram.md) | Mermaid ER diagrams and data dictionary |
| [`14_Database_Schema.md`](docs/14_Database_Schema.md) | MySQL setup guide and complete DDL specifications |
| [`15_API_Documentation.md`](docs/15_API_Documentation.md) | Complete REST API endpoint reference catalog |
| [`16_Security_Architecture.md`](docs/16_Security_Architecture.md) | STRIDE threat modeling, cryptography, and sandboxing |
| [`17_UI_UX_Design.md`](docs/17_UI_UX_Design.md) | Information architecture and responsive viewports |
| [`18_Design_System.md`](docs/18_Design_System.md) | Color tokens, typography hierarchy, and Tailwind v4 |
| [`19_Dashboard_Analytics.md`](docs/19_Dashboard_Analytics.md) | Analytics formulations, views, and at-risk algorithms |
| [`20_Assessment_Specification.md`](docs/20_Assessment_Specification.md) | Aptitude test builder and timed quiz runner |
| [`21_Coding_Engine_Design.md`](docs/21_Coding_Engine_Design.md) | Coding arena sandbox, autograding, and test suites |
| [`22_ML_Architecture.md`](docs/22_ML_Architecture.md) | ML pipeline, FastAPI microservice, and resilience |
| [`23_ML_Dataset_and_Features.md`](docs/23_ML_Dataset_and_Features.md) | 16-feature schema and preprocessing transformations |
| [`24_ML_Model_Evaluation.md`](docs/24_ML_Model_Evaluation.md) | Model benchmarks (89.84% AUC) and feature weights |
| [`25_Testing_and_Deployment.md`](docs/25_Testing_and_Deployment.md) | Test suites, local runbooks, and Docker deployment |
| [`PROJECT_ROADMAP.md`](docs/PROJECT_ROADMAP.md) | Master development roadmap (Phases 0–19) |

---

## 14. Testing

### Run Master End-to-End Test Suite (28 Test Cases)
```bash
node backend/tests/test_all_features_e2e.js
```

### Run Analytics Integration Tests (13 Endpoints)
```bash
node backend/tests/test_all_analytics_endpoints.js
```

### Run Python ML Microservice Tests
```bash
python -m pytest ml/tests/test_api.py -v
```

### Run Frontend Production Builds
```bash
cd frontend && npm run build
cd ../stitch && npm run build
```

---

## 15. Deployment

### Multi-Container Docker Deployment
Deploy the entire frontend, backend, ML microservice, and MySQL database stack with one command:

```bash
docker-compose up --build -d
```

### Container Port Mapping:
| Service | Container | Port |
| :--- | :--- | :---: |
| **Frontend SPA** | `edupredict-frontend` | `3000` |
| **Backend API** | `edupredict-backend` | `5000` |
| **FastAPI ML** | `edupredict-ml` | `8000` |
| **MySQL Database**| `edupredict-mysql` | `3306` |

---

## 16. License

This project is developed for educational institutions and universities under the ISC License.
