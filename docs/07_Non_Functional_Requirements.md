# 07 — Non-Functional Requirements (NFR)

## 1. Performance & Latency Targets

| Metric | Threshold / Target | Measurement Method |
| :--- | :--- | :--- |
| **Backend REST API Latency** | < 100 ms (p95) for standard CRUD requests | Load testing & telemetry |
| **FastAPI ML Inference Latency** | < 50 ms (p95) per student prediction | Async benchmark suite |
| **Coding Sandbox Execution Timeout** | Max 5,000 ms per test case | Hard timeout kill signal |
| **Database Query Execution Time** | < 30 ms for indexed transactional queries | MySQL Slow Query Log |
| **Frontend Initial Page Load** | < 1.5 seconds on standard broadband | Lighthouse performance audit |

---

## 2. Security & Compliance Requirements

### 2.1 Authentication & Credential Storage
- **Password Storage**: Passwords must be hashed using `bcrypt` with salt rounds $\ge 10$. Plain text passwords must never be persisted or logged.
- **Session Tokens**: JWT tokens signed using HMAC-SHA256 with strong secret keys stored in `.env`.
- **Token Invalidation**: Expired or malformed tokens must immediately yield HTTP 401 Unauthorized.

### 2.2 Injection Prevention & Input Sanitization
- **SQL Injection Prevention**: All MySQL interactions must utilize parameterized prepared statements via `mysql2/promise`. String concatenation of SQL queries is strictly prohibited.
- **Cross-Site Scripting (XSS)**: React JSX automatic HTML escaping must be preserved. Raw `dangerouslySetInnerHTML` is prohibited for user input.
- **Rate Limiting**: `express-rate-limit` must restrict API abuse with default window of 15 minutes and max 100 requests per IP address.

### 2.3 Execution Sandboxing & Code Isolation
- Student submitted code in the coding arena must execute inside isolated sandboxed contexts (Node.js `vm.runInContext` with strict sandbox context objects and timeouts).
- Direct spawning of unconstrained system subshells (`child_process.exec` on raw user strings) without validation is strictly banned.

### 2.4 File Upload Security
- Multer file handler must restrict uploads to verified MIME types (`application/pdf`, `image/png`, `image/jpeg`).
- File size must be capped at 5MB (`5242880 bytes`).
- Uploaded files must be saved with randomized unique filenames to prevent path traversal and file overwrites.

---

## 3. Reliability, Availability & Error Handling

### 3.1 Availability Standard
- Target uptime: 99.9% availability during campus academic operating hours.
- Automated health check endpoints (`/api/health` on Express and `/health` on FastAPI) must provide instant heartbeat telemetry.

### 3.2 Resilience & Graceful Degradation
- If the FastAPI ML microservice is temporarily offline, the Express backend must catch connection errors gracefully, logging the failure and providing a fallback rule-based readiness estimate without crashing user dashboards.
- Database connection pool must handle transient disconnects and automatically reconnect.

---

## 4. Scalability & Concurrency

### 4.1 Concurrent User Capacity
- The architecture must support at least 500 concurrent active student assessment takers without degradation of question delivery or timer synchronization.
- Analytical materialized views and cached metrics tables (`student_metrics`, `department_metrics`) must insulate the database from heavy aggregate computation spikes.

### 4.2 Database Optimization
- Foreign keys must be indexed across all tables (`users`, `students`, `assessments`, `submissions`).
- MySQL connection pool size: 10 connections per Node.js worker instance.

---

## 5. Maintainability & Code Standards
- **Separation of Concerns**: Strict separation between presentation (React SPA), API orchestration (Express), data layer (MySQL), and AI/ML (FastAPI).
- **Documentation**: All public endpoints documented with request/response schemas.
- **Testing**: Automated E2E test suites must validate complete user journeys across all roles.
