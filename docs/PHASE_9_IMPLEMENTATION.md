# Phase 9: Analytics & Performance Dashboards

## Overview
Phase 9 introduces comprehensive analytics and performance tracking across the EduPredict platform. This phase provides meaningful insights for Students, Teachers, Admins, and Department heads to monitor academic progress, identify at-risk students, and drive data-informed decision-making.

---

## Architecture

```
EduPredict Analytics System
├── Database Layer (MySQL)
│   ├── Aggregate queries for assessment performance
│   ├── Student performance metrics (aptitude, coding scores)
│   ├── Department performance aggregates
│   ├── Skill-gap analysis views
│   └── At-risk student detection queries
│
├── Backend API (/api/analytics)
│   ├── Student Analytics Endpoints
│   │   ├── GET /api/analytics/student/:studentId - Personal performance metrics
│   │   ├── GET /api/analytics/student/:studentId/assessments - Assessment history & trends
│   │   ├── GET /api/analytics/student/:studentId/skills - Skill proficiency analysis
│   │   └── GET /api/analytics/student/:studentId/weaknesses - Identified gaps
│   │
│   ├── Teacher Analytics Endpoints
│   │   ├── GET /api/analytics/teacher/:teacherId - Assigned students performance
│   │   ├── GET /api/analytics/teacher/:teacherId/students - Class-level metrics
│   │   ├── GET /api/analytics/teacher/:teacherId/assessments - Assessment analytics
│   │   └── GET /api/analytics/teacher/:teacherId/at-risk - At-risk student detection
│   │
│   ├── Department Analytics Endpoints
│   │   ├── GET /api/analytics/department/:deptId - Department-wide metrics
│   │   ├── GET /api/analytics/department/:deptId/cohorts - Batch/cohort comparison
│   │   ├── GET /api/analytics/department/:deptId/skills - Skill distribution
│   │   └── GET /api/analytics/department/:deptId/trends - Performance trends
│   │
│   └── Admin Analytics Endpoints
│       ├── GET /api/analytics/admin/system - System-wide overview
│       ├── GET /api/analytics/admin/departments - All department metrics
│       └── GET /api/analytics/admin/placements - Placement readiness stats
│
└── Frontend UI (React + Chart Library)
    ├── Student Analytics Dashboard (/analytics/student)
    │   ├── Performance overview card
    │   ├── Assessment score trends chart
    │   ├── Skill proficiency radar chart
    │   ├── Weaknesses & recommendations panel
    │   └── Performance compared to cohort
    │
    ├── Teacher Analytics Dashboard (/analytics/teacher)
    │   ├── Assigned students performance summary
    │   ├── Class average vs individual scores
    │   ├── Question difficulty analysis
    │   ├── At-risk student alerts
    │   └── Question performance heatmap
    │
    ├── Department Analytics Dashboard (/analytics/department)
    │   ├── Department metrics overview
    │   ├── Batch performance comparison chart
    │   ├── Skill distribution across batches
    │   ├── Performance trends over semesters
    │   └── Placement readiness gauge
    │
    └── Admin Analytics Dashboard (/analytics/admin)
        ├── System-wide key metrics
        ├── Department performance comparison
        ├── User activity timeline
        ├── Assessment coverage by department
        └── Placement funnel analysis
```

---

## Analytics Metrics

### Student-Level Metrics
- **Overall Score**: Weighted average of aptitude + coding assessments
- **Assessment Performance**: Score trends across multiple assessments
- **Skill Proficiency**: Performance by question category/topic
- **Strengths**: Top 3 question categories by score
- **Weaknesses**: Bottom 3 question categories by score
- **Progress Tracking**: Score improvement over time
- **Placement Readiness Score**: Based on assessments and verified profile
- **Cohort Ranking**: Performance percentile within batch

### Teacher-Level Metrics
- **Class Average Score**: Mean score of assigned students
- **Score Distribution**: Standard deviation and quartile breakdown
- **At-Risk Students**: Students scoring below 40th percentile
- **High Performers**: Students scoring above 80th percentile
- **Assessment Analytics**:
  - Question difficulty calibration (expected vs actual performance)
  - Question discrimination index (ability to differentiate students)
  - Answer choice analysis (for MCQs)
- **Student Engagement**: Assessment attempt rate, time-to-complete

