# EduPredict Project Roadmap

## Phase 0 — Project Audit & Environment

Status: Completed (audit + setup skeleton)

Planned activities:
- Inspect workspace and detect existing files ✓
- Check installed tooling ✓
- Verify Node.js, Python, Git, and MySQL readiness ✓
- Prepare project structure and documentation ✓
- Create environment templates and ignore rules ✓

## Phase 1 — Frontend Foundation

Status: Completed

Deliverables:
- React + Vite application setup ✓
- React Router setup ✓
- Global layout and navbar ✓
- Landing page ✓
- Login and registration pages ✓
- Design system with CSS ✓
- Responsive layout ✓

## Phase 2 — Database

Status: Completed

Deliverables:
- MySQL schema design ✓
- Core tables for users, roles, departments, batches, academics, documents, assessments, notifications ✓
- Foreign keys, indexes, and validation strategy ✓
- Seed data for roles and academic years ✓

## Phase 3 — Auth & RBAC

Status: Completed

Deliverables:
- JWT + bcrypt authorization ✓
- RBAC foundation for Student, Teacher, Admin ✓
- Auth middleware and protected routes ✓
- Login/register endpoints ✓

## Phase 4 — Admin Module

Status: Completed

Deliverables:
- Admin dashboard with summary stats ✓
- User management CRUD ✓
- Student management CRUD ✓
- Department management CRUD ✓

## Phase 5 — Teacher Module

Status: Completed

Deliverables:
- Teacher dashboard with summary stats ✓
- Assigned student management ✓
- Student verification workflows (foundation) ✓
- Assessment creation and publishing ✓
- Assessment results viewing ✓

## Phase 6 — Student Module

Status: Completed

Deliverables:
- Student dashboard with summary stats ✓
- Official profile view and update ✓
- Academic and document uploads ✓
- Verification status tracking ✓
- Assessment access and attempt initiation ✓

## Phase 7 — Aptitude Assessment Engine

Status: Completed

Deliverables:
- Question bank and categories ✓
- Assessment creation UI for teachers ✓
- Question management (add, edit, delete) ✓
- Test configuration (duration, marks, difficulty) ✓
- Student assessment-taking interface ✓
- Timer and question navigation ✓
- Assessment publishing and results viewing ✓

## Phase 8 — Coding Assessment Engine

Status: Completed

Deliverables:
- Code editor IDE UI with line numbers and multi-language support (JS, Python, C++, Java) ✓
- Question management (create, edit, delete, publish toggle) ✓
- Test case configuration (sample public vs hidden test cases) ✓
- Multi-language starter code templates ✓
- Execution sandbox and evaluation runner with runtime & memory metrics ✓
- Automatic grading and result publication ✓
- Student Coding Arena and Teacher Coding Manager portals ✓

## Phase 9 — Analytics

Status: Completed ✓

Delivered:
- Student, teacher, course, and department analytics ✓
- Dashboard charts and skill-gap analysis ✓
- Attention-listing and alert tracking for at-risk students ✓

## Phase 10 — ML Pipeline & Model Training

Status: Completed ✓

Delivered:
- Data generation pipeline & feature engineering (16 engineered domain features) ✓
- Multi-model comparison across Logistic Regression, Decision Tree, Random Forest, and Gradient Boosting ✓
- 5-Fold Stratified Cross-Validation & evaluation metrics (ROC-AUC: 89.84%, F1: 86.76%) ✓
- Model serialization bundle in `ml/saved_models/placement_model.joblib` ✓

## Phase 11 — FastAPI ML Service

Status: Completed ✓

Delivered:
- High-performance FastAPI prediction microservice on port 8000 ✓
- `/health`, `/model-info`, `/predict/placement`, `/predict/explain`, and `/predict/batch` endpoints ✓
- Express backend service client with automatic fallback resilience ✓

## Phase 12 — AI Explainability & Recommendations

Status: Completed ✓

Delivered:
- Feature contribution analysis (positive placement drivers and risk blockers) ✓
- Prescriptive student recommendations & actionable next steps ✓
- Live interactive ML Placement Forecast card on Student Analytics dashboard ✓

## Phase 13 — Resume AI

Planned deliverables:
- Resume extraction and scoring
- Verified-document-based analysis
- Improvement recommendations

## Phase 14 — Generative AI

Planned deliverables:
- Career assistant for student guidance
- Verified-profile-aware prompts and recommendations

## Phase 15 — Notifications

Planned deliverables:
- Verification rejection alerts
- Assessment reminders
- Result publication notices
- Profile completeness reminders

## Phase 16 — Reports

Planned deliverables:
- Student and class-level reporting
- Department and placement analysis
- Excel/PDF export support

## Phase 17 — Security & Testing

Planned deliverables:
- Authorization and security validation
- File upload sanitization tests
- SQL injection and RBAC checks
- Assessment engine and UI testing

## Phase 18 — Deployment

Planned deliverables:
- Production-ready configuration
- Frontend hosting
- Backend hosting
- ML service deployment
- MySQL cloud setup

---

## Current State Summary
Phases 0 through 8 are now fully implemented:
- **Phase 0–3**: Foundation, Database, Auth & RBAC
- **Phase 4–6**: Admin, Teacher, and Student Portals
- **Phase 7**: Aptitude Assessment Engine
- **Phase 8**: Coding Assessment Engine (Sandbox runner, autograding, Coding Arena & Manager)

**Current phase:**
- **Phase 9: Analytics** (Student & Department Performance, Skill Gap Analysis) - **IN PROGRESS** ⏳

**Next phase:**
- **Phase 10: ML** (Data pipeline and model comparison)
