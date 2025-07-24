export type GiftFilterType =
  | "All"
  | "Owned"
  | "Gifted"
  | "GivenByMe"
  | "ReceivedByMe";

export interface Purchase {
  id: string;
  type: "Listing" | "Bundle";
  createdAt: string;
  completedAt?: string | null;
  listingId?: string;
  bundleId?: string;
  bundleTierId?: string;
  quantity: number;
  price: number;
  charityPercentage: number;
  charityAmount: number;
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
  // Gift-related fields
  isGift?: boolean;
  giftedByCustomerName?: string;
  giftMessage?: string;
  giftedAt?: string;
}

export interface PurchaseQueryParams {
  sortBy?: "Title" | "Date" | "Price" | "Quantity" | "CharityAmount";
  sortDirection?: "Ascending" | "Descending";
  year?: "2025" | "2024";
  searchQuery?: string;
  giftFilter?: GiftFilterType;
}
