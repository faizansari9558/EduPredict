# 19 — Dashboard Analytics & At-Risk Early Warning Engine

## 1. Analytics Architecture Overview

The EduPredict Analytics Engine aggregates academic marks, aptitude test attempts, and coding challenge results to generate real-time metrics across all institutional tiers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ANALYTICS DATA PIPELINE ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ RAW TRANSACTIONAL DATA ]                                                 │
│  • `students` (CGPA, 10th/12th, Backlogs)                                   │
│  • `student_assessment_responses` (Aptitude scores)                        │
│  • `coding_submissions` (Code pass rates, runtime ms)                       │
│                                                                             │
│                                    ▼                                        │
│  [ STORED PROCEDURES & TRIGGERS ] ──► `sp_recalculate_student_metrics()`    │
│                                   ──► `sp_detect_at_risk_students()`        │
│                                                                             │
│                                    ▼                                        │
│  [ PRECOMPUTED CACHED METRICS TABLES ]                                      │
│  • `student_metrics`      • `skill_proficiency`                             │
│  • `department_metrics`   • `at_risk_students`                              │
│                                                                             │
│                                    ▼                                        │
│  [ 8 ANALYTICAL MATERIALIZED VIEWS ]                                        │
│  • `vw_department_performance`     • `vw_student_cohort_comparison`         │
│  • `vw_batch_performance`          • `vw_at_risk_summary`                   │
│  • `vw_skill_distribution`         • `vw_teacher_class_analytics`           │
│  • `vw_assessment_quality`         • `vw_system_analytics`                  │
│                                                                             │
│                                    ▼                                        │
│  [ REST API ENDPOINTS (`/api/analytics/*`) ] ──► [ INTERACTIVE UI CHARTS ]  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Analytics Metric Formulations

### 2.1 Student-Level Metrics
- **Overall Score Formula**:
  $$\text{Overall Score} = (0.40 \times \text{Aptitude Score}) + (0.40 \times \text{Coding Score}) + (0.20 \times \text{Normalized CGPA})$$
- **Placement Readiness Score**:
  $$\text{Readiness Score} = (0.35 \times \text{Overall Score}) + (0.25 \times \text{Profile Completion \%}) + (0.40 \times \text{ML Placement Probability})$$
- **Cohort Percentile**:
  $$\text{Percentile} = \left( \frac{\text{Count of Batch Peers with Score} < \text{Student Score}}{\text{Total Batch Students}} \right) \times 100$$

### 2.2 Skill Proficiency Breakdown
Evaluates competency percentage across key categories:
- Data Structures & Algorithms (DSA)
- Quantitative Aptitude
- Logical Reasoning & Verbal Ability
- Database Systems & SQL
- Web Development & Core CS

---

## 3. At-Risk Student Detection Algorithm

The system runs an automated multi-factor risk detection procedure (`sp_detect_at_risk_students`) evaluating four primary risk indicators:

| Risk Factor | Trigger Condition | Assigned Weight |
| :--- | :--- | :---: |
| **Low CGPA** | Undergraduate $\text{CGPA} < 6.00$ | 30 Points |
| **Standing Backlogs** | $\text{Active Backlogs} \ge 2$ | 30 Points |
| **Low Assessment Score** | Average Assessment $\text{Score} < 40.0\%$ | 25 Points |
| **Incomplete Profile** | $\text{Profile Completion} < 50.0\%$ | 15 Points |

### Risk Level Classification:
- **High Risk**: Risk Score $\ge 60$ Points $\rightarrow$ Immediate faculty intervention alert.
- **Moderate Risk**: Risk Score $35 - 59$ Points $\rightarrow$ Recommended remedial practice.
- **Low Risk / Safe**: Risk Score $< 35$ Points $\rightarrow$ On track for placement readiness.

---

## 4. Analytical Views Specification

1. **`vw_department_performance`**: Aggregates average CGPA, aptitude score, coding score, and placement-ready count per department.
2. **`vw_batch_performance`**: Compares academic performance across batches within each department.
3. **`vw_skill_distribution`**: Displays student skill proficiency quartiles by category.
4. **`vw_assessment_quality`**: Calculates average question difficulty and discrimination index for tests.
5. **`vw_student_cohort_comparison`**: Compares individual student metrics against the cohort mean and standard deviation.
6. **`vw_at_risk_summary`**: Provides faculty with a filtered roster of all active at-risk cases.
7. **`vw_teacher_class_analytics`**: Summary table for assigned faculty showing pass rates and score ranges.
8. **`vw_system_analytics`**: Executive dashboard metrics for administrators and placement directors.
