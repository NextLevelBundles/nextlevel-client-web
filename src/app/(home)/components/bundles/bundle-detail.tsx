"use client";

import { useState, useMemo } from "react";
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
  // Initialize with the minimum price (first base tier)
  const [baseAmount, setBaseAmount] = useState(bundle.minPrice);
  const [selectedCharityTierIds, setSelectedCharityTierIds] = useState<string[]>([]);
  const [selectedUpsellTierIds, setSelectedUpsellTierIds] = useState<string[]>([]);
  const [tipAmount, setTipAmount] = useState(0);

  const tiers = useMemo(() => bundle.tiers || [], [bundle]);
  const allProducts = bundle.products;

  // Fetch book formats for book bundles
  const isBookBundle = bundle.type === BundleType.EBook;
  const { data: bookFormats } = useBundleBookFormats(bundle.id, isBookBundle);

  // Separate tiers by type and sort by price (memoized to prevent infinite loops)
  const baseTiers = useMemo(() => tiers.filter((tier) => tier.type === TierType.Base), [tiers]);
  const charityTiers = useMemo(() =>
    tiers.filter((tier) => tier.type === TierType.Charity).sort((a, b) => a.price - b.price),
    [tiers]
  );
  const upsellTiers = useMemo(() =>
    tiers.filter((tier) => tier.type === TierType.Upsell).sort((a, b) => a.price - b.price),
    [tiers]
  );

  // Calculate selected tier amounts
  const selectedCharityTiers = charityTiers.filter(tier => selectedCharityTierIds.includes(tier.id));
  const selectedUpsellTiers = upsellTiers.filter(tier => selectedUpsellTierIds.includes(tier.id));
  const totalCharityAmount = selectedCharityTiers.reduce((sum, tier) => sum + tier.price, 0);
  const totalUpsellAmount = selectedUpsellTiers.reduce((sum, tier) => sum + tier.price, 0);

  // NEW SIMPLIFIED CALCULATION: Everything is additive
  const totalAmount = baseAmount + totalCharityAmount + tipAmount + totalUpsellAmount;

  // Use only base tiers for determining the current tier
  const unlockedBaseTiers = baseTiers.filter((tier) => tier.price <= baseAmount);
  const currentTier = unlockedBaseTiers.length > 0 ? unlockedBaseTiers[unlockedBaseTiers.length - 1] : null;

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
  const charityProducts = selectedCharityTiers.flatMap(tier =>
    allProducts.filter((product) => product.bundleTierId === tier.id)
  );
  const upsellProducts = selectedUpsellTiers.flatMap(tier =>
    allProducts.filter((product) => product.bundleTierId === tier.id)
  );

  const unlockedProducts = [
    ...baseUnlockedProducts,
    ...charityProducts,
    ...upsellProducts
  ];

  const unlockedProductsValue = unlockedProducts.reduce(
    (sum, game) => sum + game.price,
    0
  );

  // Calculate charity amount for display (base 5% + charity tiers + tip if applicable)
  let charityAmountForDisplay = baseAmount * 0.05; // Base 5% to charity
  charityAmountForDisplay += totalCharityAmount; // Add charity tier amounts

  // Add tip to charity only if that's the distribution type
  if (bundle.excessDistributionType !== 'Publishers' && tipAmount > 0) {
    charityAmountForDisplay += tipAmount;
  }
  // If tip goes to publishers, 100% goes to publishers (nothing to charity)

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BundleHero bundle={bundle} />

        <div className="mt-8">
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
                  allUnlockedProducts={unlockedProducts} // Pass all unlocked products including charity/upsell
                />
              )}

              {/* Charity Tier Sections */}
              {charityTiers.map((tier) => {
                const isUnlocked = selectedCharityTierIds.includes(tier.id);
                return (
                  <CharityTierSection
                    key={tier.id}
                    tier={tier}
                    products={allProducts.filter((p) => p.bundleTierId === tier.id)}
                    isUnlocked={isUnlocked}
                    totalAmount={totalAmount}
                    onUnlock={() => {
                      if (!selectedCharityTierIds.includes(tier.id)) {
                        setSelectedCharityTierIds([...selectedCharityTierIds, tier.id]);
                      }
                    }}
                    onCancel={() => {
                      setSelectedCharityTierIds(selectedCharityTierIds.filter(id => id !== tier.id));
                    }}
                    bundleType={bundle.type}
                  />
                );
              })}

              {/* Upsell Tier Sections */}
              {upsellTiers.map((tier) => {
                const isUnlocked = selectedUpsellTierIds.includes(tier.id);
                return (
                  <UpsellTierSection
                    key={tier.id}
                    tier={tier}
                    products={allProducts.filter((p) => p.bundleTierId === tier.id)}
                    isUnlocked={isUnlocked}
                    totalAmount={totalAmount}
                    onUnlock={() => {
                      if (!selectedUpsellTierIds.includes(tier.id)) {
                        setSelectedUpsellTierIds([...selectedUpsellTierIds, tier.id]);
                      }
                    }}
                    onCancel={() => {
                      setSelectedUpsellTierIds(selectedUpsellTierIds.filter(id => id !== tier.id));
                    }}
                    bundleType={bundle.type}
                    highestBaseTierPrice={baseTiers[baseTiers.length - 1]?.price || 0}
                  />
                );
              })}

              {/* Curator Comments - Full version in left column */}
              {bundle.curatorComment && (
                <CuratorComments content={bundle.curatorComment} />
              )}

              {/* Charity Highlight */}
              {bundle.charities && bundle.charities.length > 0 && (
                <CharityHighlight
                  charities={bundle.charities.map(bc => bc.charity)}
                  charityAmount={charityAmountForDisplay}
                />
              )}
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
                  selectedCharityTierIds={selectedCharityTierIds}
                  selectedUpsellTierIds={selectedUpsellTierIds}
                  setSelectedCharityTierIds={setSelectedCharityTierIds}
                  setSelectedUpsellTierIds={setSelectedUpsellTierIds}
                  tipAmount={tipAmount}
                  setTipAmount={setTipAmount}
                  bookFormats={bookFormats}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}