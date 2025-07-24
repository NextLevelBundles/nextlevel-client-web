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
  });
}
