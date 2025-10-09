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
  const [selectedCharityTierIds, setSelectedCharityTierIds] = useState<string[]>([]);
  const [manuallySelectedCharityTierIds, setManuallySelectedCharityTierIds] = useState<string[]>([]);
  const [selectedUpsellTierIds, setSelectedUpsellTierIds] = useState<string[]>([]);

  const tiers = useMemo(() => bundle.tiers || [], [bundle]);
  const allProducts = bundle.products;

  // Fetch book formats for book bundles
  // Check both 'type' and 'bundleType' properties for compatibility
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

  // Get the highest base tier price
  const highestBaseTierPrice = baseTiers.length > 0
    ? baseTiers[baseTiers.length - 1].price
    : 0;

  // Automatically handle charity tiers based on custom amount and manual selections
  useEffect(() => {
    const extraAmount = Math.max(0, baseAmount - highestBaseTierPrice);
    const autoSelectedCharityTierIds: string[] = [];
    let accumulatedCharityAmount = 0;

    // First, account for manually selected charity tiers
    const manuallySelectedTiers = charityTiers.filter(tier =>
      manuallySelectedCharityTierIds.includes(tier.id)
    );

    for (const tier of manuallySelectedTiers) {
      accumulatedCharityAmount += tier.price;
    }

    // Then auto-select remaining charity tiers based on available amount
    for (const tier of charityTiers) {
      // Skip if already manually selected
      if (manuallySelectedCharityTierIds.includes(tier.id)) {
        continue;
      }

      if (accumulatedCharityAmount + tier.price <= extraAmount) {
        autoSelectedCharityTierIds.push(tier.id);
        accumulatedCharityAmount += tier.price;
      } else {
        break;
      }
    }

    // Combine manual and auto selections
    setSelectedCharityTierIds([...manuallySelectedCharityTierIds, ...autoSelectedCharityTierIds]);
  }, [baseAmount, highestBaseTierPrice, charityTiers, manuallySelectedCharityTierIds]);

  // Calculate total amount including addons
  const selectedCharityTiers = charityTiers.filter(tier => selectedCharityTierIds.includes(tier.id));
  const selectedUpsellTiers = upsellTiers.filter(tier => selectedUpsellTierIds.includes(tier.id));

  // Separate manually selected charity tiers from auto-selected ones
  const manualCharityTiers = charityTiers.filter(tier => manuallySelectedCharityTierIds.includes(tier.id));
  const manualCharityAmount = manualCharityTiers.reduce((sum, tier) => sum + tier.price, 0);

  const totalCharityAmount = selectedCharityTiers.reduce((sum, tier) => sum + tier.price, 0);
  const totalUpsellAmount = selectedUpsellTiers.reduce((sum, tier) => sum + tier.price, 0);

  // Total amount includes base + manually selected charity + upsell
  const totalAmount = baseAmount + manualCharityAmount + totalUpsellAmount;

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

  // Calculate charity amount for display
  let charityAmountForDisplay = 0;

  // Standard 5% charity for base amount up to highest base tier
  const effectiveBaseAmount = Math.min(baseAmount, highestBaseTierPrice);
  charityAmountForDisplay = effectiveBaseAmount * 0.05;

  // Add manually selected charity tier amounts (these are on top of base amount)
  charityAmountForDisplay += manualCharityAmount;

  // Add auto-selected charity tier amounts from extra amount
  const autoSelectedCharityAmount = selectedCharityTiers
    .filter(tier => !manuallySelectedCharityTierIds.includes(tier.id))
    .reduce((sum, tier) => sum + tier.price, 0);
  charityAmountForDisplay += autoSelectedCharityAmount;

  // Add any remaining extra amount above highest base tier and auto-selected charity tiers
  const extraAmount = Math.max(0, baseAmount - highestBaseTierPrice);
  const remainingExtraAmount = Math.max(0, extraAmount - autoSelectedCharityAmount);
  charityAmountForDisplay += remainingExtraAmount;

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

              {/* Charity Tiers Section */}
              {charityTiers.map((tier) => (
                <CharityTierSection
                  key={tier.id}
                  tier={tier}
                  products={allProducts}
                  isUnlocked={selectedCharityTierIds.includes(tier.id)}
                  totalAmount={totalAmount}
                  onUnlock={() => {
                    // Add to manually selected tiers WITHOUT changing base amount
                    if (!manuallySelectedCharityTierIds.includes(tier.id)) {
                      setManuallySelectedCharityTierIds(prev => [...prev, tier.id]);
                    }
                  }}
                  onCancel={() => {
                    // Remove from manually selected tiers
                    setManuallySelectedCharityTierIds(prev => prev.filter(id => id !== tier.id));
                  }}
                  bundleType={bundle.type}
                />
              ))}

              {/* Upsell/Developer Tiers Section */}
              {upsellTiers.map((tier) => (
                <UpsellTierSection
                  key={tier.id}
                  tier={tier}
                  products={allProducts}
                  isUnlocked={selectedUpsellTierIds.includes(tier.id)}
                  totalAmount={totalAmount}
                  onUnlock={() => {
                    setSelectedUpsellTierIds(prev => [...prev, tier.id]);
                  }}
                  onCancel={() => {
                    setSelectedUpsellTierIds(prev => prev.filter(id => id !== tier.id));
                  }}
                  bundleType={bundle.type}
                  highestBaseTierPrice={baseTiers[baseTiers.length - 1]?.price || 0}
                />
              ))}

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
                  selectedCharityTierIds={selectedCharityTierIds}
                  selectedUpsellTierIds={selectedUpsellTierIds}
                  setSelectedCharityTierIds={setSelectedCharityTierIds}
                  setSelectedUpsellTierIds={setSelectedUpsellTierIds}
                  onToggleCharityTier={(tierId: string) => {
                    if (manuallySelectedCharityTierIds.includes(tierId)) {
                      // Remove from manual selections
                      setManuallySelectedCharityTierIds(prev => prev.filter(id => id !== tierId));
                    } else {
                      // Add to manual selections WITHOUT changing base amount
                      setManuallySelectedCharityTierIds(prev => [...prev, tierId]);
                    }
                  }}
                  manuallySelectedCharityTierIds={manuallySelectedCharityTierIds}
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
