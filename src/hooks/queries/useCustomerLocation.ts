import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { CustomerLocation } from "@/lib/api/types/location";

// Query key factory for customer location
export const customerLocationQueryKey = ["customerLocation"] as const;

/**
 * Hook to fetch customer location data
 * Used to determine the country for Steam key allocation
 */
export function useCustomerLocation() {
  return useQuery({
    queryKey: customerLocationQueryKey,
    queryFn: (): Promise<CustomerLocation> => userApi.getCustomerLocation(),
    staleTime: 30 * 60 * 1000, // Consider data stale after 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    retry: 2, // Retry failed requests 2 times
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on reconnect
  });
}