import { useQuery } from "@tanstack/react-query";
import { customerProfileApi } from "@/lib/api";
import type { CuratorProfile } from "@/lib/api/types/customer-profile";

export const curatorProfileQueryKey = (handle: string) =>
  ["curator-profile", handle] as const;

export function useCuratorProfile(handle: string) {
  return useQuery({
    queryKey: curatorProfileQueryKey(handle),
    queryFn: (): Promise<CuratorProfile | null> =>
      customerProfileApi.getCuratorProfile(handle),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
