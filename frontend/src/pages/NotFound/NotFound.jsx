import { useNavigate } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found__card animate-fade-in-up">
        <div className="not-found__code">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or may have moved.</p>
        <div className="not-found__actions">
          <button type="button" className="btn btn--secondary" onClick={() => navigate(-1)}>
            Go back
          </button>
          <button type="button" className="btn btn--primary" onClick={() => navigate("/dashboard")}>
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
