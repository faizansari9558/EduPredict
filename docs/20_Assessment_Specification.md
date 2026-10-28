# 20 — Aptitude Assessment Engine Specification

## 1. Assessment Engine Architecture & Workflow

The Aptitude Assessment Engine provides a complete testing pipeline for creating, scheduling, delivering, and automatically grading standardized tests.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       APTITUDE ASSESSMENT LIFECYCLE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ TEACHER AUTHORING ] ──► Create Assessment Header (Duration, Marks)       │
│                        ──► Add Questions from Question Bank or Custom Input  │
│                        ──► Publish Assessment (`is_published = 1`)          │
│                                                                             │
│                                    ▼                                        │
│  [ STUDENT TEST RUNNER ] ──► Initialize Attempt (`POST /assessments/:id/sta│
│                          ──► Timed Interactive Quiz UI with Question Palette│
│                          ──► Real-time Answer Persist per Question          │
│                          ──► Auto-Submit on Timer Expiration                │
│                                                                             │
│                                    ▼                                        │
│  [ GRADING & RESULTS ] ──► Exact Key Match Evaluation                       │
│                        ──► Store Score in `assessment_attempts`             │
│                        ──► Update `student_metrics` Cache Table             │
│                        ──► Teacher Result & Discrimination Analytics        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Assessment Builder Specifications (Teacher Portal)

### 2.1 Test Header Configuration
- **Title**: Required test title (e.g., "Campus Aptitude Mock Exam 2026").
- **Description**: Optional syllabus or instructional guidelines.
- **Assessment Type**: `aptitude`, `technical`, `general`.
- **Duration**: Duration in minutes (default: 60 mins).
- **Total Marks**: Configurable max points (default: 100).
- **Publishing Safeguard**: Cannot publish unless test contains at least 1 validated question.

### 2.2 Question Authoring & Question Bank
- **Question Types**:
  - `MCQ` (Multiple Choice Question with 4 distinct options and single correct radio selection).
  - `Short Answer` / `Essay` (Categorical or qualitative response).
- **Difficulty Levels**: `easy` (1 mark), `medium` (2 marks), `hard` (3 marks).
- **Categories**: Quantitative Aptitude, Logical Reasoning, Verbal Ability, Technical Basics, Core CS.
- **Question Bank Integration**: Questions can be marked `is_from_bank = 1` and reused across multiple test headers.

---

## 3. Student Assessment Taker Specifications

### 3.1 Synchronized Countdown Timer
- Client starts a countdown timer on quiz load.
- Timer shifts visual color:
  - Normal state: Emerald Green ($> 10$ minutes remaining).
  - Warning state: Amber ($5 - 10$ minutes remaining).
  - Critical state: Crimson Red ($< 5$ minutes remaining).
- Automated Submission Trigger: When timer hits `00:00:00`, the application automatically submits current responses without requiring user interaction.

### 3.2 Question Navigation Palette
- Question grid with status color-coding:
  - **Gray**: Unvisited.
  - **Amber**: Visited but Unanswered.
  - **Green**: Answered & Saved.
- Next / Previous / Jump to Question buttons.

---

## 4. Scoring Algorithm & Result Publishing

$$\text{Final Score} = \sum_{i=1}^{N} \begin{cases} \text{Marks}(q_i), & \text{if Student Answer}(q_i) = \text{Correct Key}(q_i) \\ 0, & \text{otherwise} \end{cases}$$

$$\text{Percentage} = \left( \frac{\text{Final Score}}{\text{Total Assessment Marks}} \right) \times 100$$

- Individual student answers stored in `student_assessment_responses` table.
- Final attempt record marked `status = 'submitted'` with `submitted_at = NOW()`.
- Updates `student_metrics.aptitude_score` to feed the machine learning prediction pipeline.
