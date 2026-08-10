import { Component } from "react";
import "./ErrorBoundary.css";

/**
 * Top-level error boundary.
 *
 * React error boundaries must be class components — there is no hook
 * equivalent (getDerivedStateFromError / componentDidCatch have no
 * hook-based counterpart as of React 18). This catches render-time
 * errors anywhere below it in the tree and shows a graceful fallback
 * instead of an unhandled blank screen, which is the single most
 * common "silent bug" a user hits in production.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Centralised place to hook up real error reporting
    // (Sentry, LogRocket, etc.) later without touching call sites.
    console.error("[ErrorBoundary] Unhandled UI error:", error, info?.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__card animate-scale-in">
            <div className="error-boundary__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="13" />
                <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
              </svg>
            </div>
            <h1>Something went wrong</h1>
            <p>
              An unexpected error occurred while rendering this page. You can
              try reloading — if the problem continues, please contact support.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="error-boundary__details">{String(this.state.error?.message || this.state.error)}</pre>
            )}
            <button type="button" className="btn btn--primary" onClick={this.handleReload}>
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
