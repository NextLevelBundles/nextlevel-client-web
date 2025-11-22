"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import { useCart } from "@/app/(shared)/contexts/cart/cart-provider";
import { cn } from "@/app/(shared)/utils/tailwind";
import { AddToCartRequest } from "@/lib/api/types/cart";
import { Check, Loader2, ShoppingCart, LogIn, AlertCircle, ArrowRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { useRouter } from "next/navigation";
import { BundleType } from "@/app/(shared)/types/bundle";
import { useCartDrawer } from "./cart-drawer-context";

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
  onOpenCart?: () => void;
}

type ButtonState =
  | "add-to-cart"      // Blue - initial state
  | "update-cart"      // Blue - when user makes changes after adding
  | "adding"           // Loading spinner
  | "added"            // Green - "Added to Cart" (2 seconds)
  | "proceed"          // Green - "Proceed to Checkout"
  | "error";           // Red - error state (2 seconds)

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
  onOpenCart,
}: AddToCartButtonProps) {
  const { addToCart, isLoading, cart } = useCart();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const { openDrawer } = useCartDrawer();
  const [buttonState, setButtonState] = useState<ButtonState>("add-to-cart");

  // Check if this bundle is already in the cart
  const cartItemForBundle = useMemo(() => {
    if (!cart?.items) return null;
    return cart.items.find(item => item.bundleId === bundleId);
  }, [cart?.items, bundleId]);

  // Create a signature of current selections to detect changes
  const currentSelectionSignature = useMemo(() => {
    const upsellIds = [...selectedUpsellTierIds].sort().join(',');
    return `${baseTierId}-${charityTierId || 'none'}-${tipAmount}-${upsellIds}`;
  }, [baseTierId, charityTierId, tipAmount, selectedUpsellTierIds]);

  // Track the last added selection signature
  const [lastAddedSignature, setLastAddedSignature] = useState<string | null>(null);

  // When bundle is in cart and user is in "proceed" state, detect changes
  useEffect(() => {
    if (buttonState === "proceed" && lastAddedSignature && currentSelectionSignature !== lastAddedSignature) {
      setButtonState("update-cart");
    }
  }, [currentSelectionSignature, lastAddedSignature, buttonState]);

  const handleAddToCart = async () => {
    setButtonState("adding");
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

      // Save the current selection signature
      setLastAddedSignature(currentSelectionSignature);

      // Show "Added to Cart" for 2 seconds
      setButtonState("added");
      setTimeout(() => {
        setButtonState("proceed");
      }, 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // Show error state for 2 seconds
      setButtonState("error");
      setTimeout(() => {
        setButtonState(cartItemForBundle ? "proceed" : "add-to-cart");
      }, 2000);
    }
  };

  const handleSignIn = () => {
    const signInUrl = new URL("/auth/signin", window.location.origin);
    signInUrl.searchParams.set("callbackUrl", window.location.pathname);
    router.push(signInUrl.toString());
  };

  const handleProceedToCheckout = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      openDrawer();
    }
  };

  const isAuthenticated = !!user;
  const isLoadingSession = isLoadingAuth;

  const isDisabled =
    disabled ||
    isLoading ||
    buttonState === "adding" ||
    totalAmount <= 0 ||
    !baseTierId ||
    isLoadingSession ||
    isBundleExpired ||
    !hasAvailableBaseTiers ||
    buttonState === "added" ||
    buttonState === "error";

  // Determine button styling based on state
  const getButtonStyles = () => {
    switch (buttonState) {
      case "added":
      case "proceed":
        return "bg-green-500 hover:bg-green-600 ring-green-500 hover:ring-green-600 shadow-green-500/20";
      case "error":
        return "bg-red-500 hover:bg-red-600 ring-red-500 hover:ring-red-600 shadow-red-500/20";
      default:
        return "bg-primary hover:bg-primary/90 ring-primary/50 hover:ring-primary shadow-primary/30 dark:shadow-primary/40";
    }
  };

  // Determine button click handler
  const getClickHandler = () => {
    if (!isAuthenticated) return handleSignIn;
    if (buttonState === "proceed") return handleProceedToCheckout;
    return handleAddToCart;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={getClickHandler()}
        disabled={isDisabled}
        className={cn(
          "cursor-pointer relative overflow-hidden transition-all duration-300 w-full text-white shadow-xs hover:shadow-xl h-14 text-lg font-medium px-8 py-4 rounded-xl ring-1 hover:scale-[1.02]",
          getButtonStyles(),
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
        ) : buttonState === "adding" ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Adding to Cart...
          </>
        ) : buttonState === "added" ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Added to Cart
          </>
        ) : buttonState === "proceed" ? (
          <>
            Proceed to Checkout
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        ) : buttonState === "update-cart" ? (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Update Cart
          </>
        ) : buttonState === "error" ? (
          <>
            <AlertCircle className="mr-2 h-5 w-5" />
            Error adding to cart
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
