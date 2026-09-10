# IMS — Item Management System

Spring Boot (Java 17) backend + React (Vite) frontend, MySQL for storage,
Redis for caching. Fully dockerized.

## Quick start (Docker)

```bash
cp .env.example .env      # adjust secrets/ports if needed
docker compose up -d --build
```

- Frontend: http://localhost
- Backend API: http://localhost:8080/api
- MySQL: localhost:3306
- Redis: localhost:6379

The frontend container serves the built React app via nginx and reverse-proxies
`/api`, `/ws`, and `/uploads` to the backend container, so the SPA talks to the
API on the same origin — no CORS issues in production.

Default seeded login: `admin` / `admin123` (see `DataInitializer.java`).

To stop: `docker compose down` (add `-v` to also wipe DB/Redis volumes).

## Running locally without Docker

Backend needs a local MySQL and Redis instance (or point `DB_HOST`/`REDIS_HOST`
env vars at remote ones):

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

---

## What changed in this pass

### 1. Redis integration
- Added `spring-boot-starter-data-redis` + `commons-pool2` to `pom.xml`.
- Replaced the old in-memory `ConcurrentMapCacheManager` (`config/CacheConfig.java`,
  removed) with `config/RedisConfig.java`: a real `RedisCacheManager` with
  per-cache TTLs (`items` 5m, `item-detail` 10m, `dashboard` 2m,
  `notifications` 1m) and JSON serialization (Jackson + `JavaTimeModule` for
  `LocalDate`/`LocalDateTime` fields). The existing `@Cacheable`/`@CacheEvict`
  annotations in `ItemService`/`DashboardService` needed no changes — they now
  transparently hit Redis instead of local memory, so caching survives
  restarts and works across multiple backend instances.
- `application.properties` now reads `REDIS_HOST` / `REDIS_PORT` /
  `REDIS_PASSWORD` from the environment (defaults to `localhost:6379` for
  local dev).

### 2. Docker
- `backend/Dockerfile` — multi-stage Maven build → slim `eclipse-temurin:17-jre`
  runtime, non-root user, healthcheck against `/api/actuator/health`.
- `frontend/Dockerfile` — multi-stage `npm run build` → `nginx:alpine`,
  with `nginx.conf` doing SPA fallback routing + reverse proxy for
  `/api`, `/ws` (WebSocket/SockJS), and `/uploads`.
- Root `docker-compose.yml` wires up `mysql`, `redis`, `backend`, `frontend`
  with healthchecks, named volumes (`mysql_data`, `redis_data`,
  `backend_uploads`), and a shared network.
- `.env.example` for all configurable values (DB creds, JWT secret, CORS
  origins, exposed ports).

### 3. Bugs found & fixed
- **Hardcoded DB password** (`Admin@123`) and JWT secret baked directly into
  `application.properties` — now sourced from environment variables with the
  same values as defaults, so local dev still works unchanged but Docker/prod
  can override them safely.
- **WebSocket CORS hardcoded to `localhost`** (`WebSocketConfig.java`) — this
  silently broke the live-notification WebSocket the moment the app was
  accessed from anywhere other than `localhost:3000`/`:5173` (e.g. through
  Docker/nginx or a real domain). Now reads the same `app.cors.allowed-origins`
  property used by the REST CORS config.
- **`Login.css` was leaking global styles.** It declared `*, *::before,
  *::after { margin:0; padding:0 }` and a bare `body { background: ... }`
  rule. Since Vite bundles all imported CSS globally (these aren't CSS
  Modules), those rules silently overrode `index.css`'s reset and background
  on *every* page once the Login route had been visited, not just the login
  screen. Scoped those rules to `.login` instead.
- **No true mobile layout.** The sidebar was a fixed 240px column with no
  collapse behavior — on narrow screens it just squeezed the page content.
  Added a slide-in drawer (`Sidebar`/`Navbar`/`MainLayout`) with a hamburger
  toggle, backdrop, and close button below 900px.
