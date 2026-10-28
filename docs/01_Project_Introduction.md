# 01 — Project Introduction: EduPredict

## 1. Executive Summary

**EduPredict** (Smart Student Academic & Placement Prediction System) is an integrated, enterprise-grade educational intelligence platform designed for higher education institutions, universities, and technical colleges.

The platform bridges the critical gap between academic progress, skill acquisition, assessment benchmarks, and corporate placement readiness. By consolidating student academic histories, faculty-verified document records, multi-disciplinary assessments (aptitude and coding), real-time institutional analytics, and machine-learning-driven predictive analytics, EduPredict empowers educational leaders, faculty advisors, and students to make proactive, data-informed decisions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             EDUPREDICT ECOSYSTEM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ STUDENTS ]           [ TEACHERS / FACULTY ]        [ ADMINISTRATORS ]    │
│  • Academic Tracking    • Document Verification       • Institutional Setup │
│  • Resume & Portfolio   • Assessment Authoring        • Faculty Assignments │
│  • Coding & Aptitude    • Student Performance Review  • Placement Analytics │
│  • Placement Forecast   • At-Risk Early Warning       • Audit & Reports     │
│                                                                             │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    CORE PLATFORM ENGINE (Node.js/Express)             │  │
│  │    • Role-Based Access Control (RBAC)  • Assessment Engine            │  │
│  │    • Secure Document Management        • Analytics & At-Risk Service  │  │
│  │    • Job Drives & Shortlisting Engine  • Notifications & Exporting    │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│                  ┌───────────────────┴───────────────────┐                  │
│                  ▼                                       ▼                  │
│  [ RELATIONAL STORAGE (MySQL) ]           [ AI/ML ENGINE (FastAPI) ]        │
│  • 3NF Normalized Relational Store        • 16 Engineered Domain Features   │
│  • Cached Analytical Materialized Views   • 89.84% ROC-AUC Prediction Model │
│  • Strict Foreign Key Integrity           • SHAP/Feature Impact Guidance    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Vision & Problem Statement

### 2.1 The Traditional Higher Education Dilemma
Higher educational institutions frequently face severe data fragmentation and administrative bottlenecks:
1. **Siloed Academic Records**: Student grades (10th, 12th, undergraduate CGPA, semester transcripts) are stored across disconnected spreadsheets or legacy databases without centralized auditability.
2. **Unverified Claims**: Resumes and portfolios contain unverified projects, skills, and certifications, making faculty validation laborious and unreliable.
3. **Delayed Weakness Detection**: Students discover deficiencies in foundational aptitude or programming only when failing campus recruitment drives in their final semester.
4. **Lack of Predictive Readiness**: Placement cells lack objective, data-backed foresight into which students require immediate remedial intervention before corporate placement seasons begin.

### 2.2 The EduPredict Solution
EduPredict provides an end-to-end ecosystem where:
- **Every data point is authenticated**: Student profiles, academic credentials, and certifications undergo structured faculty review.
- **Continuous benchmarking**: Integrated aptitude test builders and multi-language coding arenas evaluate problem-solving abilities continuously.
- **Predictive forecasting with explainability**: Machine learning models calculate placement probabilities based on verified attributes, highlighting exact strengths and risk blockers.
- **Targeted corporate matching**: Placement officers organize recruitment drives with automated candidate shortlisting against verified eligibility criteria.

---

## 3. Key Stakeholders & Value Propositions

### 3.1 For Students
- **Single Source of Truth**: Centralized digital profile tracking academic percentages, backlogs, technical skills, projects, and certifications.
- **Interactive Practice Arenas**: Timed aptitude testing and multi-language interactive code editor (JavaScript, Python, C++, Java) with instant autograding.
- **Personalized Placement Forecast**: Real-time placement probability score with actionable feedback on how to improve.
- **Resume & Career AI**: ATS resume scoring against verified credentials and generative career roadmaps.

### 3.2 For Teachers & Faculty Mentors
- **Efficient Verification Queue**: One-click approval or rejection (with audit reasons) for student documents and profile updates.
- **Assessment Management**: Create, configure, and publish aptitude quizzes and programming challenges with hidden test case evaluation.
- **At-Risk Alerts**: Automated early detection of students falling behind cohort averages for timely counseling.

### 3.3 For Institutional Administrators & Placement Heads
- **Departmental Hierarchy Control**: Unified management of departments, courses, academic years, and student batches.
- **Institutional Analytics**: Real-time visualization of department-wide performance, cohort rankings, and campus-wide placement readiness.
- **Campus Placement Drives**: Create corporate drives, define minimum CGPA and test cutoffs, and export verified shortlist rosters.

---

## 4. Technology Principles

EduPredict is engineered on modern, open, and robust enterprise software standards:
- **Web Frontend**: React 18 SPA powered by Vite, React Router, and Tailwind CSS v4 / modern CSS design systems.
- **Backend API**: Node.js & Express REST API with modular Controller-Service-Repository architecture and JWT RBAC.
- **Database**: MySQL 8.0 relational database with 3NF schema, strict constraints, analytical views, and stored procedures.
- **Machine Learning**: Python 3.12, Scikit-learn, XGBoost, Pandas, and high-performance FastAPI microservice architecture.
