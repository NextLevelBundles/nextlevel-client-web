"use client";
import { ReactNode, createContext, useContext } from "react";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { Customer } from "@/lib/api/types/user";

interface CustomerContextType {
  customer: Customer | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
  checkCustomerStatus: () => Promise<Customer | undefined>;
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { data: customer, isLoading, error, isError, refetch } = useCustomer();

  // Function to check customer status with fresh API call
  const checkCustomerStatus = async (): Promise<Customer | undefined> => {
    try {
      // Force refetch bypasses cache and gets fresh data
      const result = await refetch();
      return result.data;
    } catch (error) {
      console.error("Failed to check customer status:", error);
      return undefined;
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isLoading,
        error,
        isError,
        refetch,
        checkCustomerStatus
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomerContext() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomerContext must be used within CustomerProvider");
  }
  return context;
}
