import { useQuery } from "@tanstack/react-query";
import { bundleApi } from "@/lib/api";
import { CharityLeaderboardResponse } from "@/lib/api/types/bundle";

/**
 * Hook to fetch charity leaderboard for a bundle
 * @param bundleId The bundle ID
 * @param page Page number (default 1)
 * @param pageSize Number of items per page (default 9)
 * @returns Query result with charity leaderboard data
 */
export function useCharityLeaderboard(
  bundleId: string,
  page: number = 1,
  pageSize: number = 9
) {
  return useQuery({
    queryKey: ["charity-leaderboard", bundleId, page, pageSize] as const,
    queryFn: (): Promise<CharityLeaderboardResponse> =>
      bundleApi.getCharityLeaderboard(bundleId, page, pageSize),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}
