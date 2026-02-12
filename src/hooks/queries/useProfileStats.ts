import { useQuery } from "@tanstack/react-query";
import { customerProfileApi } from "@/lib/api";
import type { ProfileStats } from "@/lib/api/types/customer-profile";

export function useProfileStats(handle: string) {
  return useQuery({
    queryKey: ["profile-stats", handle],
    queryFn: (): Promise<ProfileStats | null> =>
      customerProfileApi.getStatsByHandle(handle),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
