// Cart item status enum matching backend
export enum CartItemStatus {
  AddedToCart = "AddedToCart",
  Reserved = "Reserved",
  Expired = "Expired",
  Failed = "Failed",
  Completed = "Completed",
  Refunded = "Refunded",
}

export interface CartItem {
  id: string;
  type: "Listing";
  status?: CartItemStatus;
  createdAt?: string;
  completedAt?: string | null;
  cartId?: string;
  customerId: string;
  listingId?: string;
  bundleId?: string;
  quantity: number;
  baseAmount: number;
  charityAmount: number;
  tipAmount: number;
  upsellAmount: number;
  totalAmount: number;
  snapshotTitle?: string;
  snapshotImageUrl?: string;
  snapshotPlatform?: string;
  snapshotTierTitle?: string;
  snapshotTierPrice?: number;
  snapshotExcessDistributionType?: "Publishers" | "Charity";
  snapshotPlatformSplit: number;
  snapshotPublisherSplit: number;
  snapshotCharitySplit: number;
  upgradeFrom: string | null; // ISO date string - when upgrades can start
  upgradeTo: string | null; // ISO date string - when upgrades end
  bundleUpgradeStatus: BundleUpgradeStatus;
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
  addedAt?: string;
  isGift?: boolean;
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftMessage?: string;
  canOnlyBeGifted?: boolean;
  giftAccepted?: boolean | null;
  giftAcceptedAt?: string | null;
  giftExpiresAt?: string | null;
}

export interface BundleUpgradeStatus {
  allTiersSelected: true;
  remainingProducts: 0;
  remainingBaseTiers: 0;
  remainingCharityTiers: 0;
  remainingUpsellTiers: 0;
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
  baseTierId: string;
  charityTierId?: string;
  tipAmount?: number;
  upsellTierIds?: string[];
  isGift?: boolean;
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftMessage?: string;
}

export interface UpdateGiftRequest {
  isGift: boolean;
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftMessage?: string;
}
