"use client";

import { Button } from "@/shared/components/ui/button";
import { ShoppingCart, ChevronUp } from "lucide-react";
import { cn } from "@/shared/utils/tailwind";

interface MobileStickyCTAProps {
  totalAmount: number;
  unlockedProductsCount: number;
  onAddToCart: () => void;
  onViewDetails: () => void;
  isDisabled?: boolean;
  className?: string;
}

export function MobileStickyCTA({
  totalAmount,
  unlockedProductsCount,
  onAddToCart,
  onViewDetails,
  isDisabled = false,
  className,
}: MobileStickyCTAProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl",
        "safe-area-bottom",
        className
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Price and Items Info */}
          <button
            onClick={onViewDetails}
            className="flex flex-col items-start gap-0.5 min-w-0 flex-1"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{unlockedProductsCount} items</span>
              <ChevronUp className="h-3 w-3" />
            </div>
          </button>

          {/* Add to Cart Button */}
          <Button
            onClick={onAddToCart}
            disabled={isDisabled || totalAmount === 0}
            size="lg"
            className="gap-2 px-6 font-semibold shadow-lg"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
