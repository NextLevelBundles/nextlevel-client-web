import { ReactNode } from "react";
import { serverApiClient } from "@/lib/server-api";
import CartProvider from "./cart-provider";

interface CartProviderWrapperProps {
  children: ReactNode;
}

export async function CartProviderWrapper({
  children,
}: CartProviderWrapperProps) {
  // Load cart data on the server
  let initialCart = null;

  try {
    // Only attempt to load cart data if we're on the server
    if (typeof window === "undefined") {
      initialCart = await serverApiClient.getCart();
    }
  } catch (error) {
    console.error("Failed to load initial cart data:", error);
    // Continue with null initial cart - client will handle loading
  }

  return <CartProvider initialCart={initialCart}>{children}</CartProvider>;
}
