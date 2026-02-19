import { useQuery } from "@tanstack/react-query";
import { customerProfileApi } from "@/lib/api";
import type { ProfileAchievements } from "@/lib/api/types/customer-profile";

export function useProfileAchievements(handle: string) {
  return useQuery({
    queryKey: ["profile-achievements", handle],
    queryFn: (): Promise<ProfileAchievements | null> =>
      customerProfileApi.getAchievementsByHandle(handle),
    enabled: !!handle,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });
}
