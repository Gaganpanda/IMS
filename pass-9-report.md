# IMS — Pass 9: notification cleanup + real-time push fix

Same environment constraints as Pass 8 (see `audit-report.md`): no Maven
Central access in this sandbox, so backend changes below are careful manual
edits, not compiler-verified. npm registry access works, so every frontend
claim below (build, tests) was actually run — output pasted in, not
estimated.

## What was asked

Notifications were noisy and too long: "item added" and "feedback received"
fire for things the admin already knows about (they're the one entering the
data), and even the useful reminders read as full sentences instead of a
quick glance. Also asked for a general bug/security/stability pass.

## Notification changes (backend)

**Removed — pure noise, no action for anyone to take:**
- `"Item created"` (`ItemService.createItem`) — the person creating the item
  obviously knows they just created it.
- `"Variant added"` (`ItemService.createVariant`) — same reasoning.
- `"Feedback received"` (`ItemService.notifyNewlyReceivedFeedback`) —
  feedback arrives outside the system (email/call/in person) and an admin
  types the received date in; notifying them about their own data entry was
  pure noise. The overdue-reminder *resolution* that used to live next to
  this (clearing a stale "still waiting" notification once feedback is
  recorded) is untouched — that part is genuinely useful and stays.

**Kept, and shortened to one line each** — these are the actionable ones
(`ToTReminderService`, `FeedbackReminderService`):
- Development due-soon / due-today / overdue
- ToT validity expiring-in-N-days / expires-tomorrow / renewal-pending
- Feedback overdue, sample-submission pending (already shortened in Pass 3;
  untouched here)

Example, before → after:
```
"ItemX: Product Development Completion was due on 2026-01-01 and the item
 is still not marked Developed."
→
"ItemX: development overdue by 14d (was due 2026-01-01)."
```
```
"ItemX: ToT validity with Firm expires today (2026-01-01). Renewal is
 pending."
→
"ItemX: ToT with Firm expires today — renewal pending."
```

No enum values or DB columns were removed — `ITEM_ADDED` and
`FEEDBACK_RECEIVED` still exist in `Notification.NotificationType` so old
rows already in the database keep rendering correctly (icon, dashboard
Recent Activity color, etc.); the change is purely that nothing creates new
ones of those two types going forward. Existing old notifications will age
out normally as people read/delete them; nothing needs a manual DB cleanup.

## Bug found: real-time push notifications never actually worked

This is a real, non-trivial one, not just a text change.

**Symptom, if you looked closely:** the backend has always called
`SimpMessagingTemplate.convertAndSendToUser(...)` from `NotificationService`
to push new notifications instantly. But:

