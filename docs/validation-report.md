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

## Remaining blockers

- A separate MySQL test database and end-to-end integration suite still need to be created.
- SMTP onboarding/password reset, multipart review/locking, assessment timeout, and
  placement eligibility require database-backed execution tests.
- Secure coding execution is intentionally disabled. Do not restore the old Node `vm`
  path; use a separately isolated worker/container with resource and network limits.
- Some dashboard, academic-record, and placement-analysis screens still contain legacy
  mock presentation data and require replacement with API-backed empty/loading states.
- Startup scripts, Docker/MySQL readiness checks, exports, notifications, and all routed
  pages require a dedicated browser/integration audit.

## Startup

Apply the schemas and migration, configure the backend environment (including SMTP if
onboarding is needed), then start FastAPI on `8000`, Express on `5000`, and Stitch/Vite
on `3000`. Verify `/api` and FastAPI `/docs` before using the browser. Startup scripts
still need occupied-port and MySQL-readiness hardening.
