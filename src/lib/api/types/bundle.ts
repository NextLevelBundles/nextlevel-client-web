// Bundle Book Formats types
export interface ProductBookFormat {
  productId: string;
  title: string;
  availableFormats: string[];
}

export interface BundleBookFormatsResponse {
  bundleId: string;
  products: ProductBookFormat[];
}

// Customer Bundles types
export interface CustomerBundleDto {
  id: string;
  title: string;
  slug: string;
  type: "SteamGame" | "EBook";
  purchasedAt?: string;
}

// Tier Availability types
// Dictionary where key is tierId and value is number of keys available
// If a tierId is missing, it means the tier is not available in the user's country
export type BundleTierAvailabilityResponse = Record<string, number>;

// Bundle Statistics types
export interface BundleStatisticsResponse {
  bundleId: string;
  totalRaisedForCharity: number;
  charityGoal: number | null;
}

// Charity Leaderboard types
export interface CharityLeaderboardEntry {
  date: string;
  customerName: string;
  customerHandle: string;
  donatedAmount: number;
}

export interface CharityLeaderboardResponse {
  items: CharityLeaderboardEntry[];
  total: number;
  pageSize: number;
  page: number;
  totalPages: number;
}