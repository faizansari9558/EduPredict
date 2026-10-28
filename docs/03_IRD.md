# 03 — Institutional Requirements Document (IRD)

## 1. Purpose & Organizational Context
The **Institutional Requirements Document (IRD)** defines the governance, regulatory compliance, organizational hierarchy, data integrity standards, and operational mandates required for deploying EduPredict within university and college environments.

---

## 2. Institutional Hierarchy & Organizational Structure

EduPredict models university governance through a strict four-tier organizational hierarchy:

```
┌────────────────────────────────────────────────────────┐
│               UNIVERSITY / INSTITUTION                 │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      [ DEPARTMENT A ]            [ DEPARTMENT B ]
     (e.g., Computer Sci)        (e.g., Electronics)
              │                           │
       ┌──────┴──────┐             ┌──────┴──────┐
       ▼             ▼             ▼             ▼
   [ BATCH 2024 ] [ BATCH 2025 ] [ BATCH 2024 ] [ BATCH 2025 ]
       │             │             │             │
   [ STUDENTS ]   [ STUDENTS ]   [ STUDENTS ]   [ STUDENTS ]
```

### 2.1 Department Management
- Each department is defined by a unique Name, unique Code (e.g., `CSE`, `ECE`, `MECH`), and an assigned Head of Department (HOD user reference).
- Courses and academic programs are strictly mapped to their owning departments.

### 2.2 Academic Years & Cohort Batches
- **Academic Years**: Defined with Start Date, End Date, and an Active status flag (e.g., `2025-2026`).
- **Batches**: Formed by combining an Academic Year and a Department (e.g., `CSE-2026-A`). Students belong to exactly one primary active batch.

---

## 3. Governance, Auditability & Compliance

### 3.1 Dual-Verification Policy for Academic Records
To prevent student grade falsification or resume exaggeration:
1. **Student Entry**: Students enter self-reported metrics and upload documentary proof (PDF transcripts, certificates).
2. **Faculty Verification**: Academic metrics (CGPA, 10th/12th percentages, certifications) remain in a `pending` status until an assigned department faculty member reviews the document and marks it `verified`.
3. **Immutability of Verified Data**: Once a teacher verifies a student record, the student cannot alter the values without requesting an administrative reset.
4. **Prediction Gatekeeper**: The machine learning placement prediction engine will ONLY process profiles that have attained a minimum verification threshold.

### 3.2 Audit Logging Requirements
All critical administrative and evaluation events must generate immutable audit log records:
- User login / authentication events (IP, timestamp, user agent).
- Document verification, rejection, and reassessment actions.
- Assessment score publishing and regrading events.
- Role modifications and user account status transitions.

---

## 4. Role Hierarchy & Access Boundaries

| Role | Operational Scope | Administrative Boundaries |
| :--- | :--- | :--- |
| **Admin** | System-Wide | Full access to create departments, assign faculty, manage user accounts, view institutional analytics, configure placement drives. |
| **Teacher** | Departmental / Assigned Cohort | Access restricted to assigned students. Can author assessments, evaluate submissions, verify documents, and view class-level analytics. |
| **Student** | Self Profile | Access strictly isolated to own academic record, assigned assessments, coding challenges, resume tools, and public job drives. |

---

## 5. Placement Cell & Corporate Drive Mandates

### 5.1 Corporate Recruitment Drive Criteria
The placement cell requires deterministic filtering mechanisms for campus recruitment drives:
- Minimum CGPA cutoff filter.
- Maximum allowable standing backlogs filter (e.g., `0 backlogs`).
- 10th and 12th standard minimum percentage thresholds.
- Mandatory skill prerequisites (e.g., `Python`, `SQL`).
- Assessment score cutoffs (minimum aptitude and coding performance).

### 5.2 Shortlist Integrity
- Only students whose academic records and documents are marked `verified` by department faculty can be included in official corporate shortlist exports.
- Shortlist rosters must be exportable in standard CSV and formatted PDF reports for corporate recruiters.
