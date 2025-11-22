import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { ExchangeHistoryApi } from '@/lib/api/clients/exchange-history';
import { apiClient } from '@/lib/api/client-api';
import type { ExchangeHistoryParams, ExchangeHistoryResponse, ExchangeHistorySummary } from '@/lib/api/types/exchange-history';

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
  const queryClient = useQueryClient();

  return useQuery<ExchangeHistorySummary>({
    queryKey: ['exchange-summary'],
    queryFn: async () => {
      // Try to get summary from any existing exchange-history query
      const existingData = queryClient.getQueriesData<ExchangeHistoryResponse>({
        queryKey: ['exchange-history'],
      });

      // If we have cached data with a summary, return it
      if (existingData.length > 0 && existingData[0][1]?.summary) {
        return existingData[0][1].summary;
      }

      // Otherwise, fetch with minimal page size
      const exchangeHistoryApi = new ExchangeHistoryApi(apiClient);
      const response = await exchangeHistoryApi.getExchangeHistory({
        Page: 1,
        PageSize: 1,
      });
      return response.summary;
    },
    staleTime: 60000, // 1 minute
  });
}

