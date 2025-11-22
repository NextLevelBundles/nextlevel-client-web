import MediaData from "@/app/(shared)/types/media";

export interface ExchangeHistoryParams {
  Type?: "KeyForCredits" | "CreditsForKey" | string; // KeyForCredits (earned), CreditsForKey (spent)
  StartDate?: string; // ISO date format
  EndDate?: string; // ISO date format
  SearchTerm?: string; // Search by game title or publisher
  Page?: number; // Default: 1
  PageSize?: number; // Default: 20, Max: 100
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
  customerId: string;
  steamKeyId: string;
  steamKeyAssignmentId?: string;
  type: "KeyForCredits" | "CreditsForKey";
  creditAmount: number;
  createdAt: string; // ISO date string
  exchangeGameId: string;
  title: string;
  coverImage?: MediaData;
  steamAppId?: number;
}

export interface ExchangeHistorySummary {
  totalKeysSentToExchange: number;
  totalKeysReceivedFromExchange: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
  netCredits: number;
}
