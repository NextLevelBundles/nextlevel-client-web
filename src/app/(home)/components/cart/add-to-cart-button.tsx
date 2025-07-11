"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import { useCart } from "@/app/(shared)/contexts/cart/cart-provider";
import { cn } from "@/app/(shared)/utils/tailwind";
import { AddToCartRequest } from "@/lib/client-api";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  bundleId: string;
  selectedTier: number;
  totalAmount: number;
  snapshotTitle: string;
  snapshotImageUrl: string;
  snapshotTierTitle: string;
  snapshotProducts: Array<{
    productId: string;
    title: string;
    coverImageUrl: string;
  }>;
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({
  bundleId,
  selectedTier,
  totalAmount,
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
        selectedTierId: selectedTier.toString(),
        quantity: 1,
        priceAtSelection: totalAmount,
      };

      await addToCart(cartItem);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled = isLoading || isAdding || totalAmount <= 0;

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        justAdded && "bg-green-500 hover:bg-green-600",
        className
      )}
    >
      {isAdding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding to Cart...
        </>
      ) : justAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added to Cart!
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {children || "Add to Cart"}
        </>
      )}
    </Button>
  );
}