- **Color contrast regressions from the theme change** — several elements
  used literal white (`#fff`/`white`) as *text/icon* color on top of colored
  buttons/badges/avatars. Under the new dark palette that needed to map to a
  dedicated "text-on-accent" token rather than the (now dark) surface color;
  fixed across `Sidebar`, `Navbar`, `ItemTable`, item forms, and `ItemDetails`.
- Removed dead/unused CSS module `frontend/src/assets/styles/*` — it was
  never imported by any component (only `index.css` is), left over from an
  earlier version of the design system.

### 4. UI — futuristic, dark, glass-morphic theme + responsive
- Rewrote the design tokens in `index.css`: deep-space background with a
  radial gradient mesh, cyan/violet neon brand gradient, glass-morphic
  surfaces (`backdrop-filter: blur(...)`), glow shadows, `Space Grotesk` for
  headings + `Inter` for body + `JetBrains Mono` available for
  code/data-style text.
- Because almost every component already consumed shared CSS variables
  (`var(--color-*)`), retheming the root tokens re-skinned most of the app
  automatically. For the ~40 remaining files with one-off hardcoded hex
  colors, ran a scripted pass mapping every literal color to the matching
  semantic token (surfaces → glass surfaces, blues → the new cyan/violet
  brand, status pastels → translucent tinted badges) so the whole app is
  visually consistent rather than a patchwork of light and dark panels.
- Added a glass/blur treatment to major cards, modals, and popovers
  app-wide, plus neon glow hover states on primary buttons and stat cards.
- Sidebar becomes a full-height slide-in drawer with backdrop below 900px;
  navbar collapses subtitle/user-details and shows a hamburger button;
  page title truncates instead of wrapping/overflowing; existing table/grid
  breakpoints were kept and extended down to 420px/480px where missing.

### Known follow-ups (not changed, flagged for awareness)
- Default dev credentials (`admin`/`admin123`) are seeded by
  `DataInitializer` — fine for local dev, should be disabled/rotated before
  any real deployment.
- `frontend/src/assets/styles/*` (unused CSS module) was left in place rather
  than deleted, in case it's wired up intentionally elsewhere later.

---

## Pass 2 — polish, stability & cleanup

The theme description above (dark glass-morphic/neon) is **out of date** —
the app now ships a light, "enterprise console" theme (see `index.css`).
Docs had drifted from the code; noting it here so nobody chases a phantom
dark theme.

### Fixed
- **Demo credentials always seeded, even in prod.** `DataInitializer` now
  reads `app.seed-demo-users` (env `SEED_DEMO_USERS`, default `true`) so it
  can be turned off before a real deployment, with a `log.warn` reminder
  instead of a silent `log.info`.
- **No `.gitignore` anywhere in the repo.** Added a root one — `.env`,
  `target/`, `node_modules/`, build output, and IDE files were previously
  one `git add .` away from being committed.
- **`.env.example` contained a real-looking password and JWT secret**
  (identical to the ones in `.env`). Replaced with obvious placeholders.
- **Orphaned dead CSS module** (`frontend/src/assets/styles/*` — global.css,
  variables.css, typography.css, responsive.css) confirmed unused anywhere
  and removed; a prior pass's note said it was "left in place in case it's
  wired up later" but it wasn't, and it duplicated/contradicted tokens
  already in `index.css`.
- **Commented-out dead code** in `Navbar.jsx` (a disabled duplicate "Add
  Item" button, plus the now-unused `addItem`/`useNavigate` bindings it
  required) — removed; the Items page already has its own Add button.
- **Emoji used as icons** in `NotificationItem` and `NotificationPopup`
  (✓ ⊙ ≡ ⛨ ↑ 🛒 ⚗ •), paired with hardcoded hex colors instead of the
  theme's design tokens. Emoji render inconsistently across OS/browser and
  read as unpolished in an enterprise UI. Replaced with real vector icons
  from the new shared `Icon` component, and hex colors with the existing
  `--color-success` / `--color-warning` / `--color-danger` / etc. tokens
  (added `--color-teal` / `--color-teal-bg` for the one status that didn't
  have a token yet).
- **1.4MB PNG illustration + 318KB PNG logo** on the login screen, both
  displayed at a few hundred px — converted to WebP and downscaled to
  actual display size (1.4MB → 35KB, 318KB → 5.8KB). Also removed three
  unused image files (`order.png`, `order (1).png`, `product-management.png`)
  that weren't referenced anywhere.
