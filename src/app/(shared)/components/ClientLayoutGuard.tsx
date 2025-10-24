"use client";
import { useCustomerStatusGuard } from "@/hooks/useCustomerStatusGuard";
import { useCustomerContext } from "@/app/(shared)/providers/customer-provider";

export function ClientLayoutGuard() {
  const { customer, isLoading } = useCustomerContext();
  useCustomerStatusGuard(customer, isLoading);
  return null;
}