### Department Metrics
- **Department Average Score**: Aggregate performance across all students
- **Batch Comparison**: Performance comparison between batches
- **Skill Distribution**: Proficiency heatmap by skill across batches
- **Performance Trends**: Score trends over semesters/years
- **Placement Rate**: Percentage of students ready for placement
- **Department Ranking**: Comparison with other departments (if applicable)

### Admin Metrics
- **System Overview**:
  - Total assessments created and attempted
  - Total unique students and teachers
  - Average assessment completion rate
  - System health metrics
- **Department Rankings**: Comparative performance dashboard
- **User Activity**: Login trends, assessment activity timeline
- **Data Quality**: Profile completion rates by department/batch

---

## Database Schema (Phase 9)

### New Tables/Views

#### 1. `student_metrics` (cached analytics)
```sql
CREATE TABLE student_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL UNIQUE,
  overall_score DECIMAL(5,2),
  aptitude_score DECIMAL(5,2),
  coding_score DECIMAL(5,2),
  assessment_attempts INT,
  assessment_passed INT,
  profile_completion_pct INT,
  placement_ready_score DECIMAL(5,2),
  cohort_percentile INT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (cohort_percentile),
  INDEX (overall_score)
);
```

#### 2. `skill_proficiency` (skill-based performance)
```sql
CREATE TABLE skill_proficiency (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  skill_category VARCHAR(100),
  avg_score DECIMAL(5,2),
  attempts INT,
  passed_count INT,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (student_id, skill_category),
  INDEX (avg_score)
);
```

#### 3. `at_risk_students` (tracking at-risk cohorts)
```sql
CREATE TABLE at_risk_students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  risk_score DECIMAL(5,2),
  risk_factors TEXT, -- JSON: {"low_assessment_score": true, "low_profile_completion": true}
  flagged_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  teacher_id INT,
  status ENUM('flagged', 'contacted', 'improved', 'resolved') DEFAULT 'flagged',
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  INDEX (risk_score),
  INDEX (status)
);
```

#### 4. Analytics Views (for efficient queries)
```sql
-- Department Performance View
CREATE VIEW department_performance AS
SELECT 
  d.id,
  d.name,
  COUNT(DISTINCT s.id) as student_count,
  AVG(sm.overall_score) as avg_score,
  STDDEV(sm.overall_score) as score_stddev,
  SUM(CASE WHEN sm.overall_score >= 60 THEN 1 ELSE 0 END) / COUNT(DISTINCT s.id) * 100 as pass_rate
FROM departments d
LEFT JOIN students s ON d.id = s.department_id
LEFT JOIN student_metrics sm ON s.user_id = sm.student_id
GROUP BY d.id, d.name;

-- Skill Performance View
CREATE VIEW skill_analytics AS
SELECT 
  a.created_by as teacher_id,
  ac.name as category,
  AVG(ar.score) as avg_score,
  COUNT(DISTINCT ar.student_id) as student_count,
  SUM(CASE WHEN ar.score >= 60 THEN 1 ELSE 0 END) / COUNT(*) * 100 as pass_rate
FROM assessments a
JOIN assessment_categories ac ON a.category_id = ac.id
JOIN assessment_responses ar ON a.id = ar.assessment_id
WHERE a.status = 'published'
GROUP BY a.created_by, ac.id, ac.name;
```

---

## API Endpoints

### Student Analytics

**1. Get Student Performance Overview**
```
GET /api/analytics/student/:studentId
Response: {
  overall_score: 72.5,
  aptitude_score: 75.0,
  coding_score: 70.0,
  assessment_attempts: 5,
  assessment_passed: 4,
  profile_completion_pct: 85,
  placement_ready_score: 68.5,
  cohort_percentile: 65,
  comparison_to_cohort: {
    your_score: 72.5,
    cohort_average: 68.0,
    percentile: 65
  }
}
```

**2. Get Assessment Performance Trends**
```
GET /api/analytics/student/:studentId/assessments
Response: {
  assessments: [
    { date, assessment_id, title, score, category, time_taken },
    ...
  ],
  trend: "improving" | "declining" | "stable",
  performance_by_category: { category: score, ... }
}
```

