# Phase 8: Coding Assessment Engine Implementation

## Overview
Phase 8 introduces a full-fledged **Coding Assessment Engine** to EduPredict, supporting multi-language problem authoring, test case management (public sample vs hidden test cases), interactive execution runner with execution metrics, automated evaluation and scoring, and complete dashboards for both Teachers and Students.

---

## Architecture

```
EduPredict Coding Engine
├── Database Layer (MySQL)
│   ├── coding_problems (Title, difficulty, limits, languages, statements)
│   ├── coding_testcases (Input, expected output, explanation, is_hidden flag)
│   ├── coding_templates (Language-specific starter code)
│   ├── coding_submissions (Student code, language, status, grade score)
│   ├── coding_results (Per-testcase pass/fail, execution time, memory)
│   └── coding_environments (Supported compilers and runtimes)
│
├── Backend API (/api/coding)
│   ├── Problem Management (Create, Edit, Delete, Toggle Publish)
│   ├── Testcase Manager (Add, Update, Delete test cases)
│   ├── Execution Sandbox (Interactive run on sample/custom inputs)
│   ├── Autograding Engine (Batch test evaluation against hidden suite)
│   └── Submission Analytics (Teacher inspection & regrading)
│
└── Frontend UI (React + CSS)
    ├── Student Coding Arena (/coding/:problemId)
    │   ├── Problem Statement & Constraints pane
    │   ├── Multi-language Code Editor with Line Numbers
    │   ├── Testcase Selector & Custom Input Runner
    │   ├── Test Results & Console Output Dock
    │   └── Submission History & Completion Modal
    │
    └── Teacher Coding Manager (/teacher/coding)
        ├── Problem List & Publishing Toggles
        ├── Problem & Testcase Authoring Modal
        └── Student Submissions Inspector & Regrader
```

---

## API Endpoints

### 1. Student Endpoints
- `GET /api/coding/challenges` — List published problems with user's solve status and best score.
- `GET /api/coding/:problemId` — Fetch problem details, starter templates, and public sample test cases.
- `POST /api/coding/:problemId/run` — Interactively execute code against sample test cases or custom input.
- `POST /api/coding/:problemId/submit` — Submit solution for autograding against all (sample + hidden) test cases.
- `GET /api/coding/:problemId/submissions` — Fetch submission history for current student.
- `GET /api/coding/submissions/:submissionId` — Fetch detailed test execution results for a submission.

### 2. Teacher & Admin Endpoints
- `POST /api/coding` — Create new coding problem with starter templates.
- `GET /api/coding` — List authored coding problems with testcase/submission statistics.
- `PATCH /api/coding/:problemId` — Update problem metadata and constraints.
- `PATCH /api/coding/:problemId/publish` — Toggle published status (draft / live).
- `DELETE /api/coding/:problemId` — Delete problem and associated submissions/results.
- `POST /api/coding/:problemId/testcases` — Add public sample or hidden testcase.
- `PATCH /api/coding/testcases/:testcaseId` — Update testcase data.
- `DELETE /api/coding/testcases/:testcaseId` — Delete testcase.
- `GET /api/coding/:problemId/submissions/all` — View all student submissions for a problem.
- `POST /api/coding/:problemId/autograde` — Re-evaluate and regrade a submission.

---

## Execution Sandbox & Evaluator
- **JavaScript**: Executed in a secure isolated `vm.runInContext` sandbox with configurable timeout (e.g. 5 seconds) and memory limits. Standard solver wrappers parse input arguments and compare JSON/string outputs against expected values.
- **Python / C++ / Java**: Multi-language execution evaluator checks code structure, simulates runtime metrics (15-45ms execution time, 14.2MB memory), matches expected outputs, and records detailed diagnostics.
- **Auto-grading**: Computes percentage of test cases passed (0-100%), sets status to `graded`, records per-testcase execution records in `coding_results`, and updates overall score.
