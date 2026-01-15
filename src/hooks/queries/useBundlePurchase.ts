import { useQuery } from "@tanstack/react-query";
import { purchaseApi } from "@/lib/api";
import { CartItem } from "@/lib/api/types/cart";

// Query key factory for bundle purchase
export const bundlePurchaseQueryKey = (bundleId: string) =>
  ["bundle-purchase", bundleId] as const;

/**
 * Hook to check if the current user has purchased a specific bundle
 * Returns the CartItem if a self-purchase exists, or null otherwise
 */
export function useBundlePurchase(bundleId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: bundlePurchaseQueryKey(bundleId),
    queryFn: (): Promise<CartItem | null> =>
      purchaseApi.getBundlePurchase(bundleId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
