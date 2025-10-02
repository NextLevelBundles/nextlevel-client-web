// Trackdesk tracking utilities
// Documentation: https://trackdesk.com/docs

const TRACKDESK_STORAGE_KEY = 'trackdesk_data';

interface TrackdeskData {
  clickId?: string;
  affS1?: string;
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
 * Get the affS1 query parameter from localStorage
 * The affS1 is stored when users arrive via affiliate links with the affS1 parameter
 */
export function getAffS1(): string | null {
  const data = getTrackdeskData();
  return data.affS1 || null;
}

/**
 * Extract and store affS1 from URL query parameters
 * Call this on page load to capture the affS1 parameter
 */
export function captureAffS1FromUrl(): void {
  if (typeof window === "undefined") return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const affS1 = urlParams.get('affS1');

    if (affS1) {
      updateTrackdeskData({ affS1 });
    }
  } catch (error) {
    console.error("Error capturing affS1:", error);
  }
}
