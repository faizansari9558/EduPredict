# 05 — Scope & Project Boundaries

## 1. Project Boundaries & Functional Scope

The scope of **EduPredict** encompasses the complete lifecycle of student academic tracking, faculty mentorship, multi-format skill assessments, institutional analytics, machine learning placement readiness forecasting, and campus recruitment automation.

---

## 2. In-Scope Modules & Capabilities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            IN-SCOPE SYSTEM DOMAINS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ AUTH & IDENTITY ]         [ ACADEMIC RECORDS ]     [ VERIFICATION ]      │
│  • JWT Authentication        • CGPA & Semesters       • PDF Uploads         │
│  • Role-Based RBAC           • 10th/12th Scores       • Review Queue        │
│  • Multi-User Sessions       • Skill Inventory        • Status Badges       │
│                                                                             │
│  [ APTITUDE ENGINE ]         [ CODING ARENA ]         [ ANALYTICS & ALERTS ]│
│  • MCQ Question Bank         • Multi-Language Runner  • Student Radar       │
│  • Timed Quiz UI             • Hidden Test Cases      • Teacher Heatmaps    │
│  • Instant Grading           • Autograding Engine     • At-Risk Warning     │
│                                                                             │
│  [ ML INFERENCE ]            [ RESUME & CAREER AI ]   [ PLACEMENT DRIVES ]  │
│  • 16-Feature Pipeline       • ATS Score Analyzer     • Corporate Drives    │
│  • Logistic Reg (89.8% AUC)  • Interview Generator    • Eligibility Engine  │
│  • Impact Explainability     • 90-Day Roadmap         • Shortlist Export    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Core Implemented In-Scope Features (Phases 0 through 19)
1. **Phase 0–3: Foundation & Security**: Environment configuration, database schema, JWT auth, bcrypt password security, and RBAC middleware.
2. **Phase 4–6: User Portals**: Dedicated Admin, Teacher, and Student dashboard interfaces with real-time API bindings.
3. **Phase 7: Aptitude Assessment Engine**: Assessment builder, question bank categories, timed test runner, and submission tracking.
4. **Phase 8: Coding Assessment Engine**: In-browser code editor, execution sandbox, test case suite runner (sample vs hidden), and autograding.
5. **Phase 9: Comprehensive Analytics**: Student performance metrics, teacher class distributions, department benchmarking, and automated at-risk detection.
6. **Phase 10: Machine Learning Pipeline**: 16 engineered features, 5-Fold Stratified Cross-Validation, and multi-model benchmark evaluation.
7. **Phase 11: FastAPI Microservice**: Dedicated Python ML microservice on port 8000 delivering real-time predictions.
8. **Phase 12: AI Explainability**: Feature impact analysis highlighting positive drivers and risk blockers.
9. **Phase 13: Resume AI & ATS Analyzer**: 0-100 ATS resume scoring against verified student profile data.
10. **Phase 14: Career & Interview Copilot**: Mock technical/HR interview generation and personalized 30-60-90 day improvement roadmaps.
11. **Phase 15: Notification Center**: Event-driven alerts, topbar bell, unread badges, and status notifications.
12. **Phase 16: Reports & Export Engine**: Student Placement Scorecard generation and batch CSV data exports.
13. **Phase 17: Security Audit & Test Automation**: Master E2E test suite (28/28 tests passing).
14. **Phase 18: Deployment Orchestration**: Docker Compose multi-container packaging and launch scripts.
15. **Phase 19: Campus Placement Drives**: Corporate placement drive postings, automated eligibility filtering, and shortlist management.

---

## 3. Out-of-Scope (Boundaries & Non-Goals)

To maintain architectural focus, security, and project feasibility, the following items are explicitly **out of scope**:

| Domain | Excluded Capability | Rationale |
| :--- | :--- | :--- |
| **Learning Management (LMS)** | Video lecture streaming, scorm packages, attendance biometric tracking | Handled by dedicated university LMS (Moodle, Canvas). EduPredict focuses on intelligence and placement. |
| **Direct Shell Execution** | Executing untrusted student code directly on root server processes | Security risk. Coding engine uses isolated sandboxing (`vm.runInContext` and controlled runtimes). |
| **Third-Party Payment Gateways** | Tuition fee payments, commercial assessment payments | Institutional deployment operates under university enterprise licensing. |
| **Unverified AI Black Boxes** | Generating placement scores from arbitrary unverified prompt text | All prediction metrics must stem from deterministic, verified database records and trained Scikit-learn models. |
| **NoSQL Database Conversion** | Replacing MySQL with MongoDB as the core relational store | University data is fundamentally relational with strict relational integrity requirements. |

---

## 4. Phased Roadmap Scope Mapping

| Phase Group | Description | Status |
| :--- | :--- | :--- |
| **Foundation (Phases 0–3)** | System skeleton, MySQL schema, Auth, RBAC, Layouts | **Completed ✓** |
| **Portals (Phases 4–6)** | Admin, Teacher, and Student core operational modules | **Completed ✓** |
| **Assessment Suite (Phases 7–8)** | Aptitude engine + Coding arena sandbox | **Completed ✓** |
| **Intelligence Tier (Phases 9–12)** | Analytics dashboards, ML pipeline, FastAPI, Explainability | **Completed ✓** |
| **Career Tools (Phases 13–14)** | Resume ATS analyzer, Career AI copilot | **Completed ✓** |
| **Enterprise Ops (Phases 15–19)** | Notifications, Reports, E2E testing, Docker, Placement drives | **Completed ✓** |
