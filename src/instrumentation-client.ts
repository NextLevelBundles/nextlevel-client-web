// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://366d9bad0e6e69b841705c3398b4b755@o4510346714546176.ingest.us.sentry.io/4510346715201536",

  // Ignore errors from browser extensions and third-party scripts
  ignoreErrors: [
    "SteamClient is not defined",
    /Failed to execute 'insertBefore' on 'Node'/, // External DOM modification (extensions, third-party scripts)
    /Invalid regular expression/, // Unsupported regex features on older browsers (iOS < 16.4)
    "invalid origin", // Third-party script origin validation (e.g., Cookiebot in privacy-focused browsers)
  ],
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    /^safari-extension:\/\//,
    /^safari-web-extension:\/\//,
    /^webkit-masked-url:\/\//,
    /userscript\.html/,
    // Third-party scripts
    /\.millennium\//, // Steam Millennium mod
    /\/uc\.js$/, // Cookiebot
  ],

  // Drop events where all stack frames come from non-app sources (extensions, injected scripts, etc.)
  beforeSend(event) {
    const frames = event.exception?.values
      ?.flatMap((v) => v.stacktrace?.frames ?? []);

    if (frames && frames.length > 0) {
      const hasAppFrame = frames.some((frame) => {
        const filename = frame.filename ?? "";
        return (
          frame.in_app &&
          !filename.startsWith("chrome-extension://") &&
          !filename.startsWith("moz-extension://") &&
          !filename.startsWith("safari-extension://") &&
          !filename.startsWith("safari-web-extension://") &&
          !filename.startsWith("webkit-masked-url://") &&
          !filename.includes("extensions/") &&
          !filename.includes("userscript.html")
        );
      });

      if (!hasAppFrame) {
        return null; // Drop — no app code in the stack trace
      }
    }

    return event;
  },

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: false,
    }),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;