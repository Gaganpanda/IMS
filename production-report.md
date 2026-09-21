# IMS — Production Report (Pass 8)

Read `audit-report.md` first for scope/constraints — this pass covered the
frontend end-to-end (dependency security, tests, build) with real, executed
output below, and reviewed backend security/config by hand (not compiled;
no Maven Central access in this environment).

## Bugs found & fixed

### 0. Session persisted across browser/tab close (should require login again, bank-style)
**Where:** `frontend/src/redux/slices/authSlice.js`, `frontend/src/services/axiosInstance.js`

The JWT was stored in `localStorage`, so closing the browser/tab and
reopening the site later skipped Login and went straight to Dashboard, as
long as the 8-hour server-side token expiry (`app.jwt.expiration`) hadn't
passed yet. You confirmed you want the opposite: always require login
again after closing, even with time left on a valid token — the way a
banking site behaves, not the "stay signed in" pattern of something like
Gmail.

**Fix:** added `frontend/src/utils/tokenStorage.js`, a small wrapper
around `sessionStorage` instead of `localStorage`, and switched every
token read/write/clear in `authSlice.js` and `axiosInstance.js` to go
through it. `sessionStorage` is scoped to one tab and is cleared
automatically the instant the tab or browser closes — no timer, no
`beforeunload` handler needed (those are unreliable, especially on
mobile), so this can't be defeated by a slow shutdown or a killed
process. A page **refresh** (F5) within the same tab still keeps you
logged in, since that's not what you asked to change — only closing.

One-time cleanup: `tokenStorage.js` also removes any leftover `token` key
from `localStorage` on load, so a browser that was already logged in
before this change doesn't keep a stale, silently-unused copy sitting
there.

Verified with a new test file (`tokenStorage.test.js`, 5 tests) plus
updated `authSlice.test.js`/`axiosInstance.test.js` to assert against
`sessionStorage` — all passing (see full count below).

### 1. Failed login showed the same error message twice
**Where:** `frontend/src/services/axiosInstance.js`

The response interceptor already special-cased `/auth/login` to skip its
misleading "Session expired. Please login again." toast on a 401 — but it
only skipped *that one branch*. A login 401 still fell through every
`else if` below (403, 404, 409, 400) to the final catch-all
(`else if (status) { toast.error(message) }`), which toasted the same
"Invalid username or password" text that `Login.jsx` already renders
inline from `state.auth.error`. Every failed login showed the error twice.

**Fix:** return early for `status === 401 && isLoginRequest` before any
toast logic runs, instead of just excluding it from one branch. Verified
with a new test (`axiosInstance.test.js`) asserting zero toast calls for a
failed login while the inline error still flows through
`loginAsync.rejected` unchanged.

## Dependency security (frontend — real `npm audit`, not estimated)

Before:
```
axios  1.0.0 - 1.17.0        (Severity: high)  — 10 advisories, incl. prototype
                                                  pollution, CRLF-adjacent issues,
                                                  DoS via recursion, maxBodyLength bypass
form-data  4.0.0 - 4.0.5     (Severity: high)  — CRLF injection via unescaped
                                                  multipart field names/filenames
react-router / react-router-dom  6.0.0 - 7.17.0  (Severity: moderate) — open
                                                  redirect, SSR deserialization issue
4 vulnerabilities (2 moderate, 2 high)
```

Action taken: ran `npm audit fix` (non-breaking). Verified after:
```
axios@1.20.0        (patched)
form-data@4.0.6      (patched, deduped)
```
`package.json`'s existing `"axios": "^1.7.2"` range already permits
1.20.0, so this holds on a fresh `npm install` too — no manual version pin
was needed.

**Not fixed — deliberate, flagged for your decision:** `react-router-dom`'s
fix requires a v6→v7 major bump. `npm audit fix --force` would have pulled
`react-router-dom@7.18.3` in blindly. React Router 7 changes several APIs
(data routers, `redirect`/loader patterns) and this app has 63 frontend
files — forcing that bump without reviewing every route/`useNavigate` call
site risks trading a moderate-severity advisory for a broken build. This
needs a dedicated pass with the app actually running to verify routing
still works, which this environment can't do (no way to serve/click
through the SPA here). Recommend scheduling that as its own piece of work.

Rebuilt (`npm run build`) after the fix — succeeds cleanly, same as before.

## Testing (frontend — real, executed, all passing)

No test runner existed in this project before this pass. Added Vitest +
React Testing Library (`vitest@1.6.0`, `@testing-library/react@14.3.1`,
pinned versions — the latest majors had an unrelated peer-dependency
conflict in this environment) and wrote real tests, run with
`npx vitest run`:

