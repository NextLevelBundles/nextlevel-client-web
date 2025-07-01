"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Stamp as Steam,
  Gift,
  DollarSign,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { Slider } from "@/shared/components/ui/slider";
import { cn } from "@/shared/utils/tailwind";
import { Tier } from "@/app/(shared)/types/bundle";

interface PurchaseSummaryProps {
  tiers: Tier[];
  currentTier: Tier;
  totalAmount: number;
  unlockedProductsValue: number;
  setTotalAmount: (amount: number) => void;
}

export function PurchaseSummary({
  tiers,
  totalAmount,
  currentTier,
  unlockedProductsValue,
  setTotalAmount,
}: PurchaseSummaryProps) {
  const [charityPercentage, setCharityPercentage] = useState(40);
  const [customInputValue, setCustomInputValue] = useState("");
  const [inputTimeout, setInputTimeout] = useState<NodeJS.Timeout>();

  const minimumPrice = tiers[0].price;
  const charityAmount = Math.round(totalAmount * (charityPercentage / 100));
  const publisherAmount = totalAmount - charityAmount;

  const checkout = async () => {
    try {
      const response = await fetch(
        `https://localhost:7100/api/publisher/checkout/create-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const responseJson = await response.json();
      console.log("Checkout session created:", responseJson);
      window.open(responseJson.url, "_blank");
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong while starting checkout.");
    }
  };

  return (
    <div className="lg:sticky lg:top-20 lg:h-fit space-y-4 w-[350px] animate-fade-up">
      <Card className="p-6 bg-white dark:bg-card/70 backdrop-blur-xs border border-gray-100 dark:border-border shadow-xs hover:shadow-md transition-all duration-300 rounded-xl">
        <h3 className="font-rajdhani text-xl font-bold mb-4">Bundle Summary</h3>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              You&apos;re getting ${unlockedProductsValue.toFixed(2)} worth of
              games
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Get a smaller bundle for less, or go all-in to support good work and
            good causes.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {tiers.map((tier) => (
              <Button
                key={tier.id}
                variant={currentTier?.id === tier.id ? "default" : "outline"}
                onClick={() => {
                  setCustomInputValue("");
                  setTotalAmount(tier.price);
                }}
                className={cn(
                  "w-full font-mono transition-all duration-300",
                  totalAmount === tier.price &&
                    "bg-primary text-white font-semibold shadow-md shadow-primary/20 dark:shadow-primary/30 hover:shadow-lg hover:shadow-primary/30 dark:hover:shadow-primary/40 border-primary hover:scale-[1.02]"
                )}
              >
                ${tier.price}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              step="1"
              value={customInputValue}
              onChange={(e) => {
                const inputValue = e.target.value;
                setCustomInputValue(inputValue);

                // Clear existing timeout
                if (inputTimeout) {
                  clearTimeout(inputTimeout);
                }

                // Set new timeout
                const timeout = setTimeout(() => {
                  if (inputValue === "") {
                    setTotalAmount(0);
                    return;
                  }

                  const parsedValue = parseFloat(inputValue);
                  if (!isNaN(parsedValue) && parsedValue >= minimumPrice) {
                    const roundedValue = Math.round(parsedValue);
                    setTotalAmount(roundedValue);
                  }
                }, 300);

                setInputTimeout(timeout);
              }}
              placeholder={`Enter custom amount`}
              className="pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-left font-mono bg-white dark:bg-card border-gray-200 dark:border-border focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Distribution</h4>
              <span className="text-xs text-muted-foreground">
                Drag to adjust split
              </span>
            </div>

            {/* Distribution Bar */}
            <div className="relative h-4 rounded-lg">
              {/* Slider Handle */}
              <Slider
                value={[charityPercentage]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => setCharityPercentage(value)}
                className="absolute inset-0 cursor-ew-resize"
                backgroundClass="bg-rose-300 dark:bg-rose-700"
                leftTrackClass="bg-yellow-400 dark:bg-yellow-600"
                handleClass="bg-background border border-border w-2.5 h-4 rounded-sm shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Distribution Labels */}
            <div className="flex justify-between mt-3">
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center relative group">
                  <div className="flex items-center gap-1">
                    <Gift className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      To Publishers
                    </span>
                  </div>
                  <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300/90">
                    ${publisherAmount}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center relative group">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-rose-500 dark:text-rose-300" />
                    <span className="text-sm font-medium text-rose-500 dark:text-rose-300">
                      To Charity
                    </span>
                  </div>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-300/90">
                    ${charityAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-border">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total</span>
            <span>${totalAmount}</span>
          </div>
          <Button
            onClick={checkout}
            className="w-full bg-primary text-white hover:bg-primary/90 shadow-xs hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all duration-300 h-14 text-lg font-medium px-8 py-4 rounded-xl ring-1 ring-primary/50 hover:ring-primary hover:scale-[1.02]"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Your bundle will be added to the cart. You can complete checkout
            later.
          </p>
        </div>
      </Card>

      <Card className="p-4 bg-white dark:bg-card/70 backdrop-blur-xs border border-gray-100 dark:border-border shadow-xs rounded-xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Steam className="h-4 w-4" />
          <span>Steam keys delivered instantly</span>
        </div>
      </Card>
    </div>
  );
}
