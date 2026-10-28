# 25 — Testing Strategy & Deployment Orchestration

## 1. Testing Strategy & Test Suites

EduPredict enforces a multi-tier testing strategy covering unit tests, integration tests, end-to-end (E2E) user journey scenarios, and automated ML inference benchmarks.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TESTING PYRAMID STRUCTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                     / \                                                     │
│                    /   \      [ MASTER E2E SUITE ] (28 Test Cases)          │
│                   / E2E \     • `backend/tests/test_all_features_e2e.js`    │
│                  /───────\                                                  │
│                 /         \   [ INTEGRATION API SUITES ]                    │
│                / Integrat. \  • `backend/tests/test_all_analytics_endpoints`│
│               /─────────────\ • `backend/tests/test_prediction_api.js`      │
│              /               \                                              │
│             /   UNIT & ML     \ [ UNIT & ML TEST HARNESSES ]                │
│            /───────────────────\ • `ml/tests/test_api.py` (FastAPI Tests)   │
│                                 • `backend/tests/adminController.test.js`   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Test Execution Commands

### 2.1 Run Master E2E Test Suite (28 Test Cases)
```bash
node backend/tests/test_all_features_e2e.js
```
Validates:
- User registration, JWT login, and RBAC authorization.
- Admin department, batch, and user administration.
- Teacher student management, document verification, and assessment creation.
- Student profile updates, document uploads, and quiz/coding attempts.
- Analytics endpoints, ML prediction pipeline, and campus job drives.

### 2.2 Run Analytics Integration Test Suite (13 Endpoints)
```bash
node backend/tests/test_all_analytics_endpoints.js
```

### 2.3 Run FastAPI ML Microservice PyTest Suite
```bash
python -m pytest ml/tests/test_api.py -v
```

### 2.4 Run Frontend Production Build Validation
```bash
cd frontend && npm run build
cd ../stitch && npm run build
```

---

## 3. Local Development Orchestration

### 3.1 One-Click Launch (Windows Batch / PowerShell)
- **Start All Services**: Run `start.bat` or `start-stitch.bat` at root.
- **Stop All Services**: Run `stop.bat` at root.

### 3.2 Service Port Map:
| Service | Local URL | Port | Process Command |
| :--- | :--- | :---: | :--- |
| **Frontend (Main)** | `http://127.0.0.1:3000` | 3000 | `npm --prefix frontend run dev` |
| **Frontend (Stitch UI)**| `http://127.0.0.1:3001` | 3001 | `npm --prefix stitch run dev` |
| **Backend Express API**| `http://127.0.0.1:5000` | 5000 | `node backend/server.js` |
| **FastAPI ML Microservice**| `http://127.0.0.1:8000` | 8000 | `python -m uvicorn ml.app:app --port 8000` |
| **MySQL Database** | `127.0.0.1:3306` | 3306 | Standard MySQL Daemon |

---

## 4. Production Docker Compose Deployment

The entire multi-container stack is fully containerized via `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: edupredict-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: EduPredict
    ports:
      - "3306:3306"
    volumes:
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql

  ml:
    build:
      context: ./ml
      dockerfile: Dockerfile
    container_name: edupredict-ml
    ports:
      - "8000:8000"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: edupredict-backend
    ports:
      - "5000:5000"
    depends_on:
      - mysql
      - ml

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: edupredict-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### Production Deployment Command:
```bash
docker-compose up --build -d
```
