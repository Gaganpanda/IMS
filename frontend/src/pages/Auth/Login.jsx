import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync, clearAuthError } from "../../redux/slices/authSlice";
import "./Login.css";
import logoHexagon from "../../assets/logo-hexagon.webp";
import illustration from "../../assets/illustration.webp";

/* ── Icons (inline, no extra deps) ── */
const IconUser = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = ({ off }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
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
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconShield = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconAlert = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconBox = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="m21 8-9-5-9 5 9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

const IconLayers = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const IconShieldSm = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3z" />
  </svg>
);

const IconFlask = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V2" />
    <path d="M8.5 2h7" />
    <path d="M7 15h10" />
  </svg>
);

const IconDoc = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const FEATURES = [
  { icon: <IconBox />, label: "Inventory" },
  { icon: <IconLayers />, label: "Variants" },
  { icon: <IconShieldSm />, label: "IPR" },
  { icon: <IconFlask />, label: "Trials" },
  { icon: <IconDoc />, label: "Documentation" },
];

/* ── Main component ── */
export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  // const bgRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
    return () => dispatch(clearAuthError());
  }, [token, navigate, dispatch]);

  /* Subtle mouse-parallax for the background orbs/dots */
  // useEffect(() => {
  //   const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  //   if (mq.matches) return;

  //   const handleMove = (e) => {
  //     if (!bgRef.current) return;
  //     const x = (e.clientX / window.innerWidth - 0.5) * 24;
  //     const y = (e.clientY / window.innerHeight - 0.5) * 24;
  //     bgRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  //   };
  //   window.addEventListener("mousemove", handleMove);
  //   return () => window.removeEventListener("mousemove", handleMove);
  // }, []);

  const onSubmit = (data) => dispatch(loginAsync(data));

  return (
    <div className="login">
      {/* Decorative background */}
      <div className="login__bg">
        {" "}
        <div className="login__grid" />
        <div className="login__dots" />
        <div className="login__orb login__orb--tr" />
        <div className="login__orb login__orb--bl" />
        <div className="login__orb login__orb--br" />
      </div>

      <div className="login__content">
        {/* ── Left panel ── */}
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
            Manage Defence
            <br />
            Products <em>Smarter.</em>
          </h1>

          <p className="login__desc">
            Securely access the Defence Item Management System.
          </p>

          <div className="login__features">
            {FEATURES.map((f) => (
              <div key={f.label} className="login__feature">
                <span className="login__feature-icon">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          <div className="login__illustration-wrap">
            <img className="login__illustration" src={illustration} alt="" />
          </div>

          <div className="login__status">
            <span className="login__status-dot" />
            SECURE CHANNEL · ENCRYPTED CONNECTION ACTIVE
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login__right">
          <div className="login__card">
            <div className="login__card-logo">
              <span className="login__logo-ring" />
              <img src={logoHexagon} alt="DIPAS" />
            </div>

            <h2 className="login__title">Welcome Back</h2>
            <p className="login__subtitle">Sign in to continue</p>

            {error && (
              <div className="login__error">
                <IconAlert />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Username */}
              <div className="form-group">
                <div className="input-wrap">
                  <span className="input-icon">
                    <IconUser />
                  </span>
                  <input
                    className={`form-control ${errors.username ? "form-control--error" : ""}`}
                    placeholder="Enter your username"
                    autoComplete="username"
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
                <div className="input-wrap">
                  <span className="input-icon">
                    <IconLock />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control form-control--pw ${errors.password ? "form-control--error" : ""}`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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

              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading}>
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
                <div className="login__secure-title">
                  Your data is protected
                </div>
                <div className="login__secure-sub">
                  with enterprise-grade security
                </div>
              </div>
            </div>

            <p className="login__footer-note">
              © DRDO DIPAS Product Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
