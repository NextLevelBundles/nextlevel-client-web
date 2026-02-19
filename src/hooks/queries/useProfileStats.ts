import { useQuery } from "@tanstack/react-query";
import { customerProfileApi } from "@/lib/api";
import type { ProfileStats } from "@/lib/api/types/customer-profile";

export function useProfileStats(handle: string, filter?: string) {
  return useQuery({
    queryKey: ["profile-stats", handle, filter ?? "all"],
    queryFn: (): Promise<ProfileStats | null> =>
      customerProfileApi.getStatsByHandle(handle, filter),
    enabled: !!handle,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });
}
