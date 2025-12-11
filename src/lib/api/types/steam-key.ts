import MediaData from "@/app/(shared)/types/media";
import { GiftFilterType } from "./purchase";

/**
 * Represents the synchronization status of a Steam library
 */
export enum SteamLibrarySyncStatus {
  /**
   * Library has never been synchronized
   */
  NeverSynced = 1,

  /**
   * Synchronization completed successfully
   */
  SyncSucceeded = 2,

  /**
   * Synchronization encountered a technical error (network issue, API error, etc.)
   */
  SyncError = 3,

  /**
   * Synchronization completed but didn't achieve the expected result (e.g., validation failed, incomplete data, user profile is private)
   */
  SyncFailed = 4
}

export interface SteamKeyAssignment {
  id: string;
  steamKeyId: string;
  customerId: string;
  productTitle: string;
  productCoverImage: MediaData;
  title: string;
  coverImage: MediaData;
  steamGameMetadata: {
    website: string | null;
    protonDbTier: string | null;
    pcRequirements: string | null;
    macRequirements: string | null;
    linuxRequirements: string | null;
    developers: string[];
    publishers: string[];
    releaseDate: string | null;
    platforms: string | null;
    trailerUrl: string | null;
    screenshotUrlsJson: string | null;
    steamAppId: number;
  };
  status: "Assigned" | "Revealed" | "Expired" | "Refunded" | "Revoked";
  assignedAt: string;
  expiresAt: string;
  revealedAt: string | null;
  refundedAt: string | null;
  revokedAt: string | null;
  steamKeyValue: string | null;
  giftAccepted: boolean;
  isGift: boolean;
  isPurchaseGift: boolean | null;
  giftAcceptedAt: string | null;
  giftedByCustomerName: string;
  giftedByCustomerId: string;
  giftRecipientEmail: string;
  giftRecipientName: string;
  giftMessage: string;
  giftedAt: string;
  giftExpiresAt: string | null;
  giftCartItemId: string | null;
  exchangeCredits: number;
  alreadyOwnedOnSteam: boolean;
}

export interface SteamKeyQueryParams {
  searchQuery?: string;
  status?: "Assigned" | "Revealed" | "Expired" | "Refunded" | "Revoked";
  giftFilter?: GiftFilterType;
}

export interface RevealKeyResponse extends SteamKeyAssignment {
  steamKeyValue: string; // This is guaranteed to be present in the response
}

export interface ViewKeyResponse {
  steamKeyValue?: string;
}

export interface GiftKeyRequest {
  steamKeyAssignmentId: string;
  giftRecipientEmail: string;
  giftRecipientName?: string;
  giftMessage?: string;
}

export interface GiftKeyResponse {
  success: boolean;
  message: string;
}

export interface StatusCount {
  status: string | null;
  label: string;
  count: number;
}

export interface SyncSteamLibraryResponse {
  lastSyncedAt: string;
  steamLibrarySyncStatus: string; // API returns string values like "SyncSucceeded", "NeverSynced", etc.
  errorMessage?: string;
}

export interface SteamLibraryStatusResponse {
  lastSyncedAt: string;
  steamLibrarySyncStatus: string; // API returns string values like "SyncSucceeded", "NeverSynced", etc.
}

export interface BundleExchangeInfo {
  productId: string;
  productTitle: string;
  exchangedCount: number;
  totalGamesInBundle: number;
}
