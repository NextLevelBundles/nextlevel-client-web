import MediaData from "./media";

export enum BundleType {
  SteamGame = 0,
  EBook = 1,
}

export interface Bundle {
  id: string;
  title: string;
  imageMedia: MediaData;
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
  bundleType: BundleType;
  tiers: Tier[];
  products: Product[];
  charities: BundleCharity[];
  publishers: BundlePublisher[];
}

export interface Tier {
  id: string;
  price: number;
  isDonationTier?: boolean;
}

export enum ProductType {
  SteamGame = 0,
  EBook = 1,
  Audio = 2,
}

export interface Product {
  id: string;
  title: string;
  description: string;
  headerImage: string;
  price: number;
  curatorComment: string;
  type: ProductType;
  publisherId: string | null;
  bundleTierId?: string | null;
  bookId?: string;
  steamGameMetadata: SteamGameMetadata;
  ebookMetadata: EBookMetadata;
  audioMetadata: Record<string, never>; // empty object
}

export interface EBookMetadata {
  author?: string;
  isbn?: string;
  pageCount?: number;
  publisher?: string;
  publicationDate?: string;
  formats?: string[];
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

interface BundleCharity {
  charityId: string;
  charity: Charity;
}
export interface Charity {
  id: string;
  name: string;
  website?: string;
  logoMedia: MediaData;
  description?: string;
}

export interface BundlePublisher {
  id: string;
  name: string;
  sharePercentage: number;
  publisherId: string;
}
