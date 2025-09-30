// Trackdesk tracking utilities
// Documentation: https://trackdesk.com/docs

/**
 * Get the Trackdesk Click ID (cid) from cookie
 * Trackdesk stores the cid in a cookie when users arrive via affiliate links
 * Cookie format: trakdesk_cid = {"tenantId":"digiphile","cid":"uuid"}
 */
export function getTrackdeskCid(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");

      // Look for Trackdesk cookie (note: it's "trakdesk" without 'c' in track)
      if (name === "trakdesk_cid" || name === "trackdesk_cid") {
        const decodedValue = decodeURIComponent(value);

        // Parse JSON to extract cid
        try {
          const data = JSON.parse(decodedValue);
          if (data.cid) {
            return data.cid;
          }
        } catch (parseError) {
          // If not JSON, return the raw value
          return decodedValue;
        }
      }
    }

    // If no cookie found, try to access from Trackdesk global object
    const trackdeskGlobal = (window as any).trackdesk;
    if (trackdeskGlobal && typeof trackdeskGlobal.getCid === "function") {
      return trackdeskGlobal.getCid();
    }

    return null;
  } catch (error) {
    console.error("Error getting Trackdesk cid:", error);
    return null;
  }
}

/**
 * Check if Trackdesk tracking is active (cid exists)
 */
export function hasTrackdeskCid(): boolean {
  return getTrackdeskCid() !== null;
}
