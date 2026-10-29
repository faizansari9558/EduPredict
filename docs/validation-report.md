# Validation report

## Scope

This report records checks run against the current EduPredict source. Documentation was
treated as requirements; a documented feature is not marked complete unless it was
implemented and tested.

## Reproduced and repaired

- Login now accepts active accounts by email or case-insensitive university ID, rejects
  invalid passwords, and derives the role from the database.
- Logout clears the client token. Registration and OTP endpoints no longer expose debug
  OTPs or accept client-selected privileged roles.
- Onboarding, OTP verification, registration, password reset, and SMTP delivery are
  implemented behind the institutional identity table and one-time hashed challenges.
- Student documents use authenticated multipart upload, MIME/signature checks, bounded
  size, generated storage names, and owner-scoped download.
- Assessment attempts, answer persistence, timing, ownership, and score calculation are
  server-side. Coding execution remains unavailable rather than pretending tests passed.
- Prediction and placement code no longer substitutes fabricated academic, skill, or
  assessment values when data is missing.
- Projects, certifications, internships, and skills have API-backed student flows.
- Login, forgot-password, and registration front-end flows no longer display a fake OTP.
- Admin user provisioning now creates preauthorized student/teacher identity records
  rather than silently creating accounts with a shared default password. Bulk `.xlsx`,
  `.xls`, and `.csv` imports are supported through the protected admin endpoint.
- Admin dashboard and institutional analytics charts now consume authenticated
  department, readiness, compensation-tier, and audit APIs. Empty states are shown
  when the database has no evidence. Department creation is persisted through the
  admin API.
- Placement percentages now count distinct students, preventing duplicate metric rows
  from producing values above 100%.

## Files and migration

The additive migration
`database/migrations/20261029_auth_onboarding.sql` must be applied after the base and
phase schemas. It adds institutional identity records, OTP/reset-token storage,
portfolio records, and `students.backlogs_count`. It does not modify or reseed users.

Required SMTP configuration:

`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optional `SMTP_FROM`, and
`FRONTEND_URL`. Without SMTP configuration, onboarding/reset returns an explicit
unavailable response; it does not simulate delivery.

## Tests run

- `npm.cmd --prefix backend test` — 7 passed.
- `npm.cmd --prefix stitch run build` — passed; Vite reports an existing large-chunk warning.
- `$env:PYTHONPATH='.'; pytest ml/tests` — 6 passed, one dependency deprecation warning.
- `node --check` on changed backend controllers and routes — passed.
- Browser smoke test with the local admin account — dashboard, institutional analytics,
  department listing, and department insertion controls rendered from live API data.

## Remaining blockers

- A separate MySQL test database and end-to-end integration suite still need to be created.
- SMTP onboarding/password reset, multipart review/locking, assessment timeout, and
  placement eligibility require database-backed execution tests.
- Secure coding execution is intentionally disabled. Do not restore the old Node `vm`
  path; use a separately isolated worker/container with resource and network limits.
- Some non-admin dashboard, academic-record, and placement-analysis screens still
  contain legacy mock presentation data and require replacement with API-backed
  empty/loading states.
- The reports page still uses legacy table column properties and emits a React key
  warning; this was not part of the analytics change.
- Startup scripts, Docker/MySQL readiness checks, exports, notifications, and all routed
  pages require a dedicated browser/integration audit.
- The local admin browser account used for validation is
  `admin@edupredict.local` / `Admin@12345`; this is development-only and must be
  replaced through deployment secret management in production.

## Startup

Apply the schemas and migration, configure the backend environment (including SMTP if
onboarding is needed), then start FastAPI on `8000`, Express on `5000`, and Stitch/Vite
on `3000`. Verify `/api` and FastAPI `/docs` before using the browser. The local
services were verified listening on all three ports during this validation.
