import { useQuery } from '@tanstack/react-query';
import { exchangeApi } from '@/lib/api';

export function useUserCredits() {
  return useQuery({
    queryKey: ['user-credits'],
    queryFn: async () => {
      const response = await exchangeApi.getCustomerCredits();
      return response.netCredits ?? 0;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute to keep credits updated
  });
}