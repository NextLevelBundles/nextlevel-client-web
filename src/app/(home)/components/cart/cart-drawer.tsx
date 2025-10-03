"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { CartButton } from "./cart-button";
import { CartItemDetails } from "./cart-item-details";
import { GiftForm } from "./gift-form";
import { TurnstileCaptcha } from "./turnstile-captcha";
import { useCart } from "@/app/(shared)/contexts/cart/cart-provider";
import { isBookBundle } from "@/app/(shared)/utils/cart";
import { getTrackdeskCid, getAffS1 } from "@/app/(shared)/lib/trackdesk";
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

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
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

    // Show captcha if no token
    if (!captchaToken) {
      setShowCaptcha(true);
      return;
    }

    setIsCheckoutLoading(true);
    try {
      // Capture Trackdesk cid and affS1 for conversion tracking
      const trackdeskCid = getTrackdeskCid();
      const affS1 = getAffS1();

      // Validate: if affS1 exists, trackdeskCid must also exist
      if (affS1 && !trackdeskCid) {
        toast.error("Affiliate tracking error. Please try again or contact support.");
        setIsCheckoutLoading(false);
        return;
      }

      const response = await reserveCart(captchaToken, trackdeskCid, affS1);
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
      // Capture Trackdesk cid and affS1 for conversion tracking
      const trackdeskCid = getTrackdeskCid();
      const affS1 = getAffS1();

      // Validate: if affS1 exists, trackdeskCid must also exist
      if (affS1 && !trackdeskCid) {
        toast.error("Affiliate tracking error. Please try again or contact support.");
        setCaptchaToken(null);
        setIsCheckoutLoading(false);
        return;
      }

      const response = await reserveCart(token, trackdeskCid, affS1);
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
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
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
                    className="cursor-pointer text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Cart
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
              Browse our amazing bundles and add some games to your cart!
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1">
              <div className="space-y-4 py-4">
                {cart?.items.map((item) => (
                  <div key={item.id} className="group relative">
                    <div
                      className={`p-4 rounded-lg border transition-colors ${
                        item.isGift
                          ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {/* Gift indicator */}
                      {item.isGift && (
                        <div className="flex items-center gap-1 mb-2 text-xs text-primary">
                          <Gift className="h-3 w-3" />
                          <span className="font-medium">
                            Gift{" "}
                            {item.giftRecipientEmail
                              ? `for ${item.giftRecipientEmail}`
                              : ""}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-muted">
                          <Image
                            fill
                            sizes="64px"
                            src={item.snapshotImageUrl ?? ""}
                            alt={item.snapshotTitle ?? "Cart item image"}
                            className="object-cover"
                          />
                          {/* Bundle type indicator */}
                          <div className={`absolute bottom-1 left-1 p-1 rounded-full ${
                            isBookBundle(item) 
                              ? "bg-amber-500" 
                              : "bg-blue-500"
                          }`}>
                            {isBookBundle(item) ? (
                              <BookOpen className="h-3 w-3 text-white" />
                            ) : (
                              <Gamepad2 className="h-3 w-3 text-white" />
                            )}
                          </div>
                          {item.isGift && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Gift className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h4 className="font-semibold text-sm line-clamp-2">
                              {item.snapshotTitle}
                            </h4>
                          </div>
                          
                          {/* Bundle type badge */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                              isBookBundle(item)
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            }`}>
                              {isBookBundle(item) ? (
                                <><BookOpen className="h-3 w-3" /> Book Bundle</>
                              ) : (
                                <><Gamepad2 className="h-3 w-3" /> Game Bundle</>
                              )}
                            </span>
                          </div>

                          {/* Charity tier indicator */}
                          {item.charityAmount && item.charityAmount > 0 && (
                            <div className="flex items-center gap-1 mb-2 text-xs text-rose-600 dark:text-rose-400">
                              <Heart className="h-3 w-3 fill-rose-500" />
                              <span className="font-medium">
                                Charity: ${item.charityAmount.toFixed(2)} to charity
                              </span>
                            </div>
                          )}

                          {/* Upsell tier indicator */}
                          {item.upsellAmount && item.upsellAmount > 0 && (
                            <div className="flex items-center gap-1 mb-2 text-xs text-purple-600 dark:text-purple-400">
                              <Gamepad2 className="h-3 w-3" />
                              <span className="font-medium">
                                Developer Support: ${item.upsellAmount.toFixed(2)} to developers
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <CartItemDetails item={item} />
                            </div>

                            <div className="text-right">
                              <div className="font-semibold text-sm">
                                ${item.price?.toFixed(2)}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {item.snapshotProducts.length} games
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFromCart(item.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Gift form */}
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <GiftForm
                          item={item}
                          onGiftUpdate={updateGiftSettings}
                          isUpdating={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t py-4 space-y-4">
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
                {/* <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div> */}
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
              <p className="text-xs text-center text-muted-foreground mb-2">
                {cart?.reservationStatus === "Active"
                  ? "You have already reserved your Steam keys. Proceed to Checkout"
                  : `Steam keys are reserved for 5 minutes once you click "Proceed to Checkout"`}
              </p>
            </div>
          </div>
        )}
      </SheetContent>

      <TurnstileCaptcha
        isOpen={showCaptcha}
        onVerified={handleCaptchaVerified}
        onClose={handleCaptchaClose}
      />
    </Sheet>
  );
}
