"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import { useCart } from "@/app/(shared)/contexts/cart/cart-provider";
import { cn } from "@/app/(shared)/utils/tailwind";
import { AddToCartRequest } from "@/lib/api/types/cart";
import { Check, Loader2, ShoppingCart, LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { useRouter } from "next/navigation";
import { BundleType } from "@/app/(shared)/types/bundle";

interface AddToCartButtonProps {
  bundleId: string;
  baseTierId?: string;
  charityTierId?: string;
  tipAmount?: number;
  totalAmount: number;
  selectedUpsellTierIds?: string[];
  className?: string;
  children?: React.ReactNode;
  isBundleExpired?: boolean;
  hasAvailableBaseTiers?: boolean;
  bundleUnavailabilityReason?: "country" | "soldout" | null;
  disabled?: boolean;
  bundleType: BundleType;
}

export function AddToCartButton({
  bundleId,
  baseTierId,
  charityTierId,
  tipAmount = 0,
  totalAmount,
  selectedUpsellTierIds = [],
  className,
  children,
  isBundleExpired = false,
  hasAvailableBaseTiers = true,
  bundleUnavailabilityReason = null,
  disabled = false,
  bundleType,
}: AddToCartButtonProps) {
  const { addToCart, isLoading } = useCart();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const cartItem: AddToCartRequest = {
        bundleId,
        baseTierId: baseTierId!,
        ...(charityTierId && { charityTierId }),
        ...(tipAmount > 0 && { tipAmount }),
        ...(selectedUpsellTierIds.length > 0 && {
          upsellTierIds: selectedUpsellTierIds,
        }),
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

  const handleSignIn = () => {
    const signInUrl = new URL("/auth/signin", window.location.origin);
    signInUrl.searchParams.set("callbackUrl", window.location.pathname);
    router.push(signInUrl.toString());
  };

  const isAuthenticated = !!user;
  const isLoadingSession = isLoadingAuth;

  const isDisabled =
    disabled ||
    isLoading ||
    isAdding ||
    totalAmount <= 0 ||
    !baseTierId ||
    isLoadingSession ||
    isBundleExpired ||
    !hasAvailableBaseTiers;

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={isAuthenticated ? handleAddToCart : handleSignIn}
        disabled={isDisabled}
        className={cn(
          "cursor-pointer relative overflow-hidden transition-all duration-300 w-full bg-primary text-white hover:bg-primary/90 shadow-xs hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/40 h-14 text-lg font-medium px-8 py-4 rounded-xl ring-1 ring-primary/50 hover:ring-primary hover:scale-[1.02]",
          justAdded &&
            "bg-green-500 hover:bg-green-600 ring-green-500 hover:ring-green-600",
          className
        )}
      >
        {isLoadingSession ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
          </>
        ) : !isAuthenticated ? (
          <>
            <LogIn className="mr-2 h-5 w-5" />
            Login to Add to Cart
          </>
        ) : isAdding ? (
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
      <p className="text-xs text-center text-muted-foreground mt-2">
        {isBundleExpired
          ? "This collection has ended and is no longer available for purchase."
          : !hasAvailableBaseTiers && bundleUnavailabilityReason === "country"
            ? "This collection is not available in your country."
            : !hasAvailableBaseTiers && bundleUnavailabilityReason === "soldout"
              ? "This collection is sold out."
              : isAuthenticated
                ? bundleType == BundleType.SteamGame
                  ? "Keys expire 90 days after the start date of the promotion."
                  : "Your collection will be added to the cart. You can complete checkout later."
                : "Please log in to add items to your cart."}
      </p>
    </div>
  );
}
