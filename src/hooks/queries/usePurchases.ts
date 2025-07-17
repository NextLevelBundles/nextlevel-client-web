import { useQuery } from "@tanstack/react-query";
import { purchaseApi } from "@/lib/api";
import { Purchase, PurchaseQueryParams } from "@/lib/api/types/purchase";

// Query key factory for purchases
export const purchasesQueryKey = (params?: PurchaseQueryParams) =>
  ["purchases", params] as const;

/**
 * Hook to fetch purchase history with optional filtering and sorting
 */
export function usePurchases(params?: PurchaseQueryParams) {
  return useQuery({
    queryKey: purchasesQueryKey(params),
    queryFn: (): Promise<Purchase[]> => purchaseApi.getPurchases(params),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 3, // Retry failed requests 3 times
    refetchOnWindowFocus: true, // Refetch on window focus to ensure fresh data
    refetchOnReconnect: true, // Refetch on reconnect
  });
}
