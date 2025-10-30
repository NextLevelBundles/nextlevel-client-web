import { useQuery } from "@tanstack/react-query";
import { bundleApi } from "@/lib/api";
import { BundleBookFormatsResponse } from "@/lib/api/types/bundle";

export function useBundleBookFormats(bundleId: string, enabled = true) {
  return useQuery<BundleBookFormatsResponse | null>({
    queryKey: ["bundleBookFormats", bundleId],
    queryFn: () => bundleApi.getBundleBookFormats(bundleId),
    enabled: enabled && !!bundleId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}