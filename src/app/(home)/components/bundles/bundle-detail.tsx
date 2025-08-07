"use client";

import { useState, useMemo } from "react";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { BundleHero } from "./bundle-hero";
import { BundleProgress } from "./bundle-progress";
import { GameGrid } from "./game-grid";
import { CharityHighlight } from "./charity-highlight";
import { PurchaseSummary } from "./purchase-summary";
import { Bundle } from "@/app/(shared)/types/bundle";

export function BundleDetail({ bundle }: { bundle: Bundle }) {
  const [totalAmount, setTotalAmount] = useState(bundle.minPrice);
  const tiers = useMemo(() => bundle.tiers || [], [bundle]);
  const allProducts = bundle.products;

  const unlockedTiers = tiers.filter((tier) => tier.price <= totalAmount) ?? [];

  const currentTier =
    unlockedTiers.length > 0 ? unlockedTiers[unlockedTiers.length - 1] : null;

  const currentTierIndex = tiers.findIndex(
    (tier) => tier.id === currentTier?.id
  );

  const unlockedProducts = tiers
    .slice(0, currentTierIndex + 1)
    .flatMap((tier) =>
      allProducts.filter((product) => product.bundleTierId == tier.id)
    );

  const unlockedProductsValue = unlockedProducts.reduce(
    (sum, game) => sum + game.price,
    0
  );
  
  // Calculate charity amount based on the same logic as PurchaseSummary
  const isDonationTier = currentTier?.isDonationTier || false;
  const previousTier = currentTierIndex > 0 ? tiers[currentTierIndex - 1] : null;
  
  let charityAmountForDisplay = 0;
  if (isDonationTier && previousTier && currentTier) {
    const baseCharityOn5Percent = previousTier.price * 0.05;
    const tierDifference = currentTier.price - previousTier.price;
    const extraAboveTier = Math.max(0, totalAmount - currentTier.price);
    charityAmountForDisplay = baseCharityOn5Percent + tierDifference + extraAboveTier;
  } else {
    charityAmountForDisplay = totalAmount * 0.05;
  }

  return (
    <TooltipProvider>
      <div className="relative">
        <BundleHero bundle={bundle} />

        <div className="container max-w-[1600px] px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <div id="bundle-progressbar" className="mb-8 space-y-8">
              {currentTier && (
                <BundleProgress
                  bundle={bundle}
                  selectedTier={currentTier}
                  totalAmount={totalAmount}
                  unlockedProducts={unlockedProducts}
                  setTotalAmount={setTotalAmount}
                  className="dark:ring-1 dark:ring-primary/30 dark:shadow-[0_0_30px_rgba(57,130,245,0.2)]"
                />
              )}

              {currentTier && (
                <GameGrid
                  bundle={bundle}
                  products={allProducts}
                  unlockedProducts={unlockedProducts}
                  selectedTier={currentTier}
                  tiers={tiers}
                  setTotalAmount={setTotalAmount}
                />
              )}

              <CharityHighlight
                charities={bundle.charities.map((c) => c.charity)}
                charityAmount={charityAmountForDisplay}
              />
            </div>

            {currentTier && (
              <PurchaseSummary
                bundle={bundle}
                tiers={tiers}
                currentTier={currentTier}
                totalAmount={totalAmount}
                unlockedProductsValue={unlockedProductsValue}
                setTotalAmount={setTotalAmount}
              />
            )}
          </div>

          {/* <div className="lg:hidden">
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border z-50">
              <AddToCartButton
                bundleId={bundle.id}
                selectedTierId={currentTier?.id}
                totalAmount={totalAmount}
                charityPercentage={0}
              />
            </div>
          </div> */}
        </div>
      </div>
    </TooltipProvider>
  );
}
