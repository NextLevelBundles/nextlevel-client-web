import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { steamKeyApi } from "@/lib/api";
import { 
  SteamKeyQueryParams,
  GiftKeyRequest,
} from "@/lib/api/types/steam-key";
import { toast } from "sonner";

// Query key factory
const steamKeyKeys = {
  all: ["steam-keys"] as const,
  lists: () => [...steamKeyKeys.all, "list"] as const,
  list: (params: SteamKeyQueryParams) =>
    [...steamKeyKeys.lists(), params] as const,
};

export function useSteamKeys(params?: SteamKeyQueryParams) {
  return useQuery({
    queryKey: steamKeyKeys.list(params || {}),
    queryFn: () => steamKeyApi.getSteamKeys(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRevealKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => steamKeyApi.revealKey(keyId),
    onSuccess: () => {
      // Invalidate and refetch steam keys
      queryClient.invalidateQueries({ queryKey: steamKeyKeys.all });

      toast.success("🎉 New game key unlocked!", {
        description: "Your collection grows stronger!",
      });
    },
    onError: (error) => {
      toast.error("Failed to reveal key", {
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    },
  });
}

export function useViewKey() {
  return useMutation({
    mutationFn: (keyId: string) => steamKeyApi.viewKey(keyId),
    onError: (error) => {
      toast.error("Failed to view key", {
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    },
  });
}

export function useGiftKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (giftData: GiftKeyRequest) =>
      steamKeyApi.giftKey(giftData),
    onSuccess: () => {
      // Invalidate and refetch steam keys
      queryClient.invalidateQueries({ queryKey: steamKeyKeys.all });

      toast.success("🎁 Gift sent successfully!", {
        description: "The recipient will receive an email with their gift.",
      });
    },
    onError: (error) => {
      toast.error("Failed to send gift", {
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    },
  });
}

export function useSteamKeyStatusCounts() {
  return useQuery({
    queryKey: ["steam-keys", "status-counts"],
    queryFn: () => steamKeyApi.getStatusCounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSyncSteamLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => steamKeyApi.syncSteamLibrary(),
    onSuccess: (data) => {
      // Invalidate and refetch steam keys to get new data
      queryClient.invalidateQueries({ queryKey: steamKeyKeys.all });
      
      if (data.isSuccess) {
        toast.success("🔄 Steam Library Synced!", {
          description: "Your game library has been refreshed successfully.",
        });
      } else {
        toast.error("Sync failed", {
          description: data.errorMessage || "Failed to sync your Steam library.",
        });
      }
    },
    onError: (error) => {
      toast.error("Sync failed", {
        description:
          error instanceof Error ? error.message : "Something went wrong during sync.",
      });
    },
  });
}
