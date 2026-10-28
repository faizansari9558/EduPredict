# 11 — Low-Level Design (LLD)

## 1. Backend Design Patterns & Layered Architecture

EduPredict follows a strict **Controller-Service-Repository** pattern within the Express.js application tier.

```
┌────────────────────────────────────────────────────────┐
│                   HTTP REQUEST / JSON                  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER                     │
│  • CORS & Rate Limiter (`express-rate-limit`)          │
│  • Authentication & JWT Verifier (`middleware/auth.js`) │
│  • Multipart File Validation (`multer`)                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   CONTROLLER LAYER                     │
│  • Input Validation & HTTP Status Codes                │
│  • Request Parameter Parsing & Response Formatting     │
│  • e.g. `authController.js`, `codingController.js`     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                       │
│  • Business Rules & Multi-Entity Orchestration         │
│  • e.g. `mlService.js`, `resumeService.js`             │
│  • Isolated Sandboxing & Algorithmic Scoring           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               DATA ACCESS / POOL LAYER                 │
│  • Parameterized Prepared Statements (`config/db.js`)  │
│  • MySQL Connection Pool & Transaction Management      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Core Controller Specifications

### 2.1 `authController.js`
- `register(req, res)`: Validates body, hashes password with `bcrypt.hash(password, 10)`, creates user record, and provisions role-specific profile row (`students`, `teachers`, `admins`).
- `login(req, res)`: Looks up user by email, verifies status, executes `bcrypt.compare()`, generates JWT via `jwt.sign()`, and returns token with sanitized user payload.

### 2.2 `assessmentController.js`
- `createAssessment()`: Creates draft assessment in `assessments` table.
- `addQuestion()`: Inserts question with options JSON and correct key.
- `publishAssessment()`: Validates that question count $\ge 1$ and updates `published_at`.
- `submitAssessment()`: Computes total score from `student_assessment_responses` and updates attempt status to `submitted`.

### 2.3 `codingController.js`
- `runInteractiveCode(req, res)`: Executes code inside a restricted context:
  ```javascript
  const vm = require('vm');
  const context = { input: testcase.input, output: null, console: customConsole };
  vm.createContext(context);
  vm.runInContext(userScript, context, { timeout: 5000 });
  ```
- `submitCodingSolution(req, res)`: Runs against all hidden test cases, records per-test execution time/memory, computes pass percentage (0–100%), and writes to `coding_submissions` and `coding_results`.

---

## 3. Middleware Pipeline

```javascript
// Global Application Middleware Flow (backend/app.js)
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Route-level Security Guard Pattern
const { authenticateToken, requireRole } = require('./middleware/auth');

router.get('/admin/overview', authenticateToken, requireRole('admin'), adminController.getOverview);
router.post('/assessments', authenticateToken, requireRole('teacher'), assessmentController.createAssessment);
router.post('/coding/:problemId/submit', authenticateToken, requireRole('student'), codingController.submitSolution);
```

---

## 4. Frontend Component Architecture

### 4.1 State Management & Context API
- **`AuthContext.jsx`**: Global authentication provider managing `user` state, JWT persistence in `localStorage`, role decoding, and automatic redirection on session expiry.

### 4.2 Route Protection (`ProtectedRoute.jsx`)
- Inspects `user` from `AuthContext`.
- If unauthenticated $\rightarrow$ redirects to `/login`.
- If user's role is not within `allowedRoles` $\rightarrow$ redirects to unauthorized dashboard.

---

## 5. Coding Sandbox Execution Logic

```
┌────────────────────────────────────────────────────────┐
│                   STUDENT CODE PAYLOAD                 │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      [ JAVASCRIPT ]              [ PYTHON / C++ / JAVA ]
              │                           │
              ▼                           ▼
   [ V8 VM Context Engine ]      [ Safe Runtime Evaluator ]
   • Isolated Execution Scope    • Memory / Runtime Measurement
   • 5000ms Hard Timeout         • Output Assertion Matcher
   • Memory Cap Enforcement      • Syntax & Error Diagnostics
              │                           │
              └─────────────┬─────────────┘
                            ▼
           [ AGGREGATE TESTCASE RESULTS ]
           • Passed / Failed Count
           • Average Runtime (ms) & Peak RAM (MB)
           • Grade Calculation (Score %: 0–100)
```
