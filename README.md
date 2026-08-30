# EduPredict

EduPredict is a Smart Student Academic & Placement Prediction System designed to help universities track academic progress, verify student information, manage assessments, and generate placement insights using ML-driven analysis.

## Project Goal

The system supports a full workflow from student profile collection and document verification to assessment delivery, analytics, and placement prediction.

## Core Principles

- Student data is verified before it is used in predictive analysis.
- Teacher access is restricted to assigned students.
- Admin controls institution-wide structure and configuration.
- ML predictions are estimates, not guarantees.
- Generative AI is separated from predictive ML logic.

## Repository Structure

```text
EduPredict/
├── frontend/              # React application
├── backend/               # Express.js REST API
├── ml/                    # Python ML pipeline and model service
├── docs/                  # Project documentation
├── .env.example           # Environment template
├── .gitignore             # Ignore rules
├── README.md              # Project overview
└── .vscode/               # Editor-local settings
```

## Current Phase

Phase 0: Project audit and setup documentation.

## Phase Roadmap

1. Phase 0 - Project Audit & Environment Setup
2. Phase 1 - Frontend Foundation
3. Phase 2 - Database Design
4. Phase 3 - Authentication & Authorization
5. Phase 4 - Admin Module
6. Phase 5 - Teacher Module
7. Phase 6 - Student Module
8. Phase 7 - Aptitude Assessment
9. Phase 8 - Coding Assessment Engine
10. Phase 9 - Analytics
11. Phase 10 - ML
12. Phase 11 - FastAPI ML Service
13. Phase 12 - AI Explainability & Recommendations
14. Phase 13 - Resume AI
15. Phase 14 - Generative AI
16. Phase 15 - Notifications
17. Phase 16 - Reports
18. Phase 17 - Security & Testing
19. Phase 18 - Deployment

## Requirements

- Node.js 18+
- npm or pnpm
- Python 3.10+
- MySQL 8+
- Git
- VS Code

## Local Development

1. Install Node.js dependencies in the frontend and backend when the corresponding phase starts.
2. Configure MySQL and create the database named EduPredict.
3. Copy `.env.example` to `.env` and update credentials.
4. Start the backend and frontend locally.

## Important Notes

- This project is being built in phases and must not jump ahead.
- Authentication, dashboards, ML, coding engine, and AI features are intentionally deferred until the approved phase begins.
- No secrets should be committed to the repository.

