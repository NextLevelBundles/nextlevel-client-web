"use client";

import { useState } from "react";
import { Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { CartButton } from "./cart-button";
import { CartItemDetails } from "./cart-item-details";
import { useCart } from "@/app/(shared)/contexts/cart/cart-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/(shared)/components/ui/sheet";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "@/app/(shared)/components/ui/button";
import Image from "next/image";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    cart,
    removeFromCart,
    getTotalItems,
    getTotalPrice,
    isLoading,
    // refreshCart,
  } = useCart();

  // Refresh cart when drawer opens to ensure fresh data
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && cart) {
      // refreshCart();
    }
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <CartButton />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({totalItems})
          </SheetTitle>
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
                    <div className="flex gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                        <Image
                          width={200}
                          height={200}
                          src={item.snapshotImageUrl ?? ""}
                          alt={item.snapshotTitle ?? "Cart item image"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                          {item.snapshotTitle}
                        </h4>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <CartItemDetails item={item} />
                          </div>

                          <div className="text-right">
                            <div className="font-semibold text-sm">
                              ${item.price.toFixed(2)}
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
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t py-4 space-y-4">
              {cart?.reservationStatus === "Active" &&
                cart.reservationExpiresAt && (
                  <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                      <span className="font-medium text-secondary">
                        Reserved until{" "}
                        {new Date(
                          cart.reservationExpiresAt
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                size="lg"
                disabled={isLoading || totalItems === 0}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
