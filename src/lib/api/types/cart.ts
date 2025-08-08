export interface CartItem {
  id: string;
  customerId: string;
  type: "Listing" | "Bundle";
  listingId?: string;
  bundleId?: string;
  bundleTierId?: string;
  quantity: number;
  price: number;
  snapshotTitle?: string;
  snapshotImageUrl?: string;
  snapshotPlatform?: string;
  snapshotTierTitle?: string;
  snapshotTierPrice?: number;
  snapshotProducts: {
    productId: string;
    title: string;
    coverImageUrl: string;
    steamGameInfo?: {
      steamAppId?: number;
      packageId: string;
      steamKeyId: string;
    };
  }[];
  // Gift functionality fields
  isGift?: boolean;
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftMessage?: string;
  canOnlyBeGifted?: boolean;

  // Donation tier fields
  isDonationTierSelected?: boolean;
  donationTierAmount?: number;

  // Transaction timestamps
  createdAt?: string;
  completedAt?: string | null;

  // Incoming gift fields (when current user received this as a gift)
  giftedByCustomerName?: string;
  giftedAt?: string;

  // Gift acceptance tracking
  giftAccepted?: boolean | null;
  giftAcceptedAt?: string | null;
}

export interface Cart {
  id: string;
  items: CartItem[];
  reservationStatus: "None" | "Active" | "Completed" | "Failed" | "Expired";
  reservedAt?: string;
  reservationExpiresAt?: string;
  total: number;
}

export interface AddToCartRequest {
  bundleId: string;
  tierId: string;
  price: number;
  isDonationTier?: boolean;
  donationAmount?: number;
  giftRecipientEmail?: string;
}

export interface UpdateGiftRequest {
  isGift: boolean;
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftMessage?: string;
}
