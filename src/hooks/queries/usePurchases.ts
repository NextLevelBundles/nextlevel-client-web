import { useQuery } from "@tanstack/react-query";
import { purchaseApi } from "@/lib/api";
import { Purchase, PurchaseQueryParams } from "@/lib/api/types/purchase";

// Query key factory for purchases
export const purchasesQueryKey = (params?: PurchaseQueryParams) =>
  ["purchases", params] as const;

export const recentPurchasesQueryKey = () => ["purchases", "recent"] as const;

/**
 * Hook to fetch purchase history with optional filtering and sorting
 */
export function usePurchases(params?: PurchaseQueryParams) {
  return useQuery({
    queryKey: purchasesQueryKey(params),
    queryFn: (): Promise<Purchase[]> => purchaseApi.getPurchases(params),
  });
}

/**
 * Hook to fetch recent purchases (last 5 purchases within 30 days)
 */
export function useRecentPurchases() {
  return useQuery({
    queryKey: recentPurchasesQueryKey(),
    queryFn: (): Promise<Purchase[]> => purchaseApi.getRecentPurchases(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