**3. Get Skill Proficiency**
```
GET /api/analytics/student/:studentId/skills
Response: {
  skills: [
    { skill: "Database Design", proficiency: 80, attempts: 5, passed: 4 },
    { skill: "Algorithm", proficiency: 65, attempts: 3, passed: 2 },
    ...
  ]
}
```

**4. Get Weaknesses & Recommendations**
```
GET /api/analytics/student/:studentId/weaknesses
Response: {
  weaknesses: [
    { skill: "Dynamic Programming", score: 45, recommendation: "Practice more..." },
    ...
  ],
  strengths: [
    { skill: "Database Design", score: 85 },
    ...
  ],
  recommended_focus_areas: ["Dynamic Programming", "Graph Algorithms"]
}
```

---

### Teacher Analytics

**1. Get Class Performance Summary**
```
GET /api/analytics/teacher/:teacherId/class-summary
Response: {
  assigned_students: 45,
  class_average: 68.5,
  class_median: 70.0,
  high_performers: 12,
  at_risk_students: 5,
  score_distribution: {
    "80-100": 8,
    "60-80": 25,
    "40-60": 10,
    "0-40": 2
  }
}
```

**2. Get At-Risk Students**
```
GET /api/analytics/teacher/:teacherId/at-risk
Response: {
  at_risk_students: [
    {
      student_id,
      name,
      overall_score: 35.0,
      risk_factors: ["low_assessment_score", "low_profile_completion"],
      risk_score: 85,
      last_assessment_date
    },
    ...
  ]
}
```

**3. Get Assessment Analytics**
```
GET /api/analytics/teacher/:teacherId/assessments/:assessmentId
Response: {
  assessment_title,
  total_attempts: 45,
  completion_rate: 92,
  average_score: 68.5,
  question_analytics: [
    {
      question_id,
      question_text,
      correct_count: 38,
      incorrect_count: 7,
      difficulty_index: 0.84,
      discrimination_index: 0.65
    },
    ...
  ]
}
```

---

### Department Analytics

**1. Get Department Overview**
```
GET /api/analytics/department/:departmentId
Response: {
  department_name,
  total_students: 150,
  avg_score: 70.2,
  score_stddev: 12.5,
  pass_rate: 78.5,
  placement_ready_count: 95,
  placement_ready_pct: 63.3
}
```

**2. Get Department Batch Comparison**
```
GET /api/analytics/department/:departmentId/batches
Response: {
  batches: [
    { year: 2023, avg_score: 72.5, student_count: 50, pass_rate: 82 },
    { year: 2024, avg_score: 68.0, student_count: 45, pass_rate: 75 },
    ...
  ]
}
```

**3. Get Skill Distribution**
```
GET /api/analytics/department/:departmentId/skills
Response: {
  skills: [
    { skill: "Database Design", proficient_count: 120, pct: 80 },
    { skill: "Algorithm", proficient_count: 95, pct: 63.3 },
    ...
  ]
}
```

---

### Admin Analytics

**1. Get System Overview**
```
GET /api/analytics/admin/system-overview
Response: {
  total_users: 500,
  total_students: 250,
  total_teachers: 50,
  total_departments: 10,
  total_assessments: 150,
  avg_system_score: 69.5,
  placement_ready_students: 125,
  placement_ready_pct: 50
}
```

**2. Get Department Comparative Metrics**
```
GET /api/analytics/admin/departments
Response: {
  departments: [
    {
      id, name,
      student_count, avg_score,
      pass_rate, placement_ready_pct,
      rank
    },
    ...
  ]
}
```

---

## Frontend Components

### Student Analytics Dashboard (`/analytics/student`)
```
┌─────────────────────────────────────────────────────┐
│ MY PERFORMANCE                                      │
├─────────────────────────────────────────────────────┤
│  Overall Score: 72.5  │  Percentile: 65th          │
│  Aptitude: 75.0       │  Coding: 70.0              │
│  Placement Ready: 68.5                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ASSESSMENT TRENDS (Line Chart)                      │
│ [Last 6 Assessment Scores over time]                │
└─────────────────────────────────────────────────────┘

┌─────────────────────┐  ┌───────────────────────────┐
│ SKILL PROFICIENCY   │  │ STRENGTHS & WEAKNESSES    │
│ (Radar Chart)       │  │ Top: Database Design 85   │
│ - DB Design: 80%    │  │ - Algorithms: 90          │
│ - Algorithms: 65%   │  │ Bottom: DP 45             │
│ - System Design: 72%│  │ - Graph Theory 52         │
│ - Web Dev: 68%      │  │                           │
└─────────────────────┘  └───────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ RECOMMENDATIONS                                     │
│ Focus on: Dynamic Programming, Graph Algorithms     │
│ Resources: [Link to study materials]                │
└─────────────────────────────────────────────────────┘
```

