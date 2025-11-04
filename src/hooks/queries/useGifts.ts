import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { giftApi } from "@/lib/api";
import { CartItemGift, SteamKeyGift, AcceptGiftResponse } from "@/lib/api/types/gift";
import { toast } from "sonner";

// Query key factory
const giftKeys = {
  all: ["gifts"] as const,
  cartItems: () => [...giftKeys.all, "cart-items"] as const,
  cartItem: (cartItemId: string) => [...giftKeys.cartItems(), cartItemId] as const,
  steamKeys: () => [...giftKeys.all, "steam-keys"] as const,
  steamKey: (assignmentId: string, email: string) =>
    [...giftKeys.steamKeys(), assignmentId, email] as const,
};

// Cart Item Gift Hooks
export function useCartItemGift(cartItemId: string, enabled = true) {
  return useQuery({
    queryKey: giftKeys.cartItem(cartItemId),
    queryFn: () => giftApi.getCartItemGift(cartItemId),
    enabled: !!cartItemId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once for gift pages
  });
}

export function useAcceptCartItemGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartItemId, email }: { cartItemId: string; email: string }) =>
      giftApi.acceptCartItemGift(cartItemId, email),
    onSuccess: (data, variables) => {
      // Invalidate the specific gift query
      queryClient.invalidateQueries({
        queryKey: giftKeys.cartItem(variables.cartItemId)
      });

      toast.success("Gift accepted successfully!", {
        description: "The item has been added to your library.",
      });
    },
    onError: (error) => {
      toast.error("Failed to accept gift", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    },
  });
}

// Steam Key Gift Hooks
export function useSteamKeyGift(assignmentId: string, email: string, enabled = true) {
  return useQuery({
    queryKey: giftKeys.steamKey(assignmentId, email),
    queryFn: () => giftApi.getSteamKeyGift(assignmentId, email),
    enabled: !!assignmentId && !!email && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once for gift pages
  });
}

export function useAcceptSteamKeyGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, email }: { assignmentId: string; email: string }) =>
      giftApi.acceptSteamKeyGift(assignmentId, email),
    onSuccess: (data, variables) => {
      // Invalidate the specific gift query
      queryClient.invalidateQueries({
        queryKey: giftKeys.steamKey(variables.assignmentId, variables.email)
      });

      toast.success("Steam key gift accepted!", {
        description: "The game has been added to your keys library.",
      });
    },
    onError: (error) => {
      toast.error("Failed to accept gift", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    },
  });
}

// Resend Email Hooks
export function useResendPurchaseGiftEmail() {
  return useMutation({
    mutationFn: (cartItemId: string) => giftApi.resendPurchaseGiftEmail(cartItemId),
    onSuccess: () => {
      toast.success("Email sent!", {
        description: "Gift notification has been resent to the recipient",
      });
    },
    onError: (error) => {
      toast.error("Failed to resend email", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    },
  });
}

export function useResendSteamKeyGiftEmail() {
  return useMutation({
    mutationFn: (assignmentId: string) => giftApi.resendSteamKeyGiftEmail(assignmentId),
    onSuccess: () => {
      toast.success("Email sent!", {
        description: "Gift notification has been resent to the recipient",
      });
    },
    onError: (error) => {
      toast.error("Failed to resend email", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    },
  });
}
