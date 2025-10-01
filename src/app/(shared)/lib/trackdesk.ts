// Trackdesk tracking utilities
// Documentation: https://trackdesk.com/docs

/**
 * Get the Trackdesk Click ID (cid) from localStorage
 * The cid is stored by the Trackdesk script when users arrive via affiliate links
 */
export function getTrackdeskCid(): string | null {
  if (typeof window === "undefined") return null;

  try {
    // Read from localStorage instead of cookie
    const clickId = localStorage.getItem('trackdesk_click_id');
    return clickId;
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
