# EduPredict Architecture

## 1. Architecture Overview

EduPredict follows a modular web application architecture with a React frontend, Node.js/Express backend, MySQL relational database, and a separate Python ML pipeline.

### High-level Architecture

```text
Browser / Mobile UI
        │
        ▼
React Frontend
        │
        ▼
Node.js + Express API
        │   ├── Auth & RBAC
        │   ├── Student/Teacher/Admin Modules
        │   ├── Assessment APIs
        │   ├── File Upload Services
        │   └── ML Service Integration
        │
        ├───────────────┬───────────────┐
        │               │               │
        ▼               ▼               ▼
MySQL Database   Python ML API   File Storage
                    (FastAPI later)  (uploads)
```

## 2. Core Components

### Frontend
- React application for all user roles
- Routing with role-based dashboard entry points
- Reusable UI components and responsive layouts
- Forms for registration, login, profile completion, and assessment interactions

### Backend
- Express.js server for REST APIs
- JWT-powered authentication
- Role-based authorization enforcement
- Controllers, services, middleware, and utility modules
- Validation and secure file handling

### Database
- MySQL for relational institutional data
- Entities such as users, roles, departments, courses, assessments, documents, results, predictions, and audit logs
- Foreign key constraints and indexing for efficient querying

### ML Service
- Python-based training and prediction environment
- Feature preprocessing and model comparison
- Later integration with FastAPI for internal prediction API

### File Storage
- Local upload directory during development
- Access controlled by user and verification rules

## 3. How Components Interact

1. User logs in via the React frontend.
2. Frontend sends requests to the Express API with JWT tokens.
3. Backend validates input and applies RBAC checks.
4. Backend interacts with MySQL for user and institutional data.
5. Student uploads and verification data are stored in the file system or upload service.
6. Approved student data feeds ML training and prediction workflows.
7. Prediction results are returned to the frontend and shown only after verification rules are satisfied.

## 4. Folder and File Structure

```text
EduPredict/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── ml/
│   ├── datasets/
│   ├── models/
│   ├── notebooks/
│   ├── api/
│   ├── requirements.txt
│   ├── README.md
│   └── scripts/
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── rules.md
│   ├── phases.md
│   ├── design.md
│   ├── memory.md
│   └── PROJECT_ROADMAP.md
├── .env.example
├── .gitignore
├── README.md
└── .vscode/
```

## 5. Tech Stack

### Frontend
- React.js
- React Router
- Axios
- CSS Modules / custom CSS / component styling
- Charting library when analytics are introduced

### Backend
- Node.js
- Express.js
- JWT
- bcrypt
- Multer for file uploads
- MySQL2 / Sequelize or direct SQL queries
- Validation libraries

### Database
- MySQL
- phpMyAdmin for local management

### ML / Data Science
- Python
- Pandas
- NumPy
- scikit-learn
- XGBoost
- Matplotlib

### AI / Later Enhancements
- FastAPI for internal ML service
- Generative AI integration after core system stability

## 6. Design Principles

- Keep frontend and backend responsibilities separated
- Enforce authorization in backend APIs, not only UI
- Avoid duplicate implementations across modules
- Prefer relational modeling for all institutional data
- Ensure verified data is required before predictions are displayed
- Keep ML logic separate from application business logic

## 7. Security Architecture

- Token-based auth
- Password hashing with bcrypt
- Strict RBAC checks
- Input validation and sanitization
- Rate-limiting where needed
- Secure file handling and ownership validation
- No hardcoded secrets
- Prevent direct execution of student code in the Node.js application server
