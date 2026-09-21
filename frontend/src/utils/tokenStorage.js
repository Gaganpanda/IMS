const TOKEN_KEY = "token";

/*
 * Session-scoped token storage.
 *
 * sessionStorage (not localStorage) is a deliberate choice here: it
 * survives a page refresh within the same tab — so hitting F5 doesn't log
 * you out mid-work — but it's wiped automatically the moment the tab or
 * browser is closed. The next visit always lands on the Login page and
 * needs real credentials again, the same way a banking site behaves,
 * regardless of whether the JWT itself (app.jwt.expiration, currently 8h
 * server-side) would still be valid.
 *
 * localStorage would instead keep the same token alive across full
 * browser restarts for as long as the JWT is valid — the "stay signed in
 * like Gmail" behavior — which is explicitly NOT what this app wants.
 */
export const tokenStorage = {
  get() {
    return sessionStorage.getItem(TOKEN_KEY);
  },
  set(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

// One-time cleanup: earlier versions of this app stored the token in
// localStorage, which would otherwise sit there forever (even after this
// change) and could look like a leftover valid session. Remove it so a
// browser that was logged in before this change doesn't carry a stale,
// silently-unused token around.
try {
  localStorage.removeItem(TOKEN_KEY);
} catch (_) {
  /* localStorage unavailable — nothing to clean up */
}
