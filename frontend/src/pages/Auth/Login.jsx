import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync, clearAuthError } from "../../redux/slices/authSlice";
import { useTheme } from "../../context/ThemeContext";
import "./Login.css";
import logoHexagon from "../../assets/logo-hexagon.webp";

/* ══════════════════════════════════════════════════════════════
   LOGIN — "Isometric Yard" concept (v2, full rebuild)

   Ground-up redesign. The old build ("Aurora Depth") used a flat
   stack of glass cards to *suggest* depth. This one builds an
   actual isometric scene: real six-face CSS cubes (crates) sitting
   in a 3D world (perspective + preserve-3d + translateZ), on a
   perspective warehouse floor, with independent-speed floating
   telemetry cards and a scan beam sweeping the yard. The whole
   world tilts on a slow autonomous drift AND responds to the
   pointer — two motion sources composited via CSS custom
   properties, not JS style writes per frame beyond one rAF-gated
   pointer handler (identical performance discipline to before: no
   canvas, compositor-friendly transforms, prefers-reduced-motion
   kills all of it and freezes the scene in its resting pose).

   Palette shift: charcoal/graphite base (not navy), amber as the
   single strong brand accent (warehouse signal-light amber, not
   generic SaaS blue), with a cool cyan rim-light used sparingly on
   glass edges for depth — not as a second brand color.
   ══════════════════════════════════════════════════════════════ */

