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
  type: number;                    // 0 = KeyForCredits (earned), 1 = CreditsForKey (spent)
  creditAmount: number;            // Credits involved in transaction (always positive)
  productPrice: number;            // Price used for calculation
  isFromBundle: boolean;           // Was this from a bundle?
  tierPrice?: number;              // Bundle tier price (if applicable)
  createdAt: string;              // ISO date string
  productId: string;
  productTitle: string;
  steamGameMetadata?: {
    name?: string;
    headerImage?: string;
    shortDescription?: string;
  };
  steamKeyId: string;
  steamKeyAssignmentId?: string;   // Only for type 0 transactions
  packageId: string;
  packageName: string;
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
