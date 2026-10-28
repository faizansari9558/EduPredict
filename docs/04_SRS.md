# 04 — Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) provides a comprehensive, formal specification of the functional, interface, performance, and behavioral requirements for **EduPredict (Smart Student Academic & Placement Prediction System)**.

### 1.2 Document Conventions
- **MUST / SHALL**: Mandatory requirement.
- **SHOULD**: Highly recommended requirement.
- **MAY**: Optional requirement.

### 1.3 Intended Audience
Developers, system architects, test engineers, database administrators, and institutional stakeholders.

---

## 2. Overall Description

### 2.1 Product Perspective
EduPredict is a distributed multi-tier client-server application consisting of:
- **Presentation Tier**: React 18 Single Page Application (SPA) interacting via REST over HTTPS.
- **Application Tier**: Node.js & Express.js REST API implementing business rules, RBAC, and data orchestration.
- **Database Tier**: MySQL 8.0 relational database with ACID compliance, relational integrity, views, and stored procedures.
- **Machine Learning Microservice**: Python 3.12 FastAPI microservice providing sub-50ms inference and SHAP explainability.

### 2.2 User Characteristics
- **Students**: General computer literacy, access via desktop/laptop/mobile browsers.
- **Teachers / Faculty**: Familiarity with academic grading, web browsers, and administrative portals.
- **System Administrators**: Technical knowledge of user management and system settings.

### 2.3 General Constraints
- **Database**: Must use MySQL as primary transactional and analytical store.
- **Security**: Must enforce JSON Web Tokens (JWT) with HMAC-SHA256 signature and bcrypt password hashing (minimum 10 salt rounds).
- **Execution Sandboxing**: Untrusted student code submissions must be evaluated in isolated runtime execution contexts.

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- **Responsive Layout**: Fluid breakpoints supporting Mobile (320px+), Tablet (768px+), and Desktop (1024px+).
- **Visual Feedback**: Real-time loading skeletons, error toasts, and verification badges.
- **Accessibility**: High contrast ratios, accessible form labels, keyboard navigation in assessment modules.

### 3.2 Hardware Interfaces
- Standard client desktop, laptop, or mobile devices capable of running modern web browsers.
- Server infrastructure supporting standard x86-64 Linux/Windows environments with minimum 2 CPU cores and 4GB RAM.

### 3.3 Software Interfaces
- **Operating Systems**: Windows 10/11, Linux (Ubuntu 20.04+), macOS.
- **Node.js**: Version 18.x or higher.
- **Python**: Version 3.10 to 3.12 with FastAPI, Uvicorn, Scikit-learn, XGBoost, Pandas.
- **MySQL**: Version 8.0+ or MariaDB 10.5+.

### 3.4 Communication Protocols
- **HTTP/1.1 and HTTP/2**: JSON payload REST communication over standard ports (`3000`, `3001`, `5000`, `8000`).
- **CORS**: Strict Origin Whitelisting in production environments.

---

## 4. System Features & Functional Specifications

### 4.1 Module 1: Authentication & Identity Management
- **SRS-AUTH-01**: System shall authenticate users using email and bcrypt-hashed password.
- **SRS-AUTH-02**: System shall issue a signed JWT containing `id`, `email`, `role`, and `userIdNumber` valid for 7 days.
- **SRS-AUTH-03**: System shall reject unauthorized requests with HTTP 401 Unauthorized and insufficient role requests with HTTP 403 Forbidden.

### 4.2 Module 2: Profile & Document Verification
- **SRS-DOC-01**: System shall allow students to upload PDF marksheets and resumes up to 5MB.
- **SRS-DOC-02**: System shall store file metadata in `documents` table with initial status `pending`.
- **SRS-DOC-03**: System shall allow teachers to review, approve (`verified`), or reject (`rejected` with feedback) documents.

### 4.3 Module 3: Aptitude Assessment Engine
- **SRS-APT-01**: System shall support Multiple Choice Questions (MCQ) with 4 options and automated key matching.
- **SRS-APT-02**: System shall provide a client-side countdown timer that triggers auto-submission upon expiry.
- **SRS-APT-03**: System shall compute overall percentage score and store attempt responses in `student_assessment_responses`.

### 4.4 Module 4: Coding Assessment Engine
- **SRS-CODE-01**: System shall support problem creation with problem statement, constraints, starter templates, and test cases.
- **SRS-CODE-02**: System shall provide public sample test cases for interactive execution and hidden test cases for final submission.
- **SRS-CODE-03**: System shall execute and grade code in JavaScript, Python, C++, and Java, measuring runtime and memory consumption.

### 4.5 Module 5: Machine Learning & Prediction
- **SRS-ML-01**: System shall extract 16 engineered features from verified student profiles and assessment metrics.
- **SRS-ML-02**: System shall query FastAPI `/predict/placement` to compute placement probability (0.0% to 100.0%).
- **SRS-ML-03**: System shall generate explainability drivers identifying top 3 positive factors and top 3 risk blockers.

### 4.6 Module 6: Campus Placement Drives
- **SRS-JOB-01**: System shall allow administrators to post placement drives with eligibility criteria.
- **SRS-JOB-02**: System shall evaluate student eligibility and allow one-click applications.
- **SRS-JOB-03**: System shall generate automated verified candidate shortlist rosters exportable to CSV.

---

## 5. Non-Functional Requirements

### 5.1 Performance
- API response time for read operations shall not exceed 100ms under standard load.
- ML inference endpoint response time shall not exceed 50ms per single student request.
- Sandbox execution timeout shall be enforced at 5000ms maximum per testcase.

### 5.2 Reliability & Availability
- Express backend shall include graceful error boundary handlers to prevent process crashes.
- Database connection pool shall maintain 10 active connections with automatic reconnect.

### 5.3 Security & Data Integrity
- Parameterized SQL queries shall be used across all database access layers to prevent SQL injection.
- Passwords shall never be transmitted in plain text or logged in server telemetry.
- Uploaded files shall be validated for MIME type (`application/pdf`, `image/png`, `image/jpeg`).
