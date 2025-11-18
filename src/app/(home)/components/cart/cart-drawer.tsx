"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  ShoppingBag,
  CreditCard,
  Loader2,
  Clock,
  X,
  Gift,
  Heart,
  BookOpen,
  Gamepad2,
  Info,
} from "lucide-react";
import { CartButton } from "./cart-button";
import { GiftForm } from "./gift-form";
import { TurnstileCaptcha } from "./turnstile-captcha";
import { CartItemModal } from "./cart-item-modal";
import { useCart } from "@/app/(shared)/contexts/cart/cart-provider";
import { isBookBundle } from "@/app/(shared)/utils/cart";
import { getTrackdeskCid, getLinkId } from "@/app/(shared)/lib/trackdesk";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/(shared)/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/(shared)/components/ui/alert-dialog";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "@/app/(shared)/components/ui/button";
import Image from "next/image";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { padded } from "@/app/(shared)/utils/numbers";
import { toast } from "sonner";

dayjs.extend(duration);

// Bot verification configuration
// Set to false to disable Cloudflare Turnstile captcha verification
const ENABLE_BOT_VERIFICATION = false;

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<any | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const {
    cart,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isLoading,
    reserveCart,
    updateGiftSettings,
    // refreshCart,
  } = useCart();

  // Auto-expand gift items when cart changes
  useEffect(() => {
    if (cart?.items) {
      const giftItemsExpanded: Record<string, boolean> = {};
      cart.items.forEach((item) => {
        if (item.isGift) {
          giftItemsExpanded[item.id] = true;
        }
      });
      // Merge with existing expanded items, but prioritize gift items
      setExpandedItems((prev) => ({
        ...prev,
        ...giftItemsExpanded,
      }));
    }
  }, [cart?.items]);

  const toggleItemExpanded = (itemId: string, isGift: boolean) => {
    // Don't allow collapsing gift items
    if (isGift && expandedItems[itemId]) {
      return;
    }
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Refresh cart when drawer opens to ensure fresh data
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && cart) {
      // refreshCart();
    }
    // Reset captcha token when drawer is closed
    if (!open) {
      setCaptchaToken(null);
    }
  };

  // Validation helper
  const validateGiftItems = () => {
    if (!cart?.items) return { isValid: true, error: null };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const item of cart.items) {
      if (item.isGift) {
        if (!item.giftRecipientEmail) {
          return {
            isValid: false,
            error: `Gift recipient email is required for "${item.snapshotTitle}"`,
          };
        }
        if (!emailRegex.test(item.giftRecipientEmail)) {
          return {
            isValid: false,
            error: `Please enter a valid email address for "${item.snapshotTitle}"`,
          };
        }
      }
    }

    return { isValid: true, error: null };
  };

  const handleCheckout = async () => {
    // Validate gift items before checkout
    const validation = validateGiftItems();
    if (!validation.isValid) {
      toast.error(validation.error!);
      return;
    }

    // Check if bot verification is enabled
    if (ENABLE_BOT_VERIFICATION) {
      // Show captcha if no token
      if (!captchaToken) {
        setShowCaptcha(true);
        return;
      }
    }

    setIsCheckoutLoading(true);
    try {
      // Capture Trackdesk cid and linkId for conversion tracking
      const trackdeskCid = getTrackdeskCid();
      const linkId = getLinkId();

      const finalCid = trackdeskCid && linkId ? trackdeskCid : null;
      const finalLinkId = linkId && trackdeskCid ? linkId : null;

      // Use captcha token if bot verification is enabled, otherwise pass undefined
      const tokenToUse = ENABLE_BOT_VERIFICATION ? captchaToken : undefined;
      const response = await reserveCart(
        tokenToUse ?? undefined,
        finalCid,
        finalLinkId
      );

      // Redirect to Stripe checkout
      window.location.href = response.url;
    } catch (error) {
      console.error("Checkout failed:", error);
      // Toast error is handled by the global ClientApi error handler
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleCaptchaVerified = async (token: string) => {
    setCaptchaToken(token);
    setShowCaptcha(false);

    // Now proceed with the actual checkout
    setIsCheckoutLoading(true);
    try {
      // Capture Trackdesk cid and linkId for conversion tracking

      const trackdeskCid = getTrackdeskCid();
      const linkId = getLinkId();

      const finalCid = trackdeskCid && linkId ? trackdeskCid : null;
      const finalLinkId = linkId && trackdeskCid ? linkId : null;

      const response = await reserveCart(token, finalCid, finalLinkId);
      // Redirect to Stripe checkout
      window.location.href = response.url;
    } catch (error) {
      console.error("Checkout failed:", error);
      // Reset token on failure so user can try again
      setCaptchaToken(null);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleCaptchaClose = () => {
    setShowCaptcha(false);
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      // Toast error is handled by the global ClientApi error handler
    }
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Custom countdown timer for cart reservations (minutes:seconds only)
  const [reservationTimeLeft, setReservationTimeLeft] = useState<string>("");

  useEffect(() => {
    function updateCartCountdown() {
      if (!cart?.reservationExpiresAt) {
        setReservationTimeLeft("");
        return;
      }

      const future = dayjs(cart.reservationExpiresAt);
      const now = dayjs();
      const diffMs = future.diff(now);

      if (diffMs <= 0) {
        setReservationTimeLeft("Expired");
        return;
      }

      const dur = dayjs.duration(diffMs);
      const minutes = padded(dur.minutes());
      const seconds = padded(dur.seconds());

      setReservationTimeLeft(`${minutes}:${seconds}`);
    }

    updateCartCountdown();
    const timer = setInterval(updateCartCountdown, 1000);
    return () => clearInterval(timer);
  }, [cart?.reservationExpiresAt]);

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <CartButton />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg" hideCloseButton={false}>
        <SheetHeader>
          <div className="flex flex-col gap-3">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart ({totalItems})
            </SheetTitle>
            {totalItems > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer text-muted-foreground hover:text-destructive transition-colors w-full justify-start"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Clear All Items
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Cart</AlertDialogTitle>
                    <AlertDialogDescription>
                      {cart?.reservationStatus === "Active"
                        ? "Are you sure you want to clear your cart? This will release your reserved Steam keys and they may become unavailable."
                        : "Are you sure you want to clear your cart? This will remove all items from your cart."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearCart}>
                      Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </SheetHeader>

        {cart?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Browse our amazing collections and add some Steam games to your
              cart!
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 overflow-auto">
              <div className="space-y-4 py-4 pb-4">
                {cart?.items.map((item) => {
                  const isExpanded = expandedItems[item.id] || false;

                  return (
                    <div key={item.id} className="group relative">
                      <div
                        className={`p-3 sm:p-4 rounded-lg border transition-colors ${
                          item.isGift
                            ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {/* Delete button - always visible for better UX */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer absolute top-2 right-2 h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive transition-colors z-10"
                          onClick={() => removeFromCart(item.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>

                        {/* Gift indicator */}
                        {item.isGift && (
                          <div className="flex items-center gap-1 mb-2 text-xs text-primary pr-8">
                            <Gift className="h-3 w-3" />
                            <span className="font-medium truncate">
                              Gift{" "}
                              {item.giftRecipientEmail
                                ? `for ${item.giftRecipientEmail}`
                                : ""}
                            </span>
                          </div>
                        )}

                        {/* Main content - image and title */}
                        <div className="flex gap-3 sm:gap-4 pr-8 sm:pr-10">
                          <div className="relative w-14 h-20 sm:w-16 sm:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                            <Image
                              fill
                              sizes="(max-width: 640px) 56px, 64px"
                              src={item.snapshotImageUrl ?? ""}
                              alt={item.snapshotTitle ?? "Cart item image"}
                              className="object-contain"
                            />
                            {/* Bundle type indicator */}
                            <div
                              className={`absolute bottom-1 left-1 p-0.5 sm:p-1 rounded-full ${
                                isBookBundle(item)
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                              }`}
                            >
                              {isBookBundle(item) ? (
                                <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                              ) : (
                                <Gamepad2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                              )}
                            </div>
                            {item.isGift && (
                              <div className="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center">
                                <Gift className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                              <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                                {item.snapshotTitle}
                              </h4>
                              <div className="text-right shrink-0">
                                <div className="font-semibold text-sm">
                                  ${item.totalAmount?.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {item.snapshotProducts.length}{" "}
                                {isBookBundle(item) ? "books" : "games"}
                              </span>

                              {!item.isGift && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-6 sm:h-7 px-2 hover:bg-primary/10 hover:text-primary transition-colors"
                                  onClick={() =>
                                    toggleItemExpanded(item.id, !!item.isGift)
                                  }
                                >
                                  {isExpanded ? "Hide" : "Details"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded details - full width below main content */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                            {/* Bundle type badge */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                  isBookBundle(item)
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                                }`}
                              >
                                {isBookBundle(item) ? (
                                  <>
                                    <BookOpen className="h-3 w-3" /> Book
                                    Collection
                                  </>
                                ) : (
                                  <>
                                    <Gamepad2 className="h-3 w-3" /> Steam Game
                                    Collection
                                  </>
                                )}
                              </span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs w-full hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
                              onClick={() => setModalItem(item)}
                            >
                              <Info className="h-3 w-3 mr-1" />
                              View Full Summary
                            </Button>

                            {/* Gift form in expanded section */}
                            <GiftForm
                              item={item}
                              onGiftUpdate={updateGiftSettings}
                              isUpdating={isLoading}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="shrink-0 mt-auto -mx-6 border-t bg-card/95 backdrop-blur-lg shadow-[0_-4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)]">
              <div className="px-6 pt-4 pb-16 space-y-3">
                {cart?.reservationStatus === "Active" &&
                  cart.reservationExpiresAt &&
                  reservationTimeLeft !== "Expired" && (
                    <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                        <Clock className="h-4 w-4 text-secondary" />
                        <span className="font-medium text-secondary">
                          Reservation expires in {reservationTimeLeft}
                        </span>
                      </div>
                    </div>
                  )}

                {(cart?.reservationStatus === "Expired" ||
                  (cart?.reservationStatus === "Active" &&
                    reservationTimeLeft === "Expired")) && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <Clock className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-600 dark:text-red-400">
                        Reservation expired - Steam keys have been released
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="cursor-pointer w-full bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  size="lg"
                  disabled={isLoading || totalItems === 0 || isCheckoutLoading}
                  onClick={handleCheckout}
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>

                <div className="space-y-1.5">
                  <p className="text-xs text-center text-muted-foreground">
                    * Sales tax may be calculated during checkout depending on
                    your location
                  </p>
                  <p className="text-xs text-center text-muted-foreground">
                    {cart?.reservationStatus === "Active"
                      ? "You have already reserved your Steam keys. Proceed to Checkout"
                      : `Steam keys are reserved for 10 minutes once you click "Proceed to Checkout"`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>

      {/* Only render captcha component if bot verification is enabled */}
      {ENABLE_BOT_VERIFICATION && (
        <TurnstileCaptcha
          isOpen={showCaptcha}
          onVerified={handleCaptchaVerified}
          onClose={handleCaptchaClose}
        />
      )}

      {/* Cart Item Modal with Details and Revenue tabs */}
      <CartItemModal
        item={modalItem}
        isOpen={!!modalItem}
        onClose={() => setModalItem(null)}
      />
    </Sheet>
  );
}
