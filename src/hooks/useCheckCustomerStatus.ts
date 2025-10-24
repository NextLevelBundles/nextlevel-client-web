"use client";
import { Status } from "@/lib/api/types/user";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { useCustomerContext } from "@/app/(shared)/providers/customer-provider";
import { toast } from "sonner";

/**
 * Hook to check customer status with fresh API call and sign out if disabled/deleted
 * Returns a function that can be called before critical actions like add to cart or checkout
 */
export function useCheckCustomerStatus() {
  const { signOut } = useAuth();
  const { checkCustomerStatus } = useCustomerContext();

  const verifyCustomerStatus = async (): Promise<boolean> => {
    try {
      // Get fresh customer data from API (bypasses cache)
      const freshCustomer = await checkCustomerStatus();

      if (!freshCustomer) {
        // If we can't fetch customer data, allow the action but log the error
        console.error("Could not verify customer status");
        return true;
      }

      // Check if customer is disabled or deleted
      if (
        freshCustomer.status === Status.Disabled ||
        freshCustomer.status === Status.Deleted
      ) {
        // Show appropriate message
        const message =
          freshCustomer.status === Status.Disabled
            ? "Your account has been disabled. Please contact support for assistance."
            : "Your account has been deleted. Please contact support if you believe this is an error.";

        toast.error(message);

        // Sign out the user
        await signOut();

        // Return false to prevent the action
        return false;
      }

      // Customer status is active, allow the action
      return true;
    } catch (error) {
      console.error("Error checking customer status:", error);
      // On error, allow the action to proceed (fail open)
      // The backend will still validate
      return true;
    }
  };

  return { verifyCustomerStatus };
}