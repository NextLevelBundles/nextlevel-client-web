"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import { useCart } from "@/app/(shared)/contexts/cart/cart-provider";
import { cn } from "@/app/(shared)/utils/tailwind";
import { AddToCartRequest } from "@/lib/api/types/cart";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  bundleId: string;
  selectedTierId?: string;
  totalAmount: number;
  charityPercentage: number;
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({
  bundleId,
  selectedTierId,
  totalAmount,
  charityPercentage,
  className,
  children,
}: AddToCartButtonProps) {
  const { addToCart, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const cartItem: AddToCartRequest = {
        bundleId,
        tierId: selectedTierId!,
        price: totalAmount,
        charityPercentage: charityPercentage,
      };

      await addToCart(cartItem);
      // Only show success state if the API call succeeded
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // Don't show success state if there was an error
      // The global error handler will show the error toast
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled =
    isLoading || isAdding || totalAmount <= 0 || !selectedTierId;

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={cn(
        "cursor-pointer relative overflow-hidden transition-all duration-300 w-full bg-primary text-white hover:bg-primary/90 shadow-xs hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/40 h-14 text-lg font-medium px-8 py-4 rounded-xl ring-1 ring-primary/50 hover:ring-primary hover:scale-[1.02]",
        justAdded && "bg-green-500 hover:bg-green-600",
        className
      )}
    >
      {isAdding ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Adding to Cart...
        </>
      ) : justAdded ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Added to Cart!
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          {children || "Add to Cart"}
        </>
      )}
    </Button>
  );
}
