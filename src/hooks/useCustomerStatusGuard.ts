"use client";
import { useEffect } from "react";
import { Status, Customer } from "@/lib/api/types/user";
import { useAuth } from "@/app/(shared)/providers/auth-provider";

/**
 * Hook to sign out user if customer status is Disabled or Deleted
 */
export function useCustomerStatusGuard(customer: Customer | undefined, isLoading: boolean) {
  const { signOut } = useAuth();

  useEffect(() => {
    const checkAndSignOut = async () => {
      if (!isLoading && customer) {
        if (
          customer.status === Status.Disabled ||
          customer.status === Status.Deleted
        ) {
          await signOut();
        }
      }
    };

    checkAndSignOut();
  }, [customer, isLoading, signOut]);
}
