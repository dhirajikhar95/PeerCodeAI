import { Component } from "react";

/**
 * Error Boundary specifically for the session/video call area.
 * When Stream SDK throws (e.g., call deleted server-side), this catches it
 * and shows a redirect message instead of crashing the entire React tree to a blank page.
 */
class SessionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[SessionErrorBoundary] Caught error:", error.message);
    console.error("[SessionErrorBoundary] Component stack:", errorInfo?.componentStack);

    // Auto-redirect after a short delay
    const { sessionType, sessionId } = this.props;
    const target =
      sessionType !== "class" && sessionId
        ? `/feedback/${sessionId}`
        : "/dashboard";

    setTimeout(() => {
      window.location.href = target;
    }, 1500);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-base-100 rounded-lg">
          <div className="text-center p-8">
            <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-base-content mb-2">
              Session ended
            </p>
            <p className="text-base-content/60">Redirecting you now…</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SessionErrorBoundary;
