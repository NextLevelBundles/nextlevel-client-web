"use client";

import { useState, useEffect } from "react";
import { bundles } from "@/home/data/bundles";
import { tiers } from "@/home/data/tiers";
import { charities } from "@/home/data/charities";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { BundleHero } from "./bundle-hero";
import { BundleProgress } from "./bundle-progress";
import { GameGrid } from "./game-grid";
import { CharityHighlight } from "./charity-highlight";
import { PurchaseSummary } from "./purchase-summary";
import { MobilePurchaseCTA } from "./mobile-purchase-cta";

export function BundleDetail({ bundleId }: { bundleId: number }) {
  const bundle = bundles.find((b) => b.id === bundleId);
  const [selectedTier, setSelectedTier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(bundle?.timeLeft || "00:00:00");
  const [extraAmount, setExtraAmount] = useState(0);
  const [isGridHighlighted, setIsGridHighlighted] = useState(false);

  // Update selected tier when total amount changes
  useEffect(() => {
    const totalAmount = tiers[selectedTier - 1].minPrice + extraAmount;

    // Find the highest tier that can be unlocked with the total amount
    let newTier = 1;
    for (let i = 0; i < tiers.length; i++) {
      if (totalAmount >= tiers[i].minPrice) {
        newTier = i + 1;
      }
    }

    if (newTier !== selectedTier) {
      setSelectedTier(newTier);
    }
  }, [extraAmount, selectedTier]);

  useEffect(() => {
    const timer = setInterval(() => {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + 48);

      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("ENDED");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!bundle) return <div>Bundle not found</div>;

  const selectedTierData = tiers[selectedTier - 1];
  const totalAmount = selectedTierData.minPrice + extraAmount;

  const allGames = tiers.flatMap((tier) => tier.games);
  const unlockedGames = tiers
    .slice(0, selectedTier)
    .flatMap((tier) => tier.games);

  const handleViewContentsClick = () => {
    setIsGridHighlighted(true);
    setTimeout(() => setIsGridHighlighted(false), 2000);
  };

  return (
    <TooltipProvider>
      <div className="relative">
        <BundleHero
          bundle={bundle}
          timeLeft={timeLeft}
          onViewContentsClick={handleViewContentsClick}
        />

        <div className="container max-w-[1600px] px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <div id="bundle-progressbar" className="mb-8 space-y-8">
              <BundleProgress
                tiers={tiers}
                selectedTier={selectedTier}
                onTierChange={setSelectedTier}
                totalAmount={totalAmount}
                className="dark:ring-1 dark:ring-primary/30 dark:shadow-[0_0_30px_rgba(57,130,245,0.2)]"
              />

              <GameGrid
                id="bundle-games"
                allGames={allGames}
                unlockedGames={unlockedGames}
                selectedTier={selectedTier}
                tiers={tiers}
                onTierChange={setSelectedTier}
                isHighlighted={isGridHighlighted}
              />

              <CharityHighlight
                charities={charities}
                charityAmount={totalAmount * 0.8} // Maximum possible charity amount (80%)
              />
            </div>

            <PurchaseSummary
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
