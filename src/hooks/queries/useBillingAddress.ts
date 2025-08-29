import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { customerQueryKey } from "./useCustomer";
import { BillingAddress } from "@/lib/api/types/user";

/**
 * Hook to update billing address with optimistic updates
 * Invalidates customer cache after successful update
 */
export function useUpdateBillingAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (billingAddress: BillingAddress) =>
      userApi.updateBillingAddress(billingAddress),
    onSuccess: () => {
      // Invalidate customer query to refetch updated data
      queryClient.invalidateQueries({ queryKey: customerQueryKey });
    },
    onError: (error) => {
      console.error("Failed to update billing address:", error);
    },
  });
}
