import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ExchangeHistoryApi } from '@/lib/api/clients/exchange-history';
import { ExchangeApi } from '@/lib/api/clients/exchange';
import { apiClient } from '@/lib/api/client-api';
import type { ExchangeHistoryParams, ExchangeHistoryResponse } from '@/lib/api/types/exchange-history';
import type { ExchangeableSteamKeyDto } from '@/lib/api/types/exchange';

export function useExchangeHistory(params: ExchangeHistoryParams) {
  const exchangeHistoryApi = new ExchangeHistoryApi(apiClient);

  return useQuery<ExchangeHistoryResponse>({
    queryKey: ['exchange-history', params],
    queryFn: async () => {
      return await exchangeHistoryApi.getExchangeHistory({
        Type: params.Type,
        StartDate: params.StartDate,
        EndDate: params.EndDate,
        SearchTerm: params.SearchTerm,
        Page: params.Page,
        PageSize: params.PageSize,
      });
    },
    placeholderData: keepPreviousData,
    staleTime: 30000, // 30 seconds
  });
}

export function useExchangeSummary() {
  const exchangeHistoryApi = new ExchangeHistoryApi(apiClient);

  return useQuery({
    queryKey: ['exchange-summary'],
    queryFn: async () => {
      const response = await exchangeHistoryApi.getExchangeHistory({
        Page: 1,
        PageSize: 1, // We only need the summary
      });
      return response.summary;
    },
    staleTime: 60000, // 1 minute
  });
}

export function useToBeExchangeableKeys() {
  const exchangeApi = new ExchangeApi(apiClient);

  return useQuery<ExchangeableSteamKeyDto[]>({
    queryKey: ['to-be-exchangeable-keys'],
    queryFn: async () => {
      return await exchangeApi.getToBeExchangeableSteamKeys();
    },
    staleTime: 300000, // 5 minutes
  });
}

