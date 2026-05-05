import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

/**
 * Global error tracking — collects unhandled errors in production.
 */
function initErrorTracking() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const env = import.meta.env.MODE;

  if (!dsn || import.meta.env.DEV) {
    console.log("[ErrorTracking] Sentry disabled (no DSN or DEV mode)");
    return;
  }

  Sentry.init({
    dsn: dsn,
    environment: env,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: env === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

initErrorTracking();

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<div>Si è verificato un errore imprevisto.</div>}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </Sentry.ErrorBoundary>
);
