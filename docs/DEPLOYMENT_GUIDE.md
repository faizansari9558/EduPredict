# EduPredict Full System Architecture & Deployment Guide

## Overview

EduPredict is an AI-powered Student Academic & Placement Readiness Intelligence Platform.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       COMPLETE EDUPREDICT ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [Vite + React 18 SPA]                (Port 3000 / Port 80)                │
│            │                                                                │
│            ▼                                                                │
│   [Node.js Express Backend API]        (Port 5000)                          │
│     ├── Auth & RBAC (Admin, Teacher, Student)                               │
│     ├── Assessment & Coding Engine                                          │
│     ├── Analytics & At-Risk Engine                                          │
│     ├── Resume AI & ATS Analyzer                                            │
│     ├── Generative AI Career Copilot                                        │
│     ├── Notification Center & Real-time Alerts                              │
│     └── Reports & Placement Scorecards Export                               │
│            │                                                                │
│            ├──────────────────────────────────────────┐                     │
│            ▼                                          ▼                     │
│   [MySQL / MariaDB Relational Database]   [FastAPI ML Microservice]         │
│   (Port 3306)                             (Port 8000)                       │
│     • Users, Students, Teachers             • Logistic Regression (89.8% AUC│
│     • Assessments & Coding Arena            • Multi-Model Comparison Engine │
│     • Analytics Views & Stored Procedures   • AI Explainability & Drivers   │
│     • Notifications & Credentials           • Cohort Batch Forecasting      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Quick Start (Local Development)

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- MySQL >= 8.0 or MariaDB

### One-Click Launch (Windows PowerShell)
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-all.ps1
```

### One-Click Launch (Linux / macOS)
```bash
chmod +x ./scripts/start-all.sh
./scripts/start-all.sh
```

---

## 2. Docker Compose Deployment

Run the complete multi-container stack with a single command:

```bash
docker-compose up --build -d
```

### Services Deployed:
| Service | Container Name | Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `edupredict-frontend` | `3000` | Nginx serving React production bundle |
| **Backend** | `edupredict-backend` | `5000` | Node.js Express REST API |
| **ML Engine** | `edupredict-ml` | `8000` | FastAPI Machine Learning Microservice |
| **Database** | `edupredict-mysql` | `3306` | MySQL 8.0 with initialized schema & seeds |

---

## 3. Verification & Testing

### Run Master E2E Test Suite (24 Test Cases across all Phases)
```bash
node backend/tests/test_all_features_e2e.js
```

### Run Python ML Microservice Tests
```bash
python -m pytest ml/tests/test_api.py
```

### Run Frontend Production Build
```bash
cd frontend && npm run build
```
