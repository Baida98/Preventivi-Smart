import { createRoot } from "react-dom/client";
  import App from "./App";
  import { ErrorBoundary } from "./components/ErrorBoundary";
  import "./index.css";

  /**
   * Global error tracking — collects unhandled errors in production.
   * Replace the console.error calls below with your preferred error
   * tracking service (e.g. Sentry.captureException) when ready.
   *
   * To integrate Sentry:
   *   1. pnpm add @sentry/react
   *   2. Replace the stubs below with:
   *        import * as Sentry from "@sentry/react";
   *        Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, ... });
   */
  function initErrorTracking() {
    if (import.meta.env.DEV) return; // Only in production

    window.onerror = (message, source, lineno, colno, error) => {
      console.error("[ErrorTracking] Unhandled error:", { message, source, lineno, colno, error });
      // TODO: Sentry.captureException(error);
      return false;
    };

    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      console.error("[ErrorTracking] Unhandled promise rejection:", event.reason);
      // TODO: Sentry.captureException(event.reason);
    };
  }

  initErrorTracking();

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  