```
✓ src/utils/formatDate.test.js               (22 tests)
✓ src/services/axiosInstance.test.js         (12 tests)
✓ src/redux/slices/itemSlice.test.js         (13 tests)
✓ src/redux/slices/authSlice.test.js         (12 tests)
✓ src/components/items/StatusBadge/StatusBadge.test.jsx  (6 tests)
✓ src/utils/tokenStorage.test.js             (5 tests)

Test Files  6 passed (6)
     Tests  70 passed (70)
```

What's covered and why these files specifically: each targets logic with
either a documented prior bug or genuine branching complexity, not
boilerplate.
- **`formatDate.test.js`** — pins the fixed IST/UTC timezone bug
  (`toUtcAwareDate`) with fake-timer tests so it can't silently regress,
  plus the date-grouping and days-until math used on the dashboard.
- **`authSlice.test.js`** — pins the fix where only a real 401/403 on
  `/auth/me` should log the user out; a network error or 5xx must leave
  the session alone.
- **`axiosInstance.test.js`** — covers every branch of the response
  interceptor (401/403/404/409/400/generic), including the two 409 codes
  that intentionally suppress the toast (`ITEM_STALE`, `HAS_DEPENDENCIES`)
  and the login-double-toast bug this pass fixed.
- **`itemSlice.test.js`** — the filter/pagination reducers (several reset
  `page` to 0 as a side effect — easy to break silently) and the
  Spring-`Page`-shaped fetch payload mapping.
  **`StatusBadge.test.jsx`** — the status→variant color mapping,
  including the fallback for an unrecognized status string.

`npm run build` re-verified after adding tests and dev-dependencies —
still succeeds.

**Coverage:** no percentage is reported. `vitest run --coverage` needs a
coverage provider (`@vitest/coverage-v8`) that wasn't installed to keep
this pass scoped to what's actually meaningful to test; a coverage number
over 5 hand-picked files would be a misleadingly small denominator, not a
real signal. Run `npm install -D @vitest/coverage-v8 && npm run
test:coverage` to get a real number once more tests exist.

## Backend (reviewed, not compiled — see audit report for why)

No code changes this pass. Reviewed JWT/CORS/CSRF posture, file-upload
validation, actuator exposure, exception-handling info-leakage, rate
limiting, and entity fetch strategy — all already solid from prior passes,
no new findings. Full list in `audit-report.md`.

## Files changed this pass

- `frontend/src/utils/tokenStorage.js` — new (session-scoped token storage)
- `frontend/src/utils/tokenStorage.test.js` — new
- `frontend/src/redux/slices/authSlice.js` — switched to `tokenStorage`
- `frontend/src/services/axiosInstance.js` — switched to `tokenStorage`;
  also the double-toast bug fix (see above)
- `frontend/src/redux/slices/authSlice.test.js` — updated to assert
  against `sessionStorage`
- `frontend/src/services/axiosInstance.test.js` — updated to assert
  against `sessionStorage`
- `frontend/package.json` — added `test`/`test:watch`/`test:coverage`
  scripts and test-tooling devDependencies
- `frontend/package-lock.json` — updated by `npm audit fix` +
  new devDependencies
- `frontend/vite.config.js` — added Vitest `test` config block
- `frontend/src/test/setupTests.js` — new (jest-dom matchers,
  `matchMedia` polyfill for jsdom)
- `frontend/src/utils/formatDate.test.js` — new
- `frontend/src/redux/slices/authSlice.test.js` — new
- `frontend/src/redux/slices/itemSlice.test.js` — new
- `frontend/src/services/axiosInstance.test.js` — new
- `frontend/src/components/items/StatusBadge/StatusBadge.test.jsx` — new
- `audit-report.md`, `production-report.md` — new (this file and its
  companion)

`node_modules/`, `frontend/dist/`, and `backend/target/` are excluded from
the delivered zip (build artifacts / dependencies — regenerate with
`npm install` and `mvn package` respectively).

## Remaining risks / honest follow-ups

1. **`react-router-dom` moderate-severity advisory** — not fixed, needs a
   reviewed v7 migration (see above).
2. **Backend has zero automated tests.** Nothing in this environment can
   compile or run JUnit against this backend, so none were added this
   pass — writing untested test files isn't a real improvement over having
   none. This needs to happen in an environment with Maven Central access
   (your machine, CI, or a sandbox with a wider network allowlist).
3. **No load testing, no Docker verification, no E2E tests exist** for
   this project at all yet — none of the infrastructure to produce them
   honestly was available here.
4. **Default demo credentials** (`admin`/`admin123`) are still seeded by
   default — this was already flagged in prior passes
   (`app.seed-demo-users` / `SEED_DEMO_USERS`); re-flagging since it's the
   single most important thing to turn off before any real deployment.
