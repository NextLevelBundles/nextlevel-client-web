"use client";

import { useState, useEffect, useMemo } from "react";
import { charities } from "@/home/data/charities";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { BundleHero } from "./bundle-hero";
import { BundleProgress } from "./bundle-progress";
import { GameGrid } from "./game-grid";
import { CharityHighlight } from "./charity-highlight";
import { PurchaseSummary } from "./purchase-summary";
import { MobilePurchaseCTA } from "./mobile-purchase-cta";
import { Bundle } from "@/app/(shared)/types/bundle";
import { useCountdownTimer } from "@/app/(shared)/hooks/useCountdownTimer";

export function BundleDetail({ bundle }: { bundle: Bundle }) {
  const timeLeft = useCountdownTimer(bundle?.endsAt);
  const [selectedTier, setSelectedTier] = useState(1);
  const [extraAmount, setExtraAmount] = useState(0);
  const tiers = useMemo(() => bundle.tiers || [], [bundle]);

  // Update selected tier when total amount changes
  useEffect(() => {
    const totalAmount = tiers[selectedTier - 1].price + extraAmount;

    // Find the highest tier that can be unlocked with the total amount
    let newTier = 1;
    for (let i = 0; i < tiers.length; i++) {
      if (totalAmount >= tiers[i].price) {
        newTier = i + 1;
      }
    }

    if (newTier !== selectedTier) {
      setSelectedTier(newTier);
    }
  }, [tiers, extraAmount, selectedTier]);

  const selectedTierData = tiers[selectedTier - 1];
  const totalAmount = selectedTierData.price + extraAmount;

  const allProducts = bundle.products;

  const unlockedGames = tiers
    .slice(0, selectedTier)
    .flatMap((tier) =>
      allProducts.filter((product) => product.bundleTierId == tier.id)
    );

  return (
    <TooltipProvider>
      <div className="relative">
        <BundleHero bundle={bundle} timeLeft={timeLeft} />

        <div className="container max-w-[1600px] px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <div id="bundle-progressbar" className="mb-8 space-y-8">
              <BundleProgress
                bundle={bundle}
                selectedTier={selectedTier}
                onTierChange={setSelectedTier}
                totalAmount={totalAmount}
                className="dark:ring-1 dark:ring-primary/30 dark:shadow-[0_0_30px_rgba(57,130,245,0.2)]"
              />

              <GameGrid
                id="bundle-games"
                bundle={bundle}
                products={allProducts}
                unlockedGames={unlockedGames}
                selectedTier={selectedTier}
                tiers={tiers}
                onTierChange={setSelectedTier}
              />

              <CharityHighlight
                charities={charities}
                charityAmount={totalAmount * 0.8} // Maximum possible charity amount (80%)
              />
            </div>

            <PurchaseSummary
              bundle={bundle}
              tiers={tiers}
              selectedTier={selectedTier}
              onTierChange={setSelectedTier}
              extraAmount={extraAmount}
              setExtraAmount={setExtraAmount}
            />
          </div>

          <div className="lg:hidden">
            <MobilePurchaseCTA totalAmount={totalAmount} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
