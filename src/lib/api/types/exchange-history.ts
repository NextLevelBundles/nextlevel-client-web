import MediaData from "@/app/(shared)/types/media";

export type ExchangeTransactionType =
  | "KeyForCredits"        // Customer sends key, earns credits
  | "CreditsForKey"        // Customer spends credits, gets key
  | "CreditAdjustmentAdd"  // Credits added by support
  | "CreditAdjustmentDeduct"; // Credits deducted by support

export interface ExchangeHistoryParams {
  Type?: ExchangeTransactionType | string;
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
  steamKeyId?: string;
  steamKeyAssignmentId?: string;
  type: ExchangeTransactionType;
  creditAmount: number;
  createdAt: string; // ISO date string
  exchangeGameId?: string;
  title?: string;
  coverImage?: MediaData;
  steamAppId?: number;
  reason?: string; // Reason for credit adjustments
}

export interface ExchangeHistorySummary {
  totalKeysSentToExchange: number;
  totalKeysReceivedFromExchange: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
  netCredits: number;
  currentBalance: number; // Actual balance from Customer entity
}
