# IMS — Audit Report (Pass 8)

## Scope and honesty note, read first

The request that triggered this pass asked for a full production-readiness
audit: 20 phases including OWASP review, 90%/85% test coverage with
generated suites, Playwright E2E runs, and 100/500/1000-user load testing,
all "before giving zip."

This environment cannot actually deliver several of those:

- **No Maven Central access.** This sandbox's network allowlist covers
  npm, PyPI, and GitHub, but not `repo.maven.apache.org` (confirmed: a
  direct request returns HTTP 403). The Spring Boot backend cannot be
  compiled, run, or have its tests executed here. Every backend change in
  this pass is a manual code review + hand-edit, not a compiler-verified
  one.
- **No live server, no Docker daemon, no browser.** Load testing,
  Playwright E2E, and Docker Compose startup all require infrastructure
  that doesn't exist in this sandbox. None of that was attempted, and no
  numbers for any of it are reported below or in the production report —
  fabricating them would be worse than not having them.
- **Frontend tooling is real and was actually run.** npm registry access
  works, so the frontend audit, dependency-vulnerability scan, test suite,
  and production build below are all genuinely executed, with real output
  pasted into the production report — not estimated.

## What this pass builds on

This is not a first look at the codebase. `README-CHANGES.md` in the repo
root documents 7 prior fix passes already applied — Redis integration,
Docker/deployment, JWT secret validation, upload-extension whitelisting,
CORS, rate limiting, the trials/ToT filter bugs, the variant-name and
double-toast bugs, offline font hosting, and more. This pass reviewed
those areas rather than re-discovering them, and looked for what they
didn't cover.

## Backend review (manual — not compiled)

Areas reviewed and found already solid, with no changes made:

- **JWT**: secret length validated at startup (`JwtUtil.validateSecret`,
  fails fast below 32 bytes), token read from the `Authorization` header
  only (not a cookie, so disabling CSRF in `SecurityConfig` is correct),
  expiry checked on every request.
- **CORS**: configurable allow-list via `app.cors.allowed-origins`, no
  wildcard-with-credentials misconfiguration.
- **File uploads**: extension allow-lists per upload type
  (`ALLOWED_IMAGE_EXT` / `ALLOWED_DOCUMENT_EXT`), server-generated
  `UUID` filenames (no path traversal via user-controlled names), 5MB/10MB
  multipart limits configured.
- **Actuator**: only `health` and `info` exposed
  (`management.endpoints.web.exposure.include=health,info`), health
  details gated behind `when-authorized`.
- **Exception handling**: `GlobalExceptionHandler` logs full stack traces
  server-side but returns only a generic message to the client on
  unhandled exceptions — no internal detail (SQL, stack frames, class
  names) leaks in the HTTP response.
- **Rate limiting**: in-memory sliding window on `/auth/login`, keyed by
  IP, with a scheduled eviction task so the tracking map can't grow
  unbounded.
- **Entity fetch strategy**: `Item`'s relations default to `LAZY` except
  two small `@ElementCollection` fields — no obvious N+1 trap from an
  accidental `EAGER` collection.

No new backend security findings this pass. If you want a harder
guarantee than manual review, that requires either giving this
environment Maven Central access, or running the checks in an
environment that has it.

## Frontend review (executed for real)

- **Dependency audit** (`npm audit`): found real, non-hypothetical high
  and moderate severity advisories in production dependencies —
  see production report for the fix and verification.
- **No test tooling existed at all** before this pass — `package.json`
  had no test runner. Added Vitest + React Testing Library and wrote real
  tests (listed in the production report), all executed and passing.
- **Found one real bug** while writing interceptor tests: a failed login
  showed the error message twice (once inline, once as a toast) — see
  production report for the root cause and fix.
- **Production build**: run for real before and after all changes;
  succeeds cleanly both times.

## Not attempted this pass (explicitly out of scope for the reasons above)

- Backend unit/integration/repository/security/scheduler tests — not
  written this pass, since with no compiler available there's no way to
  verify a hand-written JUnit test actually compiles or passes, and
  shipping untested test code isn't better than shipping none.
- Playwright E2E suite.
- Load testing at any concurrency.
- Docker Compose startup verification.
- A from-scratch re-audit of every one of the 20 phases in the original
  request — most of that ground (UI polish, accessibility pass, dashboard
  analytics correctness, variant independence, notification engine) was
  already covered across the 7 prior passes in `README-CHANGES.md`, and
  a substantive re-review of all of it wasn't practical to also finish in
  one pass alongside everything above. Treat this as Pass 8 of an ongoing
  series, not a closing audit.
