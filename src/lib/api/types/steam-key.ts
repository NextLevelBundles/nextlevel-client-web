import MediaData from "@/app/(shared)/types/media";
import { GiftFilterType } from "./purchase";

export interface SteamKeyAssignment {
  id: string;
  steamKeyId: string;
  customerId: string;
  productId: string;
  productTitle: string;
  productCoverImage?: MediaData;
  steamGameMetadata?: {
    website?: string;
    protonDbTier?: string;
    pcRequirements?: {
      minimum?: string;
      recommended?: string;
    };
    macRequirements?: {
      minimum?: string;
      recommended?: string;
    };
    linuxRequirements?: {
      minimum?: string;
      recommended?: string;
    };
    developers?: Array<{
      name: string;
      website?: string;
    }>;
    publishers?: Array<{
      name: string;
      website?: string;
    }>;
    releaseDate?: {
      date: string;
    } | null;
    platforms?: string[];
    trailerUrl?: string;
    screenshotUrlsJson?: string | null;
    steamAppId?: number;
  };
  status: "Assigned" | "Revealed" | "Expired" | "Refunded";
  assignedAt: string;
  expiresAt: string;
  revealedAt: string | null;
  refundedAt: string | null;
  steamKeyValue: string | null;
  giftAccepted: boolean | null;
  isGift: boolean;
  isPurchaseGift: boolean;
  giftAcceptedAt: string | null;
  giftedByCustomerName?: string;
  giftedByCustomerId?: string;
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftMessage?: string;
  giftedAt?: string;
  exchangeCredits?: number | null;
  isExisting: boolean;
}

export interface SteamKeyQueryParams {
  searchQuery?: string;
  status?: "Assigned" | "Revealed" | "Expired" | "Refunded";
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
  isSuccess: boolean;
  lastSyncedAt: string;
  lastSyncWasSuccessful: boolean;
  errorMessage?: string;
}

export interface SteamLibraryStatusResponse {
  lastSyncedAt: string | null;
  lastSyncWasSuccessful: boolean | null;
}
