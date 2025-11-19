import MediaData from "./media";

export enum BundleType {
  SteamGame = "SteamGame",
  EBook = "EBook",
}

export enum BundleStatus {
  Active = "Active",
  Draft = "Draft",
  Paused = "Paused",
}

// Partial bundle data for list views
export interface BundleListItem {
  id: string;
  slug: string;
  title: string;
  imageMedia: MediaData[];
  description: string;
  minPrice: number;
  suggestedPrice: number;
  isEarlyAccess: boolean;
  isLimitedKeys: boolean;
  isFeatured: boolean;
  type: BundleType;
  startsAt: string; // ISO date string
  endsAt: string;
  sellFrom?: string | null; // ISO date string - when sales start
  sellTo?: string | null; // ISO date string - when sales end
  status: string;
  createdAt: string;
  updatedAt: string;
  platformSplit: number;
  publisherSplit: number;
  charitySplit: number;
  seo?: {
    title: string;
    description: string;
    keywords: string;
    image?: MediaData & {
      width?: number;
      height?: number;
    };
  };
}

// Full bundle data with all relations for detail views
export interface Bundle extends BundleListItem {
  tiers: Tier[];
  products: Product[];
  charities: BundleCharity[];
  publishers: BundlePublisher[];
  curatorComment?: string;
  excessDistributionType?: ExcessDistributionType;
}

export enum TierType {
  Base = "Base",
  Charity = "Charity",
  Upsell = "Upsell",
}

export enum ExcessDistributionType {
  Publishers = "Publishers",
  Charity = "Charity",
}

export interface Tier {
  id: string;
  name: string;
  price: number;
  type: TierType;
}

export enum ProductType {
  SteamGame = "SteamGame",
  EBook = "EBook",
  Audio = "Audio",
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  curatorComment: string;
  type: ProductType;
  publisherId: string | null;
  bundleId: string;
  listingId: string;
  bundleTierId?: string | null;
  coverImage?: MediaData;
  steamGameMetadata: SteamGameMetadata | null;
  ebookMetadata: EBookMetadata | null;
  audioMetadata: Record<string, never> | null; // empty object
}

export interface EBookMetadata {
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
}

export interface SteamGameMetadata {
  website: string;
  protonDbTier: string;
  pcRequirements: Requirements;
  macRequirements: Requirements;
  linuxRequirements: Requirements;
  developers: Party[];
  publishers: Party[];
  releaseDate: {
    comingSoon: boolean;
    date: string;
  };
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
  website: string;
  logoMedia: MediaData;
  description: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    locality: string;
    state: string;
    postalCode: string;
    country: string;
    countryCode: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
  };
}

export interface BundlePublisher {
  id: string;
  name: string;
  sharePercentage: number;
  publisherId: string;
}
