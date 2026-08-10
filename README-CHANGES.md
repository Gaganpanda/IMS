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
