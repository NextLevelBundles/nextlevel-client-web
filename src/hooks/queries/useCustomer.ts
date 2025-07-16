import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { Customer } from "@/lib/api/types/user";

// Query key factory for customer
export const customerQueryKey = ["customer"] as const;

/**
 * Hook to fetch customer data with reasonable cache duration
 * Customer data can change and should be refetched periodically
 */
export function useCustomer() {
  return useQuery({
    queryKey: customerQueryKey,
    queryFn: (): Promise<Customer> => userApi.getCustomer(),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 3, // Retry failed requests 3 times
    refetchOnWindowFocus: true, // Refetch on window focus to ensure fresh data
    refetchOnReconnect: true, // Refetch on reconnect
  });
}
