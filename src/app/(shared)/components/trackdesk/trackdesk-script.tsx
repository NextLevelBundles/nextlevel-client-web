"use client";

import Script from "next/script";

export function TrackdeskScript() {
  // Access env variable directly - Next.js inlines NEXT_PUBLIC_ vars at build time
  const tenantId = process.env.NEXT_PUBLIC_TRACKDESK_TENANT_ID;

  // Skip if not configured
  if (!tenantId || tenantId === "your_trackdesk_tenant_id") {
    return null;
  }

  return (
    <>
      {/* Load Trackdesk tracking library and initialize */}
      <Script
        id="trackdesk-cdn"
        src="//cdn.trackdesk.com/tracking.js"
        strategy="afterInteractive"
      />

      {/* Initialize Trackdesk click tracking after library loads */}
      <Script
        id="trackdesk-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(t,d,k){(t[k]=t[k]||[]).push(d);t[d]=t[d]||t[k].f||function(){(t[d].q=t[d].q||[]).push(arguments)}})(window,"trackdesk","TrackdeskObject");

            // Wait for trackdesk to be available, then initialize
            function initTrackdesk() {
              if (typeof trackdesk !== 'undefined') {
                trackdesk("${tenantId}", "click");
              } else {
                setTimeout(initTrackdesk, 100);
              }
            }

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', initTrackdesk);
            } else {
              initTrackdesk();
            }
          `,
        }}
      />
    </>
  );
}