# 08 — User Roles & Workflows

## 1. Role-Based Access Control (RBAC) Matrix

EduPredict enforces granular Role-Based Access Control across three core user roles:

| Module / Endpoint Group | Student | Teacher / Faculty | Admin |
| :--- | :---: | :---: | :---: |
| **Authentication (`/api/auth`)** | ✓ | ✓ | ✓ |
| **Personal Dashboard & Profile** | ✓ (Own) | ✓ (Own) | ✓ (System) |
| **Document Upload** | ✓ (Own) | — | — |
| **Document Verification Queue** | — | ✓ (Assigned Dept) | ✓ (All) |
| **Take Assessments & Coding Challenges** | ✓ | — | — |
| **Author Assessments & Coding Problems** | — | ✓ | ✓ |
| **Grade Submissions & View Class Results** | — | ✓ | ✓ |
| **View Placement Forecast & Explainability** | ✓ (Own) | ✓ (Assigned) | ✓ (System) |
| **Resume AI & Career Copilot** | ✓ | — | — |
| **Department & Batch CRUD** | — | — | ✓ |
| **User Account Administration** | — | — | ✓ |
| **Post Placement Drives & Shortlists** | ✓ (View/Apply) | ✓ (View) | ✓ (Manage/Export) |
| **System-Wide Analytics & Audit Logs** | — | — | ✓ |

---

## 2. Core User Journey Workflows

### 2.1 Student Journey Workflow
```
[ 1. Registration & Login ]
            │
            ▼
[ 2. Complete Profile ] ──► (Add Skills, Projects, Certifications)
            │
            ▼
[ 3. Upload Documents ] ──► (Transcripts, Certificates, Resume PDF)
            │
            ▼
[ 4. Faculty Verification ] ──► (Pending ──► Verified / Rejected)
            │
            ▼
[ 5. Assessment Participation ]
    ├── A. Timed Aptitude Quizzes
    └── B. Coding Arena Challenges
            │
            ▼
[ 6. Intelligence & Career Guidance ]
    ├── A. Placement Forecast (Probability & Risk Drivers)
    ├── B. Resume ATS Score Analyzer
    └── C. AI Interview & 90-Day Roadmap Copilot
            │
            ▼
[ 7. Apply to Campus Placement Drives ]
```

---

### 2.2 Teacher / Faculty Mentor Workflow
```
[ 1. Faculty Login ]
            │
            ▼
[ 2. Review Assigned Students Dashboard ]
            │
            ├──────────────────────────────────────────┐
            ▼                                          ▼
[ 3. Verification Queue ]                   [ 4. Assessment Studio ]
  • Inspect pending student documents         • Create Aptitude Tests (MCQ)
  • One-click Approve (`verified`)           • Author Coding Challenges
  • Reject with detailed feedback             • Configure testcases & templates
            │                                 • Publish Assessments
            │                                          │
            └────────────────────┬─────────────────────┘
                                 ▼
                    [ 5. Performance Review ]
                      • Class Score Distributions
                      • Question Discrimination Indices
                      • Automated At-Risk Early Warnings
```

---

### 2.3 Institutional Administrator Workflow
```
[ 1. Admin Login ]
            │
            ▼
[ 2. Institutional Setup ]
    ├── Manage Departments & Assign HODs
    ├── Configure Academic Years & Student Batches
    └── Provision Faculty & Student Accounts
            │
            ▼
[ 3. Monitor Institutional Health ]
    ├── Cross-Department Performance Analytics
    ├── System User Activity & Security Audit Logs
    └── Batch At-Risk Aggregate Trends
            │
            ▼
[ 4. Campus Recruitment Orchestration ]
    ├── Post Corporate Placement Drives
    ├── Define Cutoff Criteria (CGPA, Backlogs, Skills)
    └── Generate & Export Verified Candidate Shortlists
```

---

## 3. Entity State Transition Diagrams

### 3.1 Document Verification Lifecycle
```
                 ┌───────────────┐
                 │  UPLOAD FILE  │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │    PENDING    │
                 └───────┬───────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
   [ Teacher Approves ]       [ Teacher Rejects ]
           │                           │
           ▼                           ▼
   ┌───────────────┐           ┌───────────────┐
   │   VERIFIED    │           │   REJECTED    │
   └───────────────┘           └───────┬───────┘
                                       │
                                       ▼
                              [ Student Re-uploads ]
                                       │
                                       ▼
                               ┌───────────────┐
                               │    PENDING    │
                               └───────────────┘
```

### 3.2 Coding Submission Lifecycle
```
[ Code Edited in Browser ] ──► [ Run Sample Tests ] ──► [ Interactive Console Output ]
                                         │
                                         ▼
                             [ Submit Final Solution ]
                                         │
                                         ▼
                             [ Sandbox Evaluation ]
                               ├── Sample Test Cases
                               └── Hidden Test Cases
                                         │
                                         ▼
                             [ Compute Pass Rate % ]
                                         │
                                         ▼
                      [ Persist in `coding_submissions` ]
                      [ Record in `student_metrics` ]
```