- **No app-wide error boundary.** A render error anywhere in the tree
  previously produced a blank white screen. Added
  `components/common/ErrorBoundary` (wraps the app in `main.jsx`) with a
  styled fallback and a reload action.
- **Unknown routes silently redirected to `/dashboard`.** Added a real,
  styled `pages/NotFound` page for unmatched authenticated routes instead.

### Added
- `frontend/src/assets/styles/animations.css` — a small shared motion
  system (fade/slide/scale/shimmer keyframes + utility classes like
  `.animate-fade-in-up`, `.stagger-children`, `.hover-lift`,
  `.press-scale`), respecting `prefers-reduced-motion`. Applied to
  Dashboard, Items, Notifications, ItemDetails, AddItem, and EditItem for
  a consistent page-entrance feel (Login already had its own animations).
- `components/common/Icon/Icon.jsx` — a single-source-of-truth icon set.
  Previously ~23 files each hand-copied their own local `Icons = {...}`
  object with inline `<svg>` markup for the same handful of glyphs (trash,
  edit, back, bell, etc.), which is a maintenance trap: fixing a stroke
  width meant hunting every duplicate. Migrated the highest-traffic/most
  duplicated components to it: `Sidebar`, `Navbar`, `SearchBar`,
  `ConfirmPopup`, `ItemFilters`, `ItemCard`, `NotificationBell`,
  `NotificationItem`, `NotificationPopup`, and `Dashboard`'s stat cards.
  The remaining large form files (`AddItemForm`, `EditItemForm`,
  `ItemDetails`, `Login`) still use local inline SVGs — their icon sets
  are less duplicated across files, so migrating them is lower priority;
  swapping them to `<Icon name="..." />` later is straightforward using
  the same pattern.

### Verified
- `npm run build` succeeds cleanly after all changes.

---

## Pass 3 — dashboard fixes, filter bug, notification clarity, offline readiness

