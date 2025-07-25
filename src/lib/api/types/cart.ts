export interface CartItem {
  id: string;
  customerId: string;
  type: "Listing" | "Bundle";
  listingId?: string;
  bundleId?: string;
  bundleTierId?: string;
  quantity: number;
  charityPercentage: number;
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
  
  // Transaction timestamps
  createdAt?: string;
  completedAt?: string | null;
  
  // Calculated fields
  charityAmount?: number;
  
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
}

export interface AddToCartRequest {
  bundleId: string;
  tierId: string;
  charityPercentage: number;
  price: number;
}

export interface UpdateGiftRequest {
  isGift: boolean;
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftMessage?: string;
}
