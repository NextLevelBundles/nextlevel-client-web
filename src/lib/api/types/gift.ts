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
  assignmentId: string;
  productTitle: string;
  productDescription?: string;
  productImageUrl?: string;
  bundleName?: string;
  giftedByCustomerName: string;
  giftedByCustomerId: string;
  recipientEmail: string;
  recipientName?: string;
  giftMessage?: string;
  createdAt: string;
  expiresAt?: string;
  acceptedAt?: string;
  status: "Pending" | "Accepted" | "Expired" | "Declined";
  recipientHasAccount: boolean;
  steamGameMetadata?: {
    developers?: Array<{ name: string }>;
    publishers?: Array<{ name: string }>;
    releaseDate?: { date: string };
    platforms?: string[];
  };
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