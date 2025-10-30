import { useQuery } from '@tanstack/react-query';
import { exchangeApi } from '@/lib/api';
import { ExchangeGame } from '@/lib/api/types/exchange-game';

export const useExchangeGameDetails = (id: string | undefined) => {
  return useQuery<ExchangeGame>({
    queryKey: ['exchange-game', id],
    queryFn: async () => {
      if (!id) throw new Error('Game ID is required');
      return exchangeApi.getExchangeGameDetails(id);
    },
    enabled: !!id,
  });
};