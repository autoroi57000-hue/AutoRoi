// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1744d84d59e5697613cbe5f77478a1f2@o4511032112709632.ingest.de.sentry.io/4511032134008912",

  // Performance monitoring: sample 20% in production, 100% in dev
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Session replay: capture 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.replayIntegration()],

  // Enable logs
  enableLogs: true,

  // Filter sensitive data before sending to Sentry
  beforeSend(event) {
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>;
      delete data.card;
      delete data.password;
      delete data.mot_de_passe;
      delete data.token;
      delete data.secret;
      delete data.credit_card;
    }

    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }

    return event;
  },
});
