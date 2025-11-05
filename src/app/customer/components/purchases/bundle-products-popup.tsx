"use client";

import { useState } from "react";
import { Button } from "@/app/(shared)/components/ui/button";
import { CartItem } from "@/lib/api/types/cart";
import { EyeIcon } from "lucide-react";
import { CartItemModal } from "@/app/(home)/components/cart/cart-item-modal";

interface BundleProductsPopupProps {
  purchase: CartItem;
}

export function BundleProductsPopup({ purchase }: BundleProductsPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      />
    </>
  );
}