/* ── Icons (inline, no extra deps) ── */
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = ({ off }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {off ? (
      <>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6 0-10-7-10-7a18.6 18.6 0 0 1 4.22-5.06M9.9 4.24A9.4 9.4 0 0 1 12 4c6 0 10 7 10 7a18.6 18.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

/* Warehouse telemetry the login scene hints at — presented as real
   isometric crates + floating instrument cards, not a card list. */
const CRATES = [
  { size: 78, x: -150, y: 40,  z: 40,  ry: 22, delay: 0,    dur: 9  },
  { size: 56, x: 40,   y: 110, z: -30, ry: -18, delay: 0.6,  dur: 10 },
  { size: 64, x: 170,  y: -10, z: 10,  ry: 35, delay: 1.1,  dur: 8.5 },
  { size: 46, x: -60,  y: -90, z: 70,  ry: -10, delay: 0.3,  dur: 11 },
  { size: 52, x: 210,  y: 100, z: -60, ry: 14, delay: 1.5,  dur: 9.5 },
  { size: 40, x: -190, y: -60, z: -10, ry: 40, delay: 0.9,  dur: 10.5 },
];

const READOUTS = [
  { label: "Items Tracked",  value: "2,481", depth: 0.55, x: "6%",  y: "18%" },
  { label: "Stock Accuracy", value: "98.6%", depth: 0.85, x: "62%", y: "8%"  },
  { label: "Active Trials",  value: "24",    depth: 0.35, x: "70%", y: "62%" },
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);
  const { isDark, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const sceneRef = useRef(null);
  const cardRef = useRef(null);
  const rafPending = useRef(false);
  const pointerPos = useRef({ x: 0.5, y: 0.5 });

  const reduceMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { username: "", password: "" } });

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
    return () => dispatch(clearAuthError());
  }, [token, navigate, dispatch]);

  /* Session id — cosmetic only, generated once per mount */
  const sessionId = useMemo(
    () =>
      Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 0xffff)
          .toString(16)
          .toUpperCase()
          .padStart(4, "0")
      ).join("-"),
    []
  );

  /* ── Pointer-driven parallax for the isometric world + card tilt ──
     One rAF-gated handler. Repeated mousemove events during a single
     frame collapse into one style write; the listener is passive
     (never calls preventDefault) and is fully removed on unmount.
     Skipped entirely under prefers-reduced-motion, in which case the
     scene keeps its slow autonomous CSS-only drift but never reacts
     to the pointer. */
  useEffect(() => {
    if (reduceMotion) return undefined;
    const scene = sceneRef.current;
    if (!scene) return undefined;

    const applyTransforms = () => {
      rafPending.current = false;
      const { x, y } = pointerPos.current;
      const px = x - 0.5;
      const py = y - 0.5;

      scene.style.setProperty("--px", px.toFixed(4));
      scene.style.setProperty("--py", py.toFixed(4));

      const card = cardRef.current;
      if (card) {
        card.style.setProperty("--tiltX", `${(-py * 5).toFixed(2)}deg`);
        card.style.setProperty("--tiltY", `${(px * 7).toFixed(2)}deg`);
        card.style.setProperty("--glowX", `${(px * 0.5 + 0.5) * 100}%`);
        card.style.setProperty("--glowY", `${(py * 0.5 + 0.5) * 100}%`);
      }
    };

    const handlePointerMove = (e) => {
      const rect = scene.getBoundingClientRect();
      pointerPos.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
      if (!rafPending.current) {
        rafPending.current = true;
        requestAnimationFrame(applyTransforms);
      }
    };

    const handlePointerLeave = () => {
      pointerPos.current = { x: 0.5, y: 0.5 };
      if (!rafPending.current) {
        rafPending.current = true;
        requestAnimationFrame(applyTransforms);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    scene.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      scene.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [reduceMotion]);

  const onSubmit = (data) => dispatch(loginAsync(data));

  return (
    <div
      className="loginV2"
      data-reduce-motion={reduceMotion ? "true" : "false"}
      data-theme-dark={isDark ? "true" : "false"}>
      {/* ── Top bar: brand mark + theme toggle, sits above the scene ── */}
      <header className="loginV2__topbar">
        <div className="loginV2__brand">
          <span className="loginV2__brand-mark">
            <img src={logoHexagon} alt="" />
          </span>
          <span className="loginV2__brand-word">DIPAS</span>
        </div>

        <button
          type="button"
          className="loginV2__theme"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          <span className="loginV2__theme-track">
            <span className="loginV2__theme-thumb">
              {isDark ? <IconMoon /> : <IconSun />}
            </span>
          </span>
        </button>
      </header>

      <div className="loginV2__content">
        {/* ══ Left — isometric warehouse-yard 3D scene ══ */}
        <div className="loginV2__stage">
          <div className="loginV2__scene" ref={sceneRef}>

            {/* Ambient glow blobs (amber signal + cool cyan rim) */}
            <span className="loginV2__glow loginV2__glow--amber" aria-hidden="true" />
            <span className="loginV2__glow loginV2__glow--cyan" aria-hidden="true" />

            {/* Perspective world: floor plane + crates + scan beam */}
            <div className="loginV2__world">
              <div className="loginV2__floor" aria-hidden="true">
                <span className="loginV2__floor-beam" />
              </div>

              <div className="loginV2__crates" aria-hidden="true">
                {CRATES.map((c, i) => (
                  <div
                    className="crate"
                    key={i}
                    style={{
                      "--size": `${c.size}px`,
                      "--x": `${c.x}px`,
                      "--y": `${c.y}px`,
                      "--z": `${c.z}px`,
                      "--ry": `${c.ry}deg`,
                      "--delay": `${c.delay}s`,
                      "--dur": `${c.dur}s`,
                    }}>
                    <div className="crate__face crate__face--front" />
                    <div className="crate__face crate__face--back" />
                    <div className="crate__face crate__face--right" />
                    <div className="crate__face crate__face--left" />
                    <div className="crate__face crate__face--top" />
                    <div className="crate__face crate__face--bottom" />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating glass telemetry cards — independent parallax depth */}
            <div className="loginV2__readouts" aria-hidden="true">
              {READOUTS.map((r) => (
                <div
                  className="readout"
                  key={r.label}
                  style={{ "--depth": r.depth, left: r.x, top: r.y }}>
                  <span className="readout__value">{r.value}</span>
                  <span className="readout__label">{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Copy sits above the scene, unaffected by 3D transforms */}
          <div className="loginV2__copy">
            <h1 className="loginV2__tagline loginV2__reveal" style={{ "--d": "0.05s" }}>
              Manage Defence Products,
              <em> Down to the Crate.</em>
            </h1>
            <p className="loginV2__desc loginV2__reveal" style={{ "--d": "0.12s" }}>
              One secure command center for items, IPR, and field trials —
              built for the pace defence programs actually move at.
            </p>
            <div className="loginV2__status loginV2__reveal" style={{ "--d": "0.19s" }}>
              <span className="loginV2__status-item">
                <span className="loginV2__status-dot" />
                SECURE CHANNEL
              </span>
              <span className="loginV2__status-sep">·</span>
              <span className="loginV2__status-item">AES-256 ENCRYPTED</span>
            </div>
          </div>
        </div>

        {/* ══ Right — auth card ══ */}
        <div className="loginV2__aside">
          <div className="loginV2__card loginV2__card--enter" ref={cardRef}>
            <div className="loginV2__card-glow" aria-hidden="true" />

            <div className="loginV2__card-inner">
              <h2 className="loginV2__title">Welcome back</h2>
              <p className="loginV2__subtitle">Sign in with your DIPAS credentials to continue</p>

              {error && (
                <div className="loginV2__error" role="alert">
                  <IconAlert />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Username */}
                <div className="field-group">
                  <div className={`field-wrap ${focusField === "username" ? "field-wrap--focus" : ""} ${errors.username ? "field-wrap--error" : ""}`}>
                    <span className="field-icon"><IconUser /></span>
                    <input
                      id="login-username"
                      className="field-input"
                      placeholder=" "
                      autoComplete="username"
                      onFocus={() => setFocusField("username")}
                      onBlur={() => setFocusField(null)}
                      {...register("username", { required: "Username is required" })}
                    />
                    <label className="field-label" htmlFor="login-username">Username</label>
                  </div>
                  {errors.username && (
                    <span className="field-error"><IconAlert />{errors.username.message}</span>
                  )}
                </div>

                {/* Password */}
                <div className="field-group">
                  <div className={`field-wrap ${focusField === "password" ? "field-wrap--focus" : ""} ${errors.password ? "field-wrap--error" : ""}`}>
                    <span className="field-icon"><IconLock /></span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      className="field-input field-input--pw"
                      placeholder=" "
                      autoComplete="current-password"
                      onFocus={() => setFocusField("password")}
                      onBlur={() => setFocusField(null)}
                      {...register("password", { required: "Password is required" })}
                      onKeyUp={(e) => {
                        if (typeof e.getModifierState === "function") {
                          setCapsLockOn(e.getModifierState("CapsLock"));
                        }
                      }}
                    />
                    <label className="field-label" htmlFor="login-password">Password</label>
                    <button
                      type="button"
                      className="field-eye"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}>
                      <IconEye off={showPassword} />
                    </button>
                  </div>
                  {capsLockOn && !errors.password && (
                    <span className="field-warning"><IconAlert />Caps Lock is on</span>
                  )}
                  {errors.password && (
                    <span className="field-error"><IconAlert />{errors.password.message}</span>
                  )}
                </div>

                <button type="submit" className="loginV2__submit" disabled={loading}>
                  <span className="loginV2__submit-sheen" aria-hidden="true" />
                  {loading ? (
                    <>
                      <span className="loginV2__spinner" />
                      Signing in&hellip;
                    </>
                  ) : (
                    <>
                      Sign In
                      <IconArrow />
                    </>
                  )}
                </button>
              </form>

              <div className="loginV2__secure">
                <span className="loginV2__secure-icon"><IconShield /></span>
                <div>
                  <div className="loginV2__secure-title">Your data is protected</div>
                  <div className="loginV2__secure-sub">with enterprise-grade encryption</div>
                </div>
              </div>

              <p className="loginV2__footer-note">
                © DRDO DIPAS Product Management · SID {sessionId}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}