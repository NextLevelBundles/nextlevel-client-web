import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { Country } from "@/lib/api/types/common";

// Query key factory for countries
export const countriesQueryKey = ["countries"] as const;

/**
 * Hook to fetch countries with infinite cache (never expires)
 * Countries data is static and doesn't change frequently
 */
export function useCountries() {
  return useQuery({
    queryKey: countriesQueryKey,
    queryFn: (): Promise<Country[]> => userApi.getCountries(),
    staleTime: Infinity, // Never consider the data stale
    gcTime: Infinity, // Never garbage collect (keeps in cache forever)
    retry: 3, // Retry failed requests 3 times
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
}
