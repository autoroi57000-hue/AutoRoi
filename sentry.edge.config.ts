// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1744d84d59e5697613cbe5f77478a1f2@o4511032112709632.ingest.de.sentry.io/4511032134008912",

  // Performance monitoring: sample 20% in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Enable logs
  enableLogs: true,

  // Do NOT send PII automatically
  sendDefaultPii: false,

  // Filter sensitive data before sending to Sentry
  beforeSend(event) {
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>;
      delete data.card;
      delete data.password;
      delete data.token;
      delete data.secret;
    }

    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }

    return event;
  },
});
