"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Stamp as Steam, Gift, DollarSign, Heart } from "lucide-react";
import { cn } from "@/shared/utils/tailwind";
import { Bundle, Tier } from "@/app/(shared)/types/bundle";
import { AddToCartButton } from "../cart/add-to-cart-button";

interface PurchaseSummaryProps {
  bundle: Bundle;
  tiers: Tier[];
  currentTier: Tier;
  totalAmount: number;
  unlockedProductsValue: number;
  setTotalAmount: (amount: number) => void;
}

export function PurchaseSummary({
  bundle,
  tiers,
  totalAmount,
  currentTier,
  unlockedProductsValue,
  setTotalAmount,
}: PurchaseSummaryProps) {
  const [customInputValue, setCustomInputValue] = useState("");
  const [inputTimeout, setInputTimeout] = useState<NodeJS.Timeout>();

  const minimumPrice = tiers[0].price;
  const isDonationTier = currentTier?.isDonationTier || false;

  // Find the previous tier (the one before the charity tier)
  const currentTierIndex = tiers.findIndex((t) => t.id === currentTier?.id);
  const previousTier =
    currentTierIndex > 0 ? tiers[currentTierIndex - 1] : null;

  // Calculate charity amount based on new logic
  let totalCharityAmount = 0;
  let publisherAmount = 0;
  let platformAmount = 0;

  if (isDonationTier && previousTier) {
    // For charity tier: 5% of previous tier price + difference between tiers + any extra
    const baseCharityOn5Percent = previousTier.price * 0.05;
    const tierDifference = currentTier.price - previousTier.price;
    const extraAboveTier = Math.max(0, totalAmount - currentTier.price);
    totalCharityAmount = baseCharityOn5Percent + tierDifference + extraAboveTier;

    // Rest goes to publishers (75%) and platform (20%) based on previous tier price
    publisherAmount = previousTier.price * 0.75;
    platformAmount = previousTier.price * 0.2;
  } else {
    // Standard distribution: 5% charity, 75% publishers, 20% platform
    totalCharityAmount = totalAmount * 0.05;
    publisherAmount = totalAmount * 0.75;
    platformAmount = totalAmount * 0.2;
  }

  return (
    <div className="lg:sticky lg:top-20 lg:h-fit space-y-4 lg:w-[350px] w-full animate-fade-up">
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
                  "w-full font-mono transition-all duration-300 relative",
                  totalAmount === tier.price &&
                    "bg-primary text-white font-semibold shadow-md shadow-primary/20 dark:shadow-primary/30 hover:shadow-lg hover:shadow-primary/30 dark:hover:shadow-primary/40 border-primary hover:scale-[1.02]",
                  tier.isDonationTier && "border-rose-300 hover:border-rose-400"
                )}
              >
                {tier.isDonationTier && (
                  <Heart className="absolute top-1 right-1 h-3 w-3 text-rose-500 fill-rose-500" />
                )}
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
              <h4 className="text-sm font-medium">Revenue Distribution</h4>
              <span className="text-xs text-muted-foreground">
                {isDonationTier ? "Charity Tier" : "Fixed split"}
              </span>
            </div>

            {/* Distribution Bar */}
            <div className="relative h-6 rounded-lg overflow-hidden flex">
              <div
                className="bg-yellow-400 dark:bg-yellow-600 transition-all"
                style={{ width: `${(publisherAmount / totalAmount) * 100}%` }}
              />
              <div
                className="bg-blue-400 dark:bg-blue-600 transition-all"
                style={{ width: `${(platformAmount / totalAmount) * 100}%` }}
              />
              <div
                className="bg-rose-400 dark:bg-rose-600 transition-all"
                style={{
                  width: `${(totalCharityAmount / totalAmount) * 100}%`,
                }}
              />
            </div>

            {/* Distribution Labels */}
            <div className="space-y-2 mt-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-400 dark:bg-yellow-600" />
                  <span className="text-sm font-medium">
                    Publishers{!isDonationTier ? " (75%)" : ""}
                  </span>
                </div>
                <span className="text-sm font-bold">${publisherAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-400 dark:bg-blue-600" />
                  <span className="text-sm font-medium">
                    Platform{!isDonationTier ? " (20%)" : ""}
                  </span>
                </div>
                <span className="text-sm font-bold">${platformAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-rose-400 dark:bg-rose-600" />
                  <span className="text-sm font-medium">
                    {/* <Heart className="inline h-3 w-3 mr-1" /> */}
                    Charity{!isDonationTier ? " (5%)" : ""}
                  </span>
                </div>
                <span className="text-sm font-bold">${totalCharityAmount.toFixed(2)}</span>
              </div>
            </div>

            {isDonationTier && previousTier && (
              <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                    <Heart className="inline h-3 w-3 mr-1 fill-rose-500" />
                    Charity Tier Active!
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    • Base: ${(previousTier.price * 0.05).toFixed(2)}
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    • Charity tier: ${(currentTier.price - previousTier.price).toFixed(2)}
                  </p>
                  {totalAmount > currentTier.price && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      • Your extra contribution: ${(totalAmount - currentTier.price).toFixed(2)}
                    </p>
                  )}
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 pt-1 border-t border-rose-200 dark:border-rose-700">
                    Total to charity: ${totalCharityAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="py-4 border-t border-gray-100 dark:border-border">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total</span>
            <span>${totalAmount}</span>
          </div>

          <AddToCartButton
            bundleId={bundle.id}
            selectedTierId={currentTier.id}
            totalAmount={totalAmount}
            isDonationTier={isDonationTier}
          />
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
