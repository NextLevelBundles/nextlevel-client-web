import { useQuery } from "@tanstack/react-query";
import { exchangeApi } from "@/lib/api";
import { useAuth } from "@/shared/providers/auth-provider";

export function useUserCredits() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: ["user-credits"],
    queryFn: async () => {
      // Return 0 credits for non-authenticated users
      if (!isAuthenticated) {
        return 0;
      }

      const response = await exchangeApi.getCustomerCredits();
      return response.netCredits ?? 0;
    },
    enabled: true, // Always enabled, but returns 0 for non-authenticated users
    staleTime: 30000, // 30 seconds
    refetchInterval: false, // Never refetch
  });
}
