import { useQuery } from "@tanstack/react-query";
import { bundleApi } from "@/lib/api";
import { BundleTierAvailabilityResponse } from "@/lib/api/types/bundle";

/**
 * Hook to fetch bundle tier availability for the customer's country
 * @param bundleId The bundle ID
 * @param enabled Whether the query should be enabled
 * @returns Query result with tier availability data
 */
export function useBundleTierAvailability(
  bundleId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["bundle-tier-availability", bundleId] as const,
    queryFn: (): Promise<BundleTierAvailabilityResponse> =>
      bundleApi.getBundleTierAvailability(bundleId),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
