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
    /Unexpected private name/, // Private class methods unsupported on older browsers (Safari < 15)
    "invalid origin", // Third-party script origin validation (e.g., Cookiebot in privacy-focused browsers)
    /captured as promise rejection/, // Non-error promise rejections (CustomEvents from third-party scripts)
    /Can't find variable: (CONFIG|currentInset|EmptyRanges)/, // Injected scripts (Twitter in-app browser, Safari internals)
  ],
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    /^safari-extension:\/\//,
    /^safari-web-extension:\/\//,
    /^webkit-masked-url:\/\//,
    /userscript/i, // Userscript managers (Tampermonkey, Violentmonkey, Greasemonkey)
    // Third-party scripts
    /\.millennium\//, // Steam Millennium mod
    /\/uc\.js$/, // Cookiebot
    /\/cc\.js/, // Cookiebot consent control
    /inject_content\.js/, // Facebook in-app browser injected scripts
  ],

  // Drop events where the error originates from non-app sources (extensions, userscripts, etc.)
  beforeSend(event) {
    const frames = event.exception?.values
      ?.flatMap((v) => v.stacktrace?.frames ?? []);

    if (frames && frames.length > 0) {
      const isNonAppSource = (filename: string) =>
        filename.startsWith("chrome-extension://") ||
        filename.startsWith("moz-extension://") ||
        filename.startsWith("safari-extension://") ||
        filename.startsWith("safari-web-extension://") ||
        filename.startsWith("webkit-masked-url://") ||
        filename.includes("extensions/") ||
        /userscript/i.test(filename);

      // Drop if no app frames exist
      const hasAppFrame = frames.some(
        (frame) => frame.in_app && !isNonAppSource(frame.filename ?? "")
      );
      if (!hasAppFrame) return null;

      // Drop if the error originates from a non-app source (top of stack)
      const topFrame = frames[frames.length - 1];
      if (topFrame && isNonAppSource(topFrame.filename ?? "")) return null;
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