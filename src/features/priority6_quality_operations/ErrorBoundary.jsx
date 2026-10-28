import React from "react";
import { AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";

/**
 * Issue #28 (NFR07) — Implement Error Handling and Reliability
 * ErrorBoundary catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a user-friendly fallback UI.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, send error report to audit/monitoring service
    console.error("[Priority6-ErrorBoundary] Caught unexpected UI error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="mx-auto my-8 max-w-2xl rounded-2xl border border-rose-200 bg-rose-50/60 p-6 sm:p-8 text-slate-800 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-rose-100 p-3 text-rose-600">
              <ShieldAlert size={28} />
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">
                Something went wrong in this module
              </h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                An unexpected rendering error occurred. The application remains running, and you can recover by resetting the module view.
              </p>

              {this.state.error && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-white p-3 font-mono text-xs text-rose-700">
                  {this.state.error.toString()}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 shadow-sm"
                >
                  <RefreshCw size={16} />
                  Reload Module
                </button>

                <button
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <AlertTriangle size={15} />
                  {this.state.showDetails ? "Hide Stack Details" : "View Stack Details"}
                </button>
              </div>

              {this.state.showDetails && this.state.errorInfo && (
                <pre className="mt-4 max-h-48 overflow-y-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-rose-300">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
