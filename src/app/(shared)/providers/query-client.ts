import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 60 * 24 * 10, // 10 days
      retry: false,
    },
  },
});