### Teacher Analytics Dashboard (`/analytics/teacher`)
```
┌─────────────────────────────────────────────────────┐
│ CLASS PERFORMANCE                                   │
│ Students: 45 │ Avg Score: 68.5 │ At-Risk: 5       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ SCORE DISTRIBUTION (Bar Chart)                      │
│ 80-100: 8 │ 60-80: 25 │ 40-60: 10 │ 0-40: 2       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ AT-RISK STUDENTS (Alert Table)                      │
│ Name     │ Score │ Risk Factors      │ Action       │
├─────────────────────────────────────────────────────┤
│ John Doe │ 35    │ Low Score, Missing │ Alert ▶     │
│ Jane     │ 38    │ Low Assessment    │ Contact ▶    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ASSESSMENT ANALYSIS (Question Performance)          │
│ Question | Correct | Difficulty | Discrimination    │
│ Q1       | 38/45   | 0.84       | 0.65              │
│ Q2       | 25/45   | 0.56       | 0.42              │
└─────────────────────────────────────────────────────┘
```

### Department Analytics Dashboard (`/analytics/department`)
```
┌─────────────────────────────────────────────────────┐
│ DEPARTMENT METRICS                                  │
│ Dept: CSE │ Students: 150 │ Avg Score: 70.2        │
│ Pass Rate: 78.5% │ Placement Ready: 63.3%           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ BATCH PERFORMANCE (Comparison Chart)                │
│ 2023: 72.5 │ 2024: 68.0 │ 2025: 71.5               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ SKILL DISTRIBUTION (Heatmap)                        │
│       2023   2024   2025                            │
│ DB    85%    78%    82%                             │
│ Algo  72%    65%    70%                             │
│ SD    68%    62%    66%                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ PERFORMANCE TRENDS (Line Chart)                     │
│ [Semester-wise average score trend]                 │
└─────────────────────────────────────────────────────┘
```

### Admin Analytics Dashboard (`/analytics/admin`)
```
┌──────────────────────────────────────────────────────────────┐
│ SYSTEM OVERVIEW                                              │
│ Users: 500 │ Students: 250 │ Teachers: 50 │ Depts: 10      │
│ Assessments: 150 │ Avg Score: 69.5 │ Placement Ready: 50%   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ DEPARTMENT RANKINGS (Table with sorting)                     │
│ Rank │ Dept Name │ Avg Score │ Pass% │ Placement Ready %    │
├──────────────────────────────────────────────────────────────┤
│ 1    │ CSE       │ 75.2      │ 85    │ 72                   │
│ 2    │ ECE       │ 72.1      │ 80    │ 68                   │
│ 3    │ Mech      │ 68.5      │ 75    │ 60                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ SYSTEM ACTIVITY (Timeline Chart)                             │
│ [User login trends, assessment activity by month]            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ DATA QUALITY (Profile Completion %)                          │
│ CSE: 85% │ ECE: 78% │ Mech: 72% │ Civil: 68%               │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 9a: Database & Backend Foundation (Week 1)
- [ ] Create analytics tables (`student_metrics`, `skill_proficiency`, `at_risk_students`)
- [ ] Write analytics views for efficient querying
- [ ] Implement student analytics endpoints
- [ ] Implement teacher analytics endpoints
- [ ] Implement department analytics endpoints
- [ ] Implement admin analytics endpoints
- [ ] Add data refresh/caching mechanism

### Phase 9b: Frontend - Student Analytics (Week 1-2)
- [ ] Create `/analytics/student` route
- [ ] Student Performance Overview component
- [ ] Assessment Trends chart component
- [ ] Skill Proficiency radar chart
- [ ] Strengths & Weaknesses panel
- [ ] Cohort comparison widget

### Phase 9c: Frontend - Teacher Analytics (Week 2)
- [ ] Create `/analytics/teacher` route
- [ ] Class Performance Summary component
- [ ] At-Risk Students alert table
- [ ] Assessment Analytics detailed view
- [ ] Score Distribution chart
- [ ] Question Performance heatmap

### Phase 9d: Frontend - Department & Admin Analytics (Week 2-3)
- [ ] Create `/analytics/department` route
- [ ] Department Performance Overview
- [ ] Batch Comparison chart
- [ ] Skill Distribution heatmap
- [ ] Create `/analytics/admin` route
- [ ] System Overview dashboard
- [ ] Department Rankings comparison
- [ ] System Activity timeline

### Phase 9e: At-Risk Student Detection & Alerts (Week 3)
- [ ] Implement at-risk detection algorithm
- [ ] Flag at-risk students in database
- [ ] Create alerts in teacher dashboard
- [ ] Send notifications to assigned teachers
- [ ] Track intervention status

### Phase 9f: Testing & Optimization (Week 3)
- [ ] Unit tests for analytics calculations
- [ ] Performance testing on large datasets
- [ ] Query optimization
- [ ] Cache invalidation strategy
- [ ] End-to-end analytics workflow testing

---

## Chart Library Recommendation

Use **Chart.js** or **Recharts** (React component library):

```
Chart.js:
- Lightweight, versatile
- Good for line, bar, pie, radar charts
- npm install chart.js react-chartjs-2

