export interface CartItem {
  id: string;
  type: "Listing";
  createdAt?: string;
  completedAt?: string | null;
  customerId: string;
  listingId?: string;
  bundleId?: string;
  baseBundleTierId?: string;
  charityBundleTierId?: string;
  upsellBundleTierId?: string;
  quantity: number;
  price: number;
  charityAmount?: number;
  upsellAmount?: number;
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
      packageId?: string;
      steamKeyId?: string;
    };
    bookInfo?: {
      bookId: string;
      metadata?: {
        isbn?: string;
        isbN13?: string;
        author?: string;
        additionalAuthors?: string[];
        publisher?: string;
        pageCount?: number;
        language?: string;
        publicationDate?: string;
        edition?: string;
        genre?: string;
        tags?: string[];
        description?: string;
        availableFormats?: string[];
      };
    };
  }[];
  isGift?: boolean;
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftMessage?: string;
  canOnlyBeGifted?: boolean;
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
  charityAmount?: number;
  upsellAmount?: number;
  giftRecipientEmail?: string;
}

export interface UpdateGiftRequest {
  isGift: boolean;
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftMessage?: string;
}
