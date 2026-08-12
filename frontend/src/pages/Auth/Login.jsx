import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync, clearAuthError } from "../../redux/slices/authSlice";
import { useTheme } from "../../context/ThemeContext";
import "./Login.css";
import logoHexagon from "../../assets/logo-hexagon.webp";

/* ── Icons (inline, no extra deps) ── */
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = ({ off }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 8-9-5-9 5 9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

const IconLayers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const IconShieldSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3z" />
  </svg>
);

const IconFlask = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V2" />
    <path d="M8.5 2h7" />
    <path d="M7 15h10" />
  </svg>
);

const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

/* Orbiting module nodes — the five things the platform actually manages,
   arranged around the "secure core" emblem rather than a plain bullet list. */
const MODULES = [
  { icon: <IconBox />, label: "Inventory" },
  { icon: <IconLayers />, label: "Variants" },
  { icon: <IconShieldSm />, label: "IPR" },
  { icon: <IconFlask />, label: "Trials" },
  { icon: <IconDoc />, label: "Docs" },
];

/* ── Main component ── */
export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);
  const { isDark, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [focusField, setFocusField] = useState(null);

  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const cardRef = useRef(null);
  const satRefs = useRef([]);
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

  /* Live clock for the HUD readout strip */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

  /* ── Particle network + orbiting satellites, one shared rAF loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const NODE_COUNT = reduceMotion ? 0 : 34;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
    }));

    const readColor = (name, fallback) => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return v || fallback;
    };

    let start = performance.now();

    const draw = (t) => {
      const elapsed = (t - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      const lineColor = readColor("--color-accent-2", "#0f9d8c");
      const dotColor = readColor("--color-primary", "#5b3df0");

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 140) {
            ctx.strokeStyle = lineColor;
            ctx.globalAlpha = (1 - d / 140) * 0.16;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = dotColor;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* Orbiting satellites — tilted ellipse, gentle bob for a 3D feel */
      if (!reduceMotion) {
        const cx = width / 2;
        const cy = height * 0.46;
        const rx = Math.min(width, 560) * 0.4;
        const ry = rx * 0.34;
        satRefs.current.forEach((el, i) => {
          if (!el) return;
          const speed = 0.16;
          const angle = elapsed * speed * (2 * Math.PI) + (i / MODULES.length) * Math.PI * 2;
          const x = cx + Math.cos(angle) * rx;
          const y = cy + Math.sin(angle) * ry;
          const depth = (Math.sin(angle) + 1) / 2; // 0 = back, 1 = front
          const scale = 0.72 + depth * 0.5;
          el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%,-50%) scale(${scale})`;
          el.style.zIndex = String(Math.round(depth * 10));
          el.style.opacity = String(0.55 + depth * 0.45);
        });
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduceMotion, isDark]);

  /* ── 3D tilt on the login card, following the pointer ── */
  const handleCardMove = useCallback(
    (e) => {
      if (reduceMotion) return;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tiltX", `${(-py * 7).toFixed(2)}deg`);
      card.style.setProperty("--tiltY", `${(px * 9).toFixed(2)}deg`);
      card.style.setProperty("--glowX", `${(px * 0.5 + 0.5) * 100}%`);
      card.style.setProperty("--glowY", `${(py * 0.5 + 0.5) * 100}%`);
    },
    [reduceMotion]
  );

  const handleCardLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--tiltX", `0deg`);
    card.style.setProperty("--tiltY", `0deg`);
  }, []);

  const onSubmit = (data) => dispatch(loginAsync(data));

  const clockStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="login">
      {/* ── Ambient background ── */}
      <div className="login__bg" aria-hidden="true">
        <div className="login__grid" />
        <div className="login__scanline" />
        <div className="login__orb login__orb--tr" />
        <div className="login__orb login__orb--bl" />
        <div className="login__orb login__orb--br" />
      </div>

      <button
        type="button"
        className="login__theme-toggle"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        <span className="login__theme-track">
          <span className="login__theme-thumb">
            {isDark ? <IconMoon /> : <IconSun />}
          </span>
        </span>
      </button>

      <div className="login__content">
        {/* ── Left panel — HUD hero ── */}
        <div className="login__left">
          <div className="login__brand">
            <div className="login__brand-icon">
              <span className="login__logo-ring" />
              <img src={logoHexagon} alt="DIPAS" />
            </div>
            <div>
              <div className="login__brand-title">DIPAS</div>
              <div className="login__brand-sub">Product Management</div>
            </div>
          </div>

          <h1 className="login__tagline">
            <span className="login__tagline-line">Manage Defence</span>
            <span className="login__tagline-line">
              Products <em>Smarter.</em>
            </span>
          </h1>

          <p className="login__desc">
            One secure command center for items, IPR, and field trials —
            built for the pace defence programs actually move at.
          </p>

          {/* 3D hex-core stage: rotating emblem + orbiting module nodes */}
          <div className="login__stage" ref={stageRef}>
            <canvas className="login__canvas" ref={canvasRef} />

            <div className="login__hexcore-wrap">
              <div className="login__hexcore">
                <span className="login__hex login__hex--1" />
                <span className="login__hex login__hex--2" />
                <span className="login__hex login__hex--3" />
                <img className="login__hexcore-logo" src={logoHexagon} alt="" />
              </div>
              <span className="login__hexcore-ring" />
            </div>

            {MODULES.map((m, i) => (
              <div
                className="login__sat"
                key={m.label}
                ref={(el) => (satRefs.current[i] = el)}>
                <span className="login__sat-icon">{m.icon}</span>
                <span className="login__sat-label">{m.label}</span>
              </div>
            ))}
          </div>

          <div className="login__status">
            <span className="login__status-item">
              <span className="login__status-dot" />
              SECURE CHANNEL
            </span>
            <span className="login__status-sep">·</span>
            <span className="login__status-item">AES-256 ENCRYPTED</span>
            <span className="login__status-sep">·</span>
            <span className="login__status-item login__status-mono">
              {clockStr}
            </span>
          </div>
        </div>

        {/* ── Right panel — auth card ── */}
        <div className="login__right">
          <div
            className="login__card"
            ref={cardRef}
            onMouseMove={handleCardMove}
            onMouseLeave={handleCardLeave}>
            <svg className="login__card-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <rect x="0.6" y="0.6" width="98.8" height="98.8" rx="4" />
            </svg>

            <div className="login__card-inner">
              <div className="login__card-logo">
                <span className="login__logo-ring" />
                <img src={logoHexagon} alt="DIPAS" />
              </div>

              <h2 className="login__title">Welcome Back</h2>
              <p className="login__subtitle">
                Sign in with your DIPAS credentials to continue
              </p>

              {error && (
                <div className="login__error" role="alert">
                  <IconAlert />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Username */}
                <div className="form-group">
                  <div
                    className={`input-wrap ${focusField === "username" ? "input-wrap--focus" : ""}`}>
                    <span className="input-icon">
                      <IconUser />
                    </span>
                    <input
                      className={`form-control ${errors.username ? "form-control--error" : ""}`}
                      placeholder="Enter your username"
                      autoComplete="username"
                      onFocus={() => setFocusField("username")}
                      onBlur={() => setFocusField(null)}
                      {...register("username", {
                        required: "Username is required",
                      })}
                    />
                  </div>
                  {errors.username && (
                    <span className="form-error">{errors.username.message}</span>
                  )}
                </div>

                {/* Password */}
                <div className="form-group">
                  <div
                    className={`input-wrap ${focusField === "password" ? "input-wrap--focus" : ""}`}>
                    <span className="input-icon">
                      <IconLock />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control form-control--pw ${errors.password ? "form-control--error" : ""}`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      onFocus={() => setFocusField("password")}
                      onBlur={() => setFocusField(null)}
                      {...register("password", {
                        required: "Password is required",
                      })}
                      onKeyUp={(e) => {
                        if (typeof e.getModifierState === "function") {
                          setCapsLockOn(e.getModifierState("CapsLock"));
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="input-eye"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}>
                      <IconEye off={showPassword} />
                    </button>
                  </div>
                  {capsLockOn && !errors.password && (
                    <span className="form-error">Caps Lock is on</span>
                  )}
                  {errors.password && (
                    <span className="form-error">{errors.password.message}</span>
                  )}
                </div>

                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="login__spinner" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <IconArrow />
                    </>
                  )}
                </button>
              </form>

              <div className="login__secure">
                <span className="login__secure-icon">
                  <IconShield />
                </span>
                <div>
                  <div className="login__secure-title">Your data is protected</div>
                  <div className="login__secure-sub">with enterprise-grade security</div>
                </div>
              </div>

              <p className="login__footer-note">
                © DRDO DIPAS Product Management · SID {sessionId}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}