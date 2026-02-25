// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://366d9bad0e6e69b841705c3398b4b755@o4510346714546176.ingest.us.sentry.io/4510346715201536",

  // Ignore errors from stale server action calls after deployments
  // (minified action IDs change between builds, stale clients send old IDs)
  beforeSend(event) {
    const message = event.exception?.values?.[0]?.value ?? "";
    const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
    const allInNextRuntime = frames.length > 0 && frames.every(
      (f) => f.filename?.includes("app-page.runtime.prod") || f.filename?.includes("node:events")
    );
    if (allInNextRuntime && /Cannot read properties of undefined/.test(message)) {
      return null;
    }
    return event;
  },

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
