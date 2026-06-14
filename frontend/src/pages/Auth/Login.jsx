import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync, clearAuthError } from "../../redux/slices/authSlice";
import "./Login.css";
import productLogo from "../../assets/order.png";

/* ── Subtle floating-dots canvas for the blue left panel ── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const DOTS = 38;
    const MAX_DIST = 130;
    let W, H, particles = [];

    const rand = (a, b) => Math.random() * (b - a) + a;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function init() {
      particles = Array.from({ length: DOTS }, () => ({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.28, 0.28), vy: rand(-0.28, 0.28),
        r: rand(1.5, 2.8),
        pulse: rand(0, Math.PI * 2),
        ps: rand(0.01, 0.022),
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      /* lines */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / MAX_DIST) * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      /* dots */
      particles.forEach((p) => {
        p.pulse += p.ps;
        const g = 0.5 + 0.5 * Math.sin(p.pulse);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.25 * g})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });

      raf = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(canvas);
    resize(); init(); draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} id="particle-canvas" />;
}

/* ── Main component ── */
export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
    return () => dispatch(clearAuthError());
  }, [token, navigate, dispatch]);

  const onSubmit = (data) => dispatch(loginAsync(data));

  return (
    <div className="login">

      {/* ── Left panel ── */}
      <div className="login__left">
        <ParticleCanvas />

        <div className="login__left-content">

          {/* Brand */}
          <div className="login__brand">
            <div className="login__brand-icon">
              <img src={productLogo} alt="IMS" />
            </div>
            <div>
              <div className="login__brand-title">ITEM</div>
              <div className="login__brand-sub">MANAGEMENT SYSTEM</div>
            </div>
          </div>

          {/* Headline */}
          <h2 className="login__tagline">
            Track. Manage.<br />
            <em>Deliver.</em>
          </h2>

          <p className="login__desc">
            A unified platform for managing defence items from development
            to deployment — with real-time tracking and complete visibility.
          </p>

          {/* Features */}
          <div className="login__features">
            {[
              "Real-time development status tracking",
              "ToT & IPR document management",
              "Trial stakeholder coordination",
              "Procurement & supply chain visibility",
            ].map((f) => (
              <div key={f} className="login__feature">
                <span className="login__feature-dot">✓</span>
                {f}
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="login__status">
            <div className="login__status-dot" />
            SYSTEM ONLINE · SECURE CHANNEL ACTIVE
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="login__right">
        <div className="login__card">

          {/* Mobile logo */}
          <div className="login__card-logo">
            <div className="login__card-logo-icon">IMS</div>
            <span>Item Management System</span>
          </div>

          {/* Card header — matches dashboard card header style */}
          <div className="login__card-header">
            <div className="login__card-header-icon">
              {/* Lock icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h1 className="login__title">Welcome back</h1>
              <p className="login__subtitle">Sign in to your administrator account</p>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="login__error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ width: 15, height: 15, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Username */}
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className={`form-control ${errors.username ? "form-control--error" : ""}`}
                placeholder="Enter your username"
                autoComplete="username"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && (
                <span className="form-error">{errors.username.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? "form-control--error" : ""}`}
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <span className="form-error">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login__spinner" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="login__divider">
            <span>Authorised personnel only</span>
          </div>

          <p className="login__footer-note">
            All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}