1. **The frontend had zero WebSocket client code.** No `sockjs-client`, no
   `@stomp/stompjs`, nothing in `package.json`, nothing subscribing anywhere.
   Every notification only ever appeared via the 60-second poll
   (`AppRoutes.jsx`'s `AppBootstrap`) — the "instant" push was 100% dead
   code on the client side.
2. **Even a connecting client couldn't have received anything.** WebSocket
   endpoints in this app go through Spring's `WebSocketMessageBrokerConfigurer`,
   which (like `/uploads/**`, already documented in Pass 3) is served by the
   same `DispatcherServlet` as the REST controllers and therefore inherits
   `server.servlet.context-path` (`/api`). The registered endpoint is really
   at `/api/ws`, not the bare `/ws` everything assumed. `SecurityConfig` had
   no exemption for it either (no way to send a Bearer header on a WebSocket
   upgrade), and — the actual root cause — **nothing ever set a `Principal`
   on the WebSocket session**. `convertAndSendToUser(username, ...)`
   resolves its target purely from `session.getPrincipal().getName()`; with
   no Principal, Spring can't find a session to route to and the message is
   dropped silently. No exception, no log line — it just vanishes.

**Fix (backend):**
- `security/WsJwtHandshakeInterceptor.java` (new) — validates a JWT passed
  as `?token=` on the handshake URL (the one thing client JS *can* attach to
  a WebSocket/SockJS URL, unlike a header) the same way `JwtFilter` does for
  REST calls, and refuses the handshake (401) if it's missing, expired, or
  references a user that no longer exists.
- `security/WsPrincipalHandshakeHandler.java` (new) — promotes the
  interceptor's validated username into a real `Principal` on the session,
  which is what makes `convertAndSendToUser` actually work.
- `config/WebSocketConfig.java` — registers both on the `/ws` endpoint.
- `config/SecurityConfig.java` — added `/ws/**` to `PUBLIC_URLS`. This is
  **not** an open door: the handshake interceptor above is the real gate,
  and nothing reaches the STOMP broker without a valid JWT.

**Fix (nginx, production):** `frontend/nginx.conf`'s WebSocket block
proxied `/ws/` → `backend:8080/ws/`, which — given point 2 above — could
never have worked. Changed to `/api/ws/` → `backend:8080/api/ws/`, placed
before the generic `/api/` block so nginx picks the more specific match and
adds the `Upgrade`/`Connection: upgrade` headers a plain REST proxy doesn't
carry.

**Fix (frontend, new code):**
- Added `@stomp/stompjs` and `sockjs-client` (checked: neither introduces
  any new `npm audit` finding — see below).
- `services/notificationSocket.js` (new) — opens the SockJS/STOMP
  connection at `${VITE_API_BASE_URL}/ws?token=...`, subscribes to
  `/user/queue/notifications`, forwards parsed messages to a callback.
  Reconnects automatically (5s delay) and fails quietly on transient
  errors — the 60-second poll is still there as a safety net, not removed.
- `routes/AppRoutes.jsx` — `AppBootstrap` now opens the socket when a token
  is present and tears it down on logout/unmount, dispatching
  `pushNotification` (already existed in `notificationSlice.js`, previously
  unused dead code) for every message received.
- `services/notificationSocket.test.js` (new, 4 tests) — pins the `/api/ws`
  URL (the exact thing that was silently wrong before), the
  subscribe-on-connect behavior, message parsing/forwarding, and a
  malformed-payload not crashing the handler.

## Verified for real (frontend)

```
npx vitest run
✓ src/utils/formatDate.test.js               (22 tests)
✓ src/services/axiosInstance.test.js         (12 tests)
✓ src/redux/slices/itemSlice.test.js         (13 tests)
✓ src/redux/slices/authSlice.test.js         (12 tests)
✓ src/services/notificationSocket.test.js    (4 tests)   ← new
✓ src/components/items/StatusBadge/StatusBadge.test.jsx  (6 tests)
✓ src/utils/tokenStorage.test.js             (5 tests)

Test Files  7 passed (7)
     Tests  74 passed (74)
```

`npm run build` — succeeds cleanly, both before and after adding the two
new dependencies.

`npm audit` after adding `@stomp/stompjs`/`sockjs-client` — unchanged
findings from before this pass, all pre-existing:
- `esbuild`/`vite`/`vite-node`/`vitest` (moderate → 1 critical): dev-only
  tooling (Vite dev server, Vitest UI), not shipped in the production
  bundle. Fixing needs a major-version bump of Vitest, which risks breaking
  the test suite Pass 8 wrote — not attempted blind without being able to
  re-run it interactively against a real upgrade plan.
- `react-router-dom` (moderate, open redirect): same v6→v7 major-bump
  situation Pass 8 already flagged and deliberately deferred — still needs
  a dedicated pass with the app actually running to click through every
  route.

Neither is new to this pass and neither was force-upgraded.

## Backend review this pass (manual — not compiled)

Spot-checked `AuthController` and `ItemController` against the same
ownership/access-control pattern already established elsewhere in the
codebase (e.g. `NotificationService.ownedNotification` — every
single-notification mutation verifies the row belongs to the current user
before touching it) — both controllers already correctly role-gate writes
(`@PreAuthorize`) and scope updates/deletes through ownership checks
(`assertAccess`). No new findings; no changes made to either file.

## Files changed this pass

**Backend**
- `backend/src/main/java/com/ims/service/ItemService.java` — removed the
  three noisy notification call sites (see above)
- `backend/src/main/java/com/ims/service/ToTReminderService.java` —
  shortened dev-completion and ToT-validity message text
- `backend/src/main/java/com/ims/config/WebSocketConfig.java` — wired in
  the new handshake auth
- `backend/src/main/java/com/ims/config/SecurityConfig.java` — added
  `/ws/**` to the public-URL list (auth now happens at the handshake)
- `backend/src/main/java/com/ims/security/WsJwtHandshakeInterceptor.java`
  — new
- `backend/src/main/java/com/ims/security/WsPrincipalHandshakeHandler.java`
  — new

**Frontend**
- `frontend/package.json` / `package-lock.json` — added `@stomp/stompjs`,
  `sockjs-client`
- `frontend/src/services/notificationSocket.js` — new
- `frontend/src/services/notificationSocket.test.js` — new
- `frontend/src/routes/AppRoutes.jsx` — connects/disconnects the socket
  alongside the existing polling logic
- `frontend/nginx.conf` — fixed the `/ws/` → `/api/ws/` proxy path and
  headers

## What this pass did not touch

Everything from Passes 1–8 that was already solid (JWT/CORS/rate-limiting
posture, upload validation, notification-ownership IDOR fix, dashboard/
trials/ToT filter bugs, offline font hosting, etc.) — reviewed where
relevant to this pass's changes, not re-litigated wholesale. Backend load
testing, Playwright E2E, and a live Docker Compose run are still not
possible in this sandbox for the same reasons documented in Pass 8's
`audit-report.md`.
