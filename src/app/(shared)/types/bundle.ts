export interface Bundle {
  id: string;
  title: string;
  coverImageUrl: string;
  description: string;
  curatorComment: string | null;
  minPrice: number;
  suggestedPrice: number;
  isEarlyAccess: boolean;
  isLimitedKeys: boolean;
  isFeatured: boolean;
  startsAt: string; // ISO date string
  endsAt: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  tiers: Tier[];
  products: Product[];
  charities: Charity[];
  publishers: BundlePublisher[];
}

export interface Tier {
  id: string;
  price: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  headerImage: string;
  price: number;
  curatorComment: string;
  type: string;
  publisherId: string | null;
  steamGameMetadata: SteamGameMetadata;
  ebookMetadata: Record<string, never>; // empty object
  audioMetadata: Record<string, never>; // empty object
}

export interface SteamGameMetadata {
  website: string;
  protonDbTier: string;
  pcRequirements: Requirements;
  macRequirements: Requirements;
  linuxRequirements: Requirements;
  developers: Party[];
  publishers: Party[];
  platforms: string[];
  trailerUrl: string;
  screenshotUrlsJson: string;
  steamAppId: number;
}

export interface Requirements {
  minimum: string;
  recommended: string;
}

export interface Party {
  name: string;
  website: string;
}

export interface Charity {
  charityId: string;
  charityName: string | null;
  sharePercentage: number;
}

export interface BundlePublisher {
  id: string;
  name: string;
  sharePercentage: number;
  publisherId: string;
}
