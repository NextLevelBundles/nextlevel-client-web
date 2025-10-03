"use client";

import { useState, useMemo, useEffect } from "react";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { BundleHero } from "./bundle-hero";
import { BundleProgress } from "./bundle-progress";
import { ProductGrid } from "./product-grid";
import { CharityHighlight } from "./charity-highlight";
import { PurchaseSummary } from "./purchase-summary";
import { CuratorComments } from "./curator-comments";
import { CharityTierSection } from "./charity-tier-section";
import { UpsellTierSection } from "./upsell-tier-section";
import { Bundle, BundleType, TierType } from "@/app/(shared)/types/bundle";
import { useBundleBookFormats } from "@/hooks/queries/useBundleBookFormats";

export function BundleDetail({ bundle }: { bundle: Bundle }) {
  const [baseAmount, setBaseAmount] = useState(bundle.minPrice);
  const [isCharitySelected, setIsCharitySelected] = useState(false);
  const [isUpsellSelected, setIsUpsellSelected] = useState(false);

  const tiers = useMemo(() => bundle.tiers || [], [bundle]);
  const allProducts = bundle.products;

  // Fetch book formats for book bundles
  // Check both 'type' and 'bundleType' properties for compatibility
  const isBookBundle = bundle.type === BundleType.EBook;
  const { data: bookFormats } = useBundleBookFormats(bundle.id, isBookBundle);

  // Separate tiers by type
  const baseTiers = tiers.filter((tier) => tier.type === TierType.Base);
  const charityTier = tiers.find((tier) => tier.type === TierType.Charity);
  const upsellTier = tiers.find((tier) => tier.type === TierType.Upsell);

  // Get the highest base tier price
  const highestBaseTierPrice = baseTiers.length > 0
    ? baseTiers[baseTiers.length - 1].price
    : 0;

  // Automatically handle charity tier based on custom amount
  useEffect(() => {
    if (charityTier && baseAmount >= highestBaseTierPrice + charityTier.price) {
      // If custom amount is >= highest base tier + charity tier price, unlock charity tier
      setIsCharitySelected(true);
    } else if (charityTier && baseAmount < highestBaseTierPrice + charityTier.price) {
      // If custom amount drops below threshold, remove charity tier
      setIsCharitySelected(false);
    }
  }, [baseAmount, highestBaseTierPrice, charityTier]);

  // Calculate total amount including addons
  const totalAmount = baseAmount +
    (isCharitySelected && charityTier ? charityTier.price : 0) +
    (isUpsellSelected && upsellTier ? upsellTier.price : 0);

  const unlockedTiers = tiers.filter((tier) => tier.price <= baseAmount) ?? [];

  // Use only base tiers for determining the current tier
  const unlockedBaseTiers = baseTiers.filter((tier) => tier.price <= baseAmount);
  const currentTier =
    unlockedBaseTiers.length > 0 ? unlockedBaseTiers[unlockedBaseTiers.length - 1] : null;

  const currentTierIndex = baseTiers.findIndex(
    (tier) => tier.id === currentTier?.id
  );

  // Get base tier unlocked products
  const baseUnlockedProducts = baseTiers
    .slice(0, currentTierIndex + 1)
    .flatMap((tier) =>
      allProducts.filter((product) => product.bundleTierId == tier.id)
    );

  // Add addon tier products if selected
  const charityProducts = isCharitySelected && charityTier
    ? allProducts.filter((product) => product.bundleTierId === charityTier.id)
    : [];
  const upsellProducts = isUpsellSelected && upsellTier
    ? allProducts.filter((product) => product.bundleTierId === upsellTier.id)
    : [];

  const unlockedProducts = [
    ...baseUnlockedProducts,
    ...charityProducts,
    ...upsellProducts
  ];

  const unlockedProductsValue = unlockedProducts.reduce(
    (sum, game) => sum + game.price,
    0
  );

  // Calculate charity amount for display
  let charityAmountForDisplay = 0;
  if (isCharitySelected && charityTier) {
    // Full charity tier amount goes to charity
    charityAmountForDisplay = charityTier.price;
  } else if (baseAmount > highestBaseTierPrice) {
    // Custom amount above highest base tier - extra goes to charity
    const extraAmount = baseAmount - highestBaseTierPrice;
    charityAmountForDisplay = (highestBaseTierPrice * 0.05) + extraAmount;
  } else {
    // Standard 5% charity for base amount only
    charityAmountForDisplay = baseAmount * 0.05;
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
                  totalAmount={baseAmount}
                  unlockedProducts={baseUnlockedProducts}
                  setTotalAmount={setBaseAmount}
                  className="dark:ring-1 dark:ring-primary/30 dark:shadow-[0_0_30px_rgba(57,130,245,0.2)]"
                />
              )}

              {currentTier && (
                <ProductGrid
                  bundle={bundle}
                  products={allProducts.filter((p) => !p.bundleTierId || baseTiers.some(t => t.id === p.bundleTierId))}
                  unlockedProducts={baseUnlockedProducts} // Base products only for grid display
                  selectedTier={currentTier}
                  tiers={baseTiers}
                  setTotalAmount={setBaseAmount}
                  bookFormats={bookFormats}
                  allBundleProducts={allProducts} // Pass all products from all tiers
                  allUnlockedProducts={unlockedProducts} // Pass full unlocked list for modal
                />
              )}

              {/* Charity Tier Section */}
              {charityTier && (
                <CharityTierSection
                  tier={charityTier}
                  products={allProducts}
                  isUnlocked={isCharitySelected}
                  totalAmount={totalAmount}
                  onUnlock={() => setIsCharitySelected(true)}
                  onCancel={() => setIsCharitySelected(false)}
                  bundleType={bundle.type}
                />
              )}

              {/* Upsell/Developer Tier Section */}
              {upsellTier && (
                <UpsellTierSection
                  tier={upsellTier}
                  products={allProducts}
                  isUnlocked={isUpsellSelected}
                  totalAmount={totalAmount}
                  onUnlock={() => setIsUpsellSelected(true)}
                  onCancel={() => setIsUpsellSelected(false)}
                  bundleType={bundle.type}
                  highestBaseTierPrice={baseTiers[baseTiers.length - 1]?.price || 0}
                />
              )}

              <CharityHighlight
                charities={bundle.charities.map((c) => c.charity)}
                charityAmount={charityAmountForDisplay}
              />
            </div>

            {currentTier && (
              <div className="space-y-4">
                {/* Curator Comments - Compact version in right column */}
                {bundle.curatorComment && (
                  <CuratorComments content={bundle.curatorComment} compact />
                )}

                <PurchaseSummary
                  bundle={bundle}
                  tiers={tiers}
                  currentTier={currentTier}
                  baseAmount={baseAmount}
                  totalAmount={totalAmount}
                  unlockedProductsValue={unlockedProductsValue}
                  setBaseAmount={setBaseAmount}
                  isCharitySelected={isCharitySelected}
                  isUpsellSelected={isUpsellSelected}
                  setIsCharitySelected={setIsCharitySelected}
                  setIsUpsellSelected={setIsUpsellSelected}
                  bookFormats={bookFormats}
                />
              </div>
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
