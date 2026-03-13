// Sentry client initialization is handled by sentry.client.config.ts
// Do NOT call Sentry.init() here — it causes double Replay instances

import * as Sentry from "@sentry/nextjs";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
