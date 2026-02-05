export interface SteamGameInfo {
  steamAppId: number;
  packageId: string;
  steamKeyId: string;
}

export interface SnapshotProduct {
  productId: string;
  title: string;
  coverImageUrl: string;
  steamGameInfo?: SteamGameInfo;
}

export interface CartItemGift {
  id: string;
  type: "Bundle" | "Listing";
  createdAt: string;
  completedAt: string | null;
  listingId: string | null;
  bundleId: string | null;
  bundleTierId: string | null;
  quantity: number;
  price: number;
  charityPercentage: number;
  charityAmount: number;
  snapshotTitle: string;
  snapshotImageUrl: string;
  snapshotPlatform: string;
  snapshotTierTitle?: string;
  snapshotTierPrice?: number;
  snapshotProducts: SnapshotProduct[];
  giftedByCustomerId: string;
  giftedByCustomerName: string;
  giftMessage?: string;
  giftedAt: string;
  giftAccepted: boolean | null;
  giftAcceptedAt: string | null;
  recipientEmail?: string;
  recipientHasAccount?: boolean;
}

export interface SteamKeyGift {
  id: string;
  steamKeyId: string;
  title: string;
  headerImage?: string;
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
  status: "Pending" | "Assigned" | "Revealed" | "Expired" | "Refunded";
  assignedAt: string;
  expiresAt: string;
  giftedByCustomerName: string;
  giftMessage: string;
  giftedAt: string;
  giftAccepted: boolean;
  giftAcceptedAt: string | null;
  recipientEmail?: string;
  recipientHasAccount?: boolean;
}

export interface GiftDetailsRequest {
  email: string;
}

export interface AcceptGiftRequest {
  email: string;
}

export interface AcceptGiftResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
}

export interface ExpiredGiftActions {
  canResend: boolean;
  resendDeadline: string | null;
  canRefund: boolean;
  refundDeadline: string | null;
  canClaim: boolean;
  claimDeadline: string | null;
  cannotClaimReason: string | null;
}