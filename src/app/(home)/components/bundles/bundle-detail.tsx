"use client";

import { useState, useEffect } from "react";
import { charities } from "@/home/data/charities";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { BundleHero } from "./bundle-hero";
import { BundleProgress } from "./bundle-progress";
import { GameGrid } from "./game-grid";
import { CharityHighlight } from "./charity-highlight";
import { PurchaseSummary } from "./purchase-summary";
import { MobilePurchaseCTA } from "./mobile-purchase-cta";
import { Bundle } from "@/app/(shared)/types/bundle";

export function getTimeDifference(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const diffInMs = Math.abs(end.getTime() - start.getTime());

  const totalSeconds = Math.floor(diffInMs / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function BundleDetail({ bundle }: { bundle: Bundle }) {
  const [selectedTier, setSelectedTier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(
    getTimeDifference(bundle.startsAt, bundle.endsAt) || "00:00:00"
  );
  const [extraAmount, setExtraAmount] = useState(0);
  const [isGridHighlighted, setIsGridHighlighted] = useState(false);
  const tiers = bundle.tiers || [];

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
  }, [bundle.tiers, extraAmount, selectedTier]);

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
  const totalAmount = selectedTierData.price + extraAmount;

  const allProducts = bundle.products;

  const unlockedGames = tiers
    .slice(0, selectedTier)
    .flatMap((tier) =>
      allProducts.filter((product) => product.bundleTierId == tier.id)
    );

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
                isHighlighted={isGridHighlighted}
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
