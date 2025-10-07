// Trackdesk tracking utilities
// Documentation: https://trackdesk.com/docs

const TRACKDESK_STORAGE_KEY = 'trackdesk_data';

interface TrackdeskData {
  clickId?: string;
  linkId?: string;
}

/**
 * Get the stored Trackdesk data from localStorage
 */
function getTrackdeskData(): TrackdeskData {
  if (typeof window === "undefined") return {};

  try {
    const data = localStorage.getItem(TRACKDESK_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error getting Trackdesk data:", error);
    return {};
  }
}

/**
 * Update the Trackdesk data in localStorage
 */
function updateTrackdeskData(updates: Partial<TrackdeskData>): void {
  if (typeof window === "undefined") return;

  try {
    const currentData = getTrackdeskData();
    const newData = { ...currentData, ...updates };
    localStorage.setItem(TRACKDESK_STORAGE_KEY, JSON.stringify(newData));
  } catch (error) {
    console.error("Error updating Trackdesk data:", error);
  }
}

/**
 * Get the Trackdesk Click ID (cid) from localStorage
 * The cid is stored by the Trackdesk script when users arrive via affiliate links
 */
export function getTrackdeskCid(): string | null {
  const data = getTrackdeskData();
  return data.clickId || null;
}

/**
 * Store the Trackdesk Click ID
 */
export function setTrackdeskCid(clickId: string): void {
  updateTrackdeskData({ clickId });
}

/**
 * Check if Trackdesk tracking is active (cid exists)
 */
export function hasTrackdeskCid(): boolean {
  return getTrackdeskCid() !== null;
}

/**
 * Get the linkId query parameter from localStorage
 * The linkId is stored when users arrive via affiliate links with the linkId parameter
 */
export function getLinkId(): string | null {
  const data = getTrackdeskData();
  return data.linkId || null;
}

/**
 * Extract and store linkId from URL query parameters
 * Call this on page load to capture the linkId parameter
 */
export function captureLinkIdFromUrl(): void {
  if (typeof window === "undefined") return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get('linkId');

    if (linkId) {
      updateTrackdeskData({ linkId });
    }
  } catch (error) {
    console.error("Error capturing linkId:", error);
  }
}
