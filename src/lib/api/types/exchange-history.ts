import MediaData from '../../app/(shared)/types/media';

export interface ExchangeHistoryParams {
  Type?: number;        // 0 = KeyForCredits (earned), 1 = CreditsForKey (spent)
  StartDate?: string;   // ISO date format
  EndDate?: string;     // ISO date format
  SearchTerm?: string;  // Search by game title or publisher
  Page?: number;        // Default: 1
  PageSize?: number;    // Default: 20, Max: 100
}

export interface ExchangeHistoryResponse {
  transactions: ExchangeTransactionDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: ExchangeHistorySummary;
}

export interface ExchangeTransactionDto {
  id: string;
  type: number; // ExchangeTransactionType (enum)
  creditAmount: number;
  price: number;
  createdAt: string; // ISO date string

  // Product information
  productId: string;
  productTitle: string;
  coverImage?: MediaData;
  steamGameMetadata?: {
    website?: string;
    protonDbTier?: string;
    pcRequirements?: {
      minimum?: string;
      recommended?: string;
    };
    macRequirements?: {
      minimum?: string;
      recommended?: string;
    };
    linuxRequirements?: {
      minimum?: string;
      recommended?: string;
    };
    developers?: Array<{
      name: string;
      website?: string;
    }>;
    publishers?: Array<{
      name: string;
      website?: string;
    }>;
    releaseDate?: {
      date: string;
    } | null;
    platforms?: string[];
    trailerUrl?: string;
    screenshotUrlsJson?: string | null;
    steamAppId?: number;
  };

  // Steam key information
  steamKeyId: string;
  steamKeyAssignmentId?: string;

  // Package information
  packageId: string;
  packageName: string;

  // Publisher information
  publisherId: string;
  publisherName: string;
}

export interface ExchangeHistorySummary {
  totalKeysSentToExchange: number;
  totalKeysReceivedFromExchange: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
  netCredits: number;
}
