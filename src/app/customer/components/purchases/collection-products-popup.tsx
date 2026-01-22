"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/lib/api/types/cart";
import { CartItemModal } from "@/app/(home)/components/cart/cart-item-modal";
import { useQuery } from "@tanstack/react-query";
import { Bundle } from "@/app/(shared)/types/bundle";

interface BundleProductsPopupProps {
  purchase: CartItem;
  isOpen: boolean;
  onClose: () => void;
  autoOpenUpgrade?: boolean;
}

// Fetch bundle via API
async function fetchBundleById(bundleId: string): Promise<Bundle> {
  const response = await fetch(`/api/customer/bundle/${bundleId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch bundle");
  }
  return response.json();
}

export function BundleProductsPopup({ purchase, isOpen, onClose, autoOpenUpgrade = false }: BundleProductsPopupProps) {
  // Fetch bundle data when modal opens
  const { data: bundle } = useQuery({
    queryKey: ["bundle", purchase.bundleId],
    queryFn: () => fetchBundleById(purchase.bundleId!),
    enabled: isOpen && !!purchase.bundleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <CartItemModal
      item={purchase}
      isOpen={isOpen}
      onClose={onClose}
      bundle={bundle}
      autoOpenUpgrade={autoOpenUpgrade}
    />
  );
}
