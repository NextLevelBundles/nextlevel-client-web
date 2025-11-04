import { useQuery } from "@tanstack/react-query";
import { bundleApi } from "@/lib/api";
import { BundleStatisticsResponse } from "@/lib/api/types/bundle";

/**
 * Hook to fetch bundle statistics including total raised for charity
 * @param bundleId The bundle ID
 * @returns Query result with bundle statistics data
 */
export function useBundleStatistics(bundleId: string) {
  return useQuery({
    queryKey: ["bundle-statistics", bundleId] as const,
    queryFn: (): Promise<BundleStatisticsResponse | null> =>
      bundleApi.getBundleStatistics(bundleId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once since errors shouldn't break the page
  });
}