### Fixed
- **Recent Activities card: items rendering on top of / clipped by the
  decorative wave graphic.** The list's scrollable viewport was sized to
  fill the *entire* remaining card height, so the last visible item's text
  landed right on top of the wave and got visually washed out by its color
  gradient. Fixed by giving `.activity-card__list` a `margin-bottom` equal
  to the wave's height — this actually shrinks the list's own box, leaving
  a real reserved strip beneath it that scrolled content can never occupy,
  instead of just adding invisible scrollable space after the content
  (which doesn't move anything the user can see). The "View All" modal
  (no wave) is unaffected via a compound-selector override.
- **Trials Status filter returning wrong/incomplete results.** The backend
  query (`ItemRepository.findAllWithFilters`) was filtering on
  `tf.status` — the status of an individual *feedback round* — instead of
  `ts.trialStatus`, the stakeholder's actual overall trial status shown in
  the UI. Since that join was a `LEFT JOIN`, any stakeholder with no
  feedback rounds yet (or whose rounds carried a different status than
  their overall one) was silently excluded or mismatched. Now filters on
  `ts.trialStatus` directly; removed the now-unneeded feedback join.
- **Sample-pending / feedback-overdue notifications were long and
  anonymous.** They spelled out the exact request date and a verbose
  sentence, but never said which item or which stakeholder the reminder
  was actually about — confusing once more than one trial was in flight.
  Shortened both to `"{Item} — sample not yet sent to {Stakeholder} (Nd)"`
  and `"{Item} — feedback from {Stakeholder} is Nd overdue"`.
- **`--font-display` pointed at a font that was never loaded.** It was set
  to `"Plus Jakarta Sans"`, which wasn't in the old Google Fonts link or
  anywhere else — so every heading silently fell back to Inter the whole
  time, and the "Space Grotesk" font that *was* being loaded was never
  referenced by name anywhere. Pointed `--font-display` at Space Grotesk.

### Offline readiness (this app is meant to run long-term with no internet)
- **Fonts were loaded from `fonts.googleapis.com` at runtime.** On a
  network with no internet access — the expected deployment for this app —
  that request fails and every page silently falls back to system fonts.
  Replaced with `@fontsource/inter`, `@fontsource/space-grotesk`, and
  `@fontsource/jetbrains-mono` (self-hosted, bundled into the build by
  Vite), imported in `main.jsx`. No external font request at runtime.
- **No backup/restore process existed** beyond a few stray, undated
  `.sql` dumps sitting in the repo root (`ims_db.sql`,
  `ims_db_backup.sql`, `ims_db_3307_backup.sql`) — not a repeatable
  process, and not something that should be *in* the repo in the first
  place. Added `scripts/backup.sh` / `scripts/restore.sh`: dump MySQL +
  archive the uploads folder (or the `backend_uploads` Docker volume) into
  one timestamped, restorable folder. This is the actual safety net for an
  offline system with no cloud backup behind it — schedule `backup.sh` via
  cron and copy its output off the machine periodically (a second machine
  on the same LAN, a USB drive, etc.). The old stray dumps are left in
  place but should be deleted once you've run a real backup with the new
  script.
- **`.gitignore` only listed `node_modules/` and `dist/`**, despite an
  earlier pass's notes claiming it also covered `.env`, build output, and
  IDE files. In particular, the real `.env` — with a real DB password and
  JWT secret in it — was not ignored, i.e. one `git add .` away from being
  committed to source control. Rewrote `.gitignore` to actually cover
  `.env`, `target/`, `*.class`, `uploads/`, loose `*.sql` dumps, and
  IDE/OS files.

### Before treating this as a permanent production deployment
Not changed automatically (each is a real decision, not a safe default to
silently flip) — but worth doing once, before this stops being a dev/test
install:
- **Rotate the JWT secret and DB password.** Both currently fall back to
  an obvious placeholder value baked into `application.properties`
  (`app.jwt.secret`, `spring.datasource.password`) if the `JWT_SECRET` /
  `DB_PASSWORD` env vars aren't set. Fine for local dev; set real values
  in `.env` for anything long-lived.
- **Turn off demo accounts.** Set `SEED_DEMO_USERS=false` once real
  accounts exist — `admin`/`admin123` and `user`/`user123` are seeded by
  default (`app.seed-demo-users`, see `DataInitializer.java`).
- **Schedule `scripts/backup.sh`** (cron, Task Scheduler, etc.) and verify
  a `restore.sh` run actually works *before* you need it for real —
  offline means there's no cloud fallback if the disk fails.
- MySQL and Redis both need to be running locally already for this to be
  offline-safe (Docker Compose handles this — see Quick start above); if
  either is ever pointed at a remote host, that host becomes a hard
  dependency for every page load.

---

## Pass 4 — variant edit bugs, double-toast errors, variant document uploads

### Fixed
- **Editing a variant showed the parent item's name, not the variant's own
  name.** The `EditVariantForm` page wrapper built its data by spreading
  the variant onto the item, then explicitly overwrote the result's `name`
  back to the parent item's name (`name: selectedItem.name`) — meant for
  the breadcrumb, but the edit form's "Item Name" field reads from that
  same object. This wasn't just a display bug: since the save payload
  echoes that field back, **every save was silently renaming the variant
  to match the parent item.** Removed the override; the parent item's name
  is now passed separately (`itemName`) for the one place that legitimately
  needs it (document download filenames).
- **Every failed save/upload showed two stacked error toasts.** The axios
  response interceptor already shows one generic toast per HTTP error
  status, but every thunk in `itemSlice.js` *also* called `toast.error()`
  in its own catch block regardless of status — so any non-400 failure
  (a 500, a 404, a 409, etc.) was toasted twice; that's what produced the
  "An unexpected error occurred..." + "Server error..." pair. Consolidated
  to one toast: the interceptor now handles every case except field-level
  400 validation errors (`{ data: { field: "msg" } }`), which only the
  originating thunk can format properly (joining multiple field messages
  into one readable line) — that's the one case a thunk still toasts.
- **Uploading a document while editing a variant reported success but the
  document never showed up.** There was no backend endpoint to upload a
  document scoped to a variant at all — `ItemDocument` already supports an
  `itemVariant` relation and the variant detail endpoint already reads
  documents via `findByItemVariantId`, but the only upload endpoint
  (`POST /items/{id}/documents`) always attaches to the *item*. The variant
  edit screen was calling that endpoint, so the upload genuinely succeeded
  (hence the "uploaded" toast) — just onto the item, not the variant it
  displays. Added `POST/DELETE /items/{id}/variants/{variantId}/documents`
  (backend: `uploadVariantDocument`/`deleteVariantDocument` in
  `ItemService`/`ItemController`; frontend: matching `itemApi` calls,
  `uploadVariantDocumentAsync`/`deleteVariantDocumentAsync` thunks) and
  switched `EditVariantForm` to use them.
- **`deriveTrialsStatus` could set an item's/variant's trials status to
  `ON_HOLD`** — a value the Trials Status filter dropdown doesn't offer at
  all (it only exposes Not Started / In Progress / Completed / Pending),
  so any item that landed there became permanently unreachable through
  that filter, compounding the trials-filter bug fixed in Pass 3. The
  surrounding comment already said this case should be "treated the same
  as Pending" — the code just returned the wrong enum. Fixed to return
  `PENDING`, matching the stated intent and every other stakeholder-status
  handling in the same codebase.

### Known follow-up
- **The reported 500 on saving a second trial stakeholder** wasn't
  root-caused this pass — static review of the trial-stakeholder save path
  (item and variant versions), the notification side-effect (which already
  runs in its own isolated transaction and swallows all exceptions by
  design), and enum parsing (already exception-safe) didn't turn up the
  exact throw site, and this environment has no way to actually run the
  Spring Boot + MySQL stack to reproduce it directly. The backend's generic
  error handler does log the full stack trace (`log.error("Unexpected
  error: ", ex)` in `GlobalExceptionHandler`) — the fastest way to close
  this out is to grab that stack trace from the backend console/log file
  right after reproducing it.

---

## Pass 5 — root cause of the 500 error, found

Found it — thanks to the user spotting the pattern themselves in
`fix_trials_status.sql` and pointing at it directly.

### Root cause
`fix_trials_status.sql` already documented one instance of this: a column
mapped in Java as `@Enumerated(EnumType.STRING)` (which only ever needs a
plain `VARCHAR`) had somehow ended up as a **native MySQL `ENUM(...)`** on
the live database instead — created manually outside the codebase at some
point, not by Hibernate. `ddl-auto=update` never fixes this direction: it
adds new columns/tables, but never converts an existing native `ENUM`
column back to `VARCHAR`. So a manually-created `ENUM` column silently
drifts out of sync with the Java enum forever, with **no error at all**
until someone tries to save a value the stray `ENUM` doesn't happen to
allow — at which point MySQL throws a data-truncated/out-of-range error,
and the backend's generic exception handler turns that into the same
unhelpful "An unexpected error occurred" 500 no matter which column or
value actually caused it.

That's exactly what was happening to `trial_stakeholders.trial_status`:
selecting "Completed" or "In Progress" for a stakeholder worked fine
(those happened to be legal values on the stray `ENUM`), but "Pending"
threw — the live `ENUM` was missing that value (or spelled differently).

### Fixed
Replaced `fix_trials_status.sql` with a broader migration:
- Confirmed fixes: `items.trials_status` (from Pass 3's filter bug) and
  `trial_stakeholders.trial_status` (this bug).
- Defensive fixes for every other `@Enumerated(EnumType.STRING)` column in
  the codebase, since they're all the exact same shape and there's no
  guarantee only these two ever drifted this way: `items.development_status`,
  `items.ipr_status`, `item_variants.development_status`,
  `item_variants.tot_status`, `item_variants.trials_status`,
  `item_variants.ipr_status`, `trial_feedbacks.status`. Converting an
  already-correct `VARCHAR` column is a harmless no-op, so this is safe to
  run even on columns that turn out to have been fine all along.

**Run this against your live database** (it doesn't run itself — nothing
in the app executes loose `.sql` files automatically):
```
mysql -u<user> -p ims_db < fix_trials_status.sql
```
Then restart the backend so nothing has a stale connection/cached error
state.

### Worth knowing
`schema.sql` doesn't define `item_variants`, `trial_stakeholders`, or
`trial_feedbacks` at all — those tables exist only because Hibernate's
`ddl-auto=update` (or a manual `CREATE TABLE`) built them from the entity
classes directly, never through `schema.sql`. That's *why* this class of
bug can happen silently in the first place: there's no single source of
truth for the live schema to catch drift against. Not changed as part of
this pass (schema.sql itself isn't wrong, just incomplete) — but worth
knowing if a similar mystery 500 shows up again on a different column.

---

## Pass 6 — notifications page cleanup & styling polish

### Fixed
- **Dead notification component tree.** `components/notifications/NotificationBell`,
  `NotificationList`, and `NotificationItem` (6 files) were never imported
  anywhere — the navbar bell and the `/notifications` page each grew their
  own inline implementation instead, leaving this trio as pure orphaned
  code that only added confusion about which "bell" or "list" was actually
  live. Removed.
- **No-op hover style** on `.notif-page__item:hover` — it set
  `box-shadow: inset 0 0 0 9999px transparent`, a fully transparent shadow
  that painted nothing. Removed the dead declaration.
- **Notification rows overflowed on narrow screens.** The per-item action
  cluster (time, "View item", archive, delete) shared one non-wrapping flex
  row with the icon and message, so on phone-width screens it pushed past
  the card edge instead of wrapping. Added a `max-width: 560px` breakpoint
  that stacks the actions onto their own row, right-aligned, and keeps the
  "View item" button always visible there instead of hover-only.
- Header action buttons now stretch full-width on small screens for a
  more app-like touch target instead of shrink-wrapping.

---

## Pass 7 — ToT filter data bug, IPR bar clipping, activity/notification polish

### Fixed
- **"To Be Filed" (and "Filed") ToT Status filter returning no/incomplete
  results for items that clearly show that exact status everywhere else in
  the app.** `ToTStatusConverter` normalizes legacy `tot_status` values
  (`NOT_APPLICABLE`, `TO_BE_FILLED`, `FILLED_TNF`, `FILLED_TAC` — left over
  from an older 4-value version of the enum) to `FILED` / `TO_BE_FILED`
  whenever a row is *read*, which is why item lists/details/dashboard counts
  already show the right label. The filter dropdown never went through that
  normalization: `ItemRepository.findAllWithFilters` compares the raw
  column directly against the selected status, so a row still holding one
  of the legacy literal strings never equals `'TO_BE_FILED'` at the SQL
  level even though it's conceptually the same status. Added
  `fix_tot_status.sql` to normalize every existing `items`/`item_variants`
  row to the two canonical values — **run this against your live database**
  the same way `fix_trials_status.sql` is run (see that section above);
  nothing in the app executes loose `.sql` files automatically. Future
  writes are unaffected since the app only ever persists the canonical
  enum names.
- **IPR Overview progress bar clipped the trailing character of its %
  label** (most visible at 100%, e.g. "Copyright"). The fill bar's own
  right corner used the same border-radius as its track, so at full width
  the rounded corner carved into the last few px of content width — right
  where the right-aligned "100%" label sits — clipping it. Fill now keeps
  square right corners (the track's `overflow:hidden` + matching radius
  still masks it into a correctly rounded pill visually) and the label
  gets a touch more right padding.
- **Recent Activities entries felt oversized**, leaving only a few visible
  before scrolling. Tightened row padding, icon size, message line-height,
  and font-size for a more compact list without losing the 2-line clamp
  (message text is still fully readable via the `title` tooltip / "View
  All" modal).
- **Notifications page's "urgent" red highlight was a rotating conic-
  gradient border that visibly traveled around the row edge** — meant to
  read as a status cue, it actually read as distracting/flashing motion.
  Replaced with a calm, static red left-edge accent plus a gentle,
  non-moving background pulse (previous pulse keyframes were also
  self-canceling — 0%/100% used a 0px-wide shadow and 50% used a
  fully-transparent one, so neither state was ever actually visible).
