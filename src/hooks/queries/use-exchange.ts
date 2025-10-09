import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExchangeApi } from '@/lib/api/clients/exchange';
import { apiClient } from '@/lib/api/client-api';
import { toast } from 'sonner';
import { useAuth } from '@/shared/providers/auth-provider';

const exchangeApi = new ExchangeApi(apiClient);

export function useExchangeData() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: ['exchange-data'],
    queryFn: async () => {
      // Only fetch exchange games, not credits (handled by useUserCredits hook)
      const exchangeGames = await exchangeApi.getExchangeGames('Active');
      return {
        exchangeGames,
      };
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useExchangeForCredits() {
  const queryClient = useQueryClient();

  return useMutation({
  mutationFn: (assignmentId: string) => exchangeApi.exchangeSteamKeyForCredits(assignmentId),
    onSuccess: (data) => {
      toast.success(`Game exchanged for ${data.credits} credits!`);
      // Invalidate both exchange data and user credits
      queryClient.invalidateQueries({ queryKey: ['exchange-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error && 'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'data' in error.response &&
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
        ? error.response.data.message
        : 'Exchange failed';
      toast.error(errorMessage);
    }
  });
}

export function useExchangeCreditsForKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: number) => exchangeApi.exchangeCreditsForSteamKey(keyId),
    onSuccess: (data) => {
      toast.success(`Game acquired for ${data.credits} credits!`);
      // Invalidate both exchange data and user credits
      queryClient.invalidateQueries({ queryKey: ['exchange-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error && 'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'data' in error.response &&
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
        ? error.response.data.message
        : 'Exchange failed';
      toast.error(errorMessage);
    }
  });
}