import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";

// Query key factory
const dashboardKeys = {
  all: ["dashboard"] as const,
  data: () => [...dashboardKeys.all, "data"] as const,
};

export function useDashboardData() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: () => dashboardApi.getDashboardData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
