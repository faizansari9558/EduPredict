# 16 — Security Architecture & Threat Modeling

## 1. Security Overview & Threat Model (STRIDE)

EduPredict implements a multi-layered defense-in-depth security model protecting student records, faculty evaluations, and server infrastructure.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DEFENSE-IN-DEPTH SECURITY MODEL                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ LAYER 1: TRANSPORT & NETWORK ] ──► HTTPS / TLS 1.3, Strict CORS, RateLim │
│                                                                             │
│  [ LAYER 2: IDENTITY & AUTH ]      ──► Bcrypt (10 rounds), Signed 7d JWTs   │
│                                                                             │
│  [ LAYER 3: AUTHORIZATION (RBAC) ] ──► Middleware Boundary Guards per Role  │
│                                                                             │
│  [ LAYER 4: DATA INTEGRITY ]       ──► Parameterized SQL, 3NF ACID Schema   │
│                                                                             │
│  [ LAYER 5: EXECUTION ISOLATION ]  ──► Sandboxed VM Engine with Timers      │
│                                                                             │
│  [ LAYER 6: AUDIT & MONITORING ]   ──► Immutable Audit Logs & Telemetry     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. STRIDE Threat Analysis & Mitigations

| STRIDE Threat | Attack Vector / Scenario | EduPredict Security Control |
| :--- | :--- | :--- |
| **Spoofing** | Attacker attempts to forge user identity | JWT tokens signed with HMAC-SHA256 and secret keys stored in `.env`. Server verifies signature and claims on every protected request. |
| **Tampering** | Student alters grades or assessment scores in transit | All scoring and evaluation occurs server-side. API rejects client-supplied scores. Relational foreign key constraints enforce validity. |
| **Repudiation** | User denies uploading a document or grading a test | Centralized `audit_logs` table records user ID, action, entity type, target ID, metadata, and timestamp. |
| **Information Disclosure** | Unauthorized user accesses another student's transcripts | RBAC middleware ensures students can only query records where `user_id == req.user.id`. Teachers restricted to assigned department. |
| **Denial of Service (DoS)** | Brute force login attempts or API request flooding | `express-rate-limit` throttles requests (max 100 requests per 15-minute window per IP). |
| **Elevation of Privilege** | Student calls admin or teacher API endpoints | `requireRole('admin')` middleware enforces strict role string matching on every administrative route. |

---

## 3. Cryptographic Standards & Key Management

### 3.1 Password Hashing
```javascript
// backend/utils/password.js
const bcrypt = require('bcryptjs');

async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
}

async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
```

### 3.2 JWT Lifecycle
- Algorithm: `HS256` (HMAC with SHA-256).
- Expiration: `7d` (7 days).
- Token contents: Minimal non-sensitive claims (`id`, `email`, `role`, `userIdNumber`).
- Secret Key: Loaded from `process.env.JWT_SECRET`. Fallback warns in development.

---

## 4. Code Execution Sandboxing & File Security

### 4.1 Safe Sandbox Execution Model
Student code execution in the coding arena is isolated using V8 contexts (`vm.runInContext`) with:
1. **Empty Global Context**: Node.js `process`, `require`, `fs`, and `child_process` are omitted from the execution context.
2. **Hard Timeout**: Script execution is bounded by a 5000ms timer; runaways trigger a `TimeoutError` and terminate.
3. **Memory Safeguards**: Code runs within isolated heaps preventing host process exhaustion.

### 4.2 File Upload Hardening
1. **MIME Whitelisting**: Restricted to `application/pdf`, `image/png`, `image/jpeg`.
2. **Size Enforcement**: Strict 5MB limit (`5,242,880 bytes`).
3. **Path Traversal Prevention**: Storage filenames generated via crypto hash (`Date.now() + '-' + Math.round(Math.random() * 1E9)`).
4. **Access Isolation**: Files served through authenticated endpoints verifying document ownership.