Recharts:
- React-first, declarative
- Responsive and composable
- npm install recharts

For this project, Recharts is recommended for React components.
```

---

## At-Risk Student Detection Algorithm

```javascript
// Risk Scoring Algorithm
function calculateRiskScore(student) {
  let riskFactors = [];
  let score = 0;

  // Factor 1: Assessment Performance (40 points)
  if (student.overallScore < 40) {
    riskFactors.push("low_assessment_score");
    score += 40;
  } else if (student.overallScore < 50) {
    riskFactors.push("borderline_assessment_score");
    score += 20;
  }

  // Factor 2: Profile Completion (20 points)
  if (student.profileCompletionPct < 50) {
    riskFactors.push("low_profile_completion");
    score += 20;
  } else if (student.profileCompletionPct < 70) {
    riskFactors.push("incomplete_profile");
    score += 10;
  }

  // Factor 3: Engagement (20 points)
  if (student.assessmentAttempts < 2) {
    riskFactors.push("low_engagement");
    score += 20;
  }

  // Factor 4: Negative Trend (20 points)
  if (student.performanceTrend === "declining") {
    riskFactors.push("declining_performance");
    score += 20;
  }

  return { score, riskFactors }; // Risk Score: 0-100
}

// Flag students with score >= 50 as at-risk
```

---

## Performance Optimization

1. **Caching Strategy**:
   - Cache `student_metrics` with 1-hour TTL
   - Refresh on assessment submission
   - Batch update at end-of-day

2. **Query Optimization**:
   - Use indexed columns (cohort_percentile, overall_score, risk_score)
   - Aggregate queries use views, not raw joins
   - Pagination for large result sets (100 records per page)

3. **Frontend Optimization**:
   - Lazy-load charts using React.lazy()
   - Memoize component calculations
   - Virtual scrolling for large tables

---

## Success Criteria

- ✅ All analytics endpoints operational and tested
- ✅ Student can view personal performance metrics and trends
- ✅ Teacher can identify at-risk students and class performance
- ✅ Department head can compare batch performance
- ✅ Admin has system-wide visibility into all metrics
- ✅ Charts render correctly on desktop, tablet, mobile
- ✅ At-risk detection flags students accurately
- ✅ Analytics data refreshes within 5 minutes of new assessments
- ✅ All dashboards load within 2 seconds

---

## Next Steps (After Phase 9)

1. **Phase 10**: ML Pipeline & Model Training
2. **Phase 11**: FastAPI ML Service
3. **Phase 12**: AI Explainability & Recommendations
4. **Phase 13**: Resume AI
5. **Phase 14**: Generative AI Career Assistant
6. **Phase 15**: Notifications System
7. **Phase 16**: Reports & Export
8. **Phase 17**: Security & Testing
9. **Phase 18**: Deployment

---

**Status:** Implementation plan created. Ready for Phase 9a (Database & Backend).
