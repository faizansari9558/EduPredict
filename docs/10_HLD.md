# 10 — High-Level Design (HLD)

## 1. System Topology & Subsystems

The High-Level Design of **EduPredict** defines the principal software subsystems, boundary interfaces, network architecture, and data pipelines.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EDUPREDICT SUBSYSTEM MAP                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │ 1. Identity & RBAC    │  │ 2. Academic Record    │  │ 3. Document     │  │
│  │    Subsystem          │  │    Subsystem          │  │    Verification │  │
│  │    (JWT / Bcrypt)     │  │    (Academics/Skills) │  │    (Multer/PDF) │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └────────┬────────┘  │
│              │                          │                       │           │
│              └──────────────────────────┼───────────────────────┘           │
│                                         ▼                                   │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │ 4. Aptitude Engine    │  │ 5. Coding Arena       │  │ 6. Analytics    │  │
│  │    (Timed MCQ Runner) │  │    (Sandbox / Autograde│  │    Engine       │  │
│  └───────────┬───────────┘  └───────────┬───────────┘  └────────┬────────┘  │
│              │                          │                       │           │
│              └──────────────────────────┼───────────────────────┘           │
│                                         ▼                                   │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │ 7. ML Prediction      │  │ 8. Career AI & ATS    │  │ 9. Placement    │  │
│  │    (FastAPI / Model)  │  │    (Copilot/Guidance) │  │    Drives       │  │
│  └───────────────────────┘  └───────────────────────┘  └─────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Subsystem Descriptions

### Subsystem 1: Identity & Role-Based Access Control
- Manages user lifecycle (Registration, Login, Password Security).
- Generates and signs JWT tokens with role claims (`admin`, `teacher`, `student`).
- Intercepts requests through authorization middleware enforcing resource boundaries.

### Subsystem 2: Academic Record & Portfolio Management
- Tracks formal academic metrics (CGPA, 10th/12th percentages, standing backlogs).
- Maintains technical skill taxonomy, project portfolios, internships, and certifications.
- Computes profile completeness indicators.

### Subsystem 3: Document Verification Pipeline
- Accepts multipart PDF and image uploads with server-side validation.
- Routes submissions to the assigned department faculty's review queue.
- Updates verification states and triggers notifications upon review.

### Subsystem 4: Aptitude Assessment Engine
- Stores categorized questions in a centralized Question Bank.
- Generates timed assessment instances with randomized question orders.
- Evaluates student responses against official answer keys upon submission or timeout.

### Subsystem 5: Coding Sandbox & Autograding Engine
- Provides interactive web-based IDE with line numbers and multi-language support.
- Safely runs student code against public sample test cases.
- Autogrades submissions against hidden test cases, measuring runtime execution time and memory limits.

### Subsystem 6: Analytics & At-Risk Early Warning Engine
- Precalculates student performance aggregates into `student_metrics` table.
- Identifies at-risk students using multi-factor threshold algorithms (low CGPA, low test scores, backlogs).
- Feeds interactive charts (radar, score distributions, cohort percentiles).

### Subsystem 7: Machine Learning Prediction & Explainability
- Extracts 16 domain features from verified database records.
- Executes classification models yielding placement readiness probability (0–100%).
- Computes feature contribution weights identifying positive factors and risk blockers.

### Subsystem 8: Career Copilot & ATS Resume Analyzer
- Compares resume keyword density against verified profile credentials to output an ATS Match Score.
- Generates prescriptive interview preparation questions and personalized 30-60-90 day milestone roadmaps.

### Subsystem 9: Campus Placement Drives & Shortlisting
- Manages corporate placement postings, job descriptions, and salary packages.
- Applies eligibility filters to generate verified candidate rosters.
- Exports filtered candidate tables to CSV/PDF formats for campus recruiters.

---

## 3. Technology Selection Rationale

| Layer | Selected Tech | Key Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Virtual DOM speed, declarative component model, rich ecosystem | Angular, Vue (Less flexibility for modular widgets) |
| **Backend API** | Node.js + Express | Non-blocking asynchronous I/O, lightweight JSON handling, vast npm ecosystem | Django, Spring Boot (Heavier runtime overhead) |
| **Database** | MySQL 8.0 | Relational integrity, strict ACID compliance, analytical views & procedures | MongoDB (Inadequate for strict relational institutional hierarchy) |
| **ML Service** | Python + FastAPI | Native Scikit-learn/NumPy compatibility, async ASGI speed, OpenAPI docs | Flask (Lower concurrency performance) |
