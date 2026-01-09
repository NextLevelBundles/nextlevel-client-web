"use client";

import { useState } from "react";
import { Button } from "@/app/(shared)/components/ui/button";
import { CartItem } from "@/lib/api/types/cart";
import { EyeIcon } from "lucide-react";
import { CartItemModal } from "@/app/(home)/components/cart/cart-item-modal";
import { useQuery } from "@tanstack/react-query";
import { Bundle } from "@/app/(shared)/types/bundle";

interface BundleProductsPopupProps {
  purchase: CartItem;
  autoOpen?: boolean;
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

export function BundleProductsPopup({ purchase, autoOpen = false, autoOpenUpgrade = false }: BundleProductsPopupProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);

  // Fetch bundle data when modal opens
  const { data: bundle } = useQuery({
    queryKey: ["bundle", purchase.bundleId],
    queryFn: () => fetchBundleById(purchase.bundleId!),
    enabled: isOpen && !!purchase.bundleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <EyeIcon className="h-4 w-4" />
        View Purchase
      </Button>

      <CartItemModal
        item={purchase}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        bundle={bundle}
        autoOpenUpgrade={autoOpenUpgrade}
      />
    </>
  );
}
