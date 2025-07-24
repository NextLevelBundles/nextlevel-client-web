import { GiftFilterType } from "./purchase";

export interface SteamKey {
  id: string;
  steamKeyId: string;
  customerId: string;
  productId: string;
  productTitle: string;
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
      comingSoon: boolean;
      date: string;
    };
    platforms?: string[];
    trailerUrl?: string;
    screenshotUrlsJson?: string;
    steamAppId?: number;
  };
  status: "Assigned" | "Revealed" | "Expired" | "Refunded" | "Gifted";
  assignedAt: string;
  expiresAt?: string | null;
  revealedAt?: string | null;
  refundedAt?: string | null;
  steamKeyValue?: string | null;
  // Legacy properties for backward compatibility
  keyValue?: string | null;
  purchaseId?: string;
  bundleId?: string;
  bundleName?: string;
  bundleTierName?: string;
  purchaseDate?: string;
  platform?: "Steam";
  coverImageUrl?: string;
  steamAppId?: number;
  // Gift-related fields
  isGift?: boolean;
  giftedByCustomerName?: string;
  giftMessage?: string;
  giftedAt?: string;
  // Outgoing gift fields
  giftStatus?: "Pending" | "Accepted" | "Declined";
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftSentAt?: string;
  canBeGifted?: boolean;
}

export interface SteamKeyQueryParams {
  searchQuery?: string;
  status?: "Assigned" | "Revealed" | "Expired" | "Refunded" | "Gifted";
  giftFilter?: GiftFilterType;
}

export interface RevealKeyResponse extends SteamKey {
  steamKeyValue: string; // This is guaranteed to be present in the response
}

export interface ViewKeyResponse {
  steamKeyValue?: string;
}

export interface GiftKeyRequest {
  recipientEmail: string;
  recipientName?: string;
  message?: string;
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
