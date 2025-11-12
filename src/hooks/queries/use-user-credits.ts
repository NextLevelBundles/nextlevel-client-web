import { useQuery } from "@tanstack/react-query";
import { exchangeApi } from "@/lib/api";
import { useAuth } from "@/shared/providers/auth-provider";

export function useUserCredits() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: ["user-credits"],
    queryFn: async () => {
      const response = await exchangeApi.getCustomerCredits();
      return response.netCredits ?? 0;
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Refetch when user returns to tab
    refetchOnMount: false, // Refetch when component mounts
    retry: 2, // Retry failed requests twice
  });
}
