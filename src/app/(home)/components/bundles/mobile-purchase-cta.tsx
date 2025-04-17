"use client";

import { Button } from "@/shared/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface MobilePurchaseCTAProps {
  totalAmount: number;
}

export function MobilePurchaseCTA({ totalAmount }: MobilePurchaseCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border z-50">
      <Button
        className="w-full bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all duration-300 h-12 text-lg font-medium"
        onClick={() => {
          // Handle purchase
        }}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Buy for ${totalAmount.toFixed(2)}
      </Button>
    </div>
  );
}
