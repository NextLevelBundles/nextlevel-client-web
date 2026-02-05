"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { BundleHero } from "./collection-hero";
import { BundleProgress } from "./collection-progress";
import { ProductGrid } from "./product-grid";
import { CharityHighlight } from "./charity-highlight";
import { PurchaseSummary } from "./purchase-summary";
import { CharityLeaderboard } from "./charity-leaderboard";
import { CuratorComments } from "./curator-comments";
import { CharityTierSection } from "./charity-tier-section";
import { UpsellTierSection } from "./upsell-tier-section";
import { MobileStickyCTA } from "./mobile-sticky-cta";
import { MobilePurchaseSheet } from "./mobile-purchase-sheet";
import { BundleCurators } from "./bundle-curators";
import {
  Bundle,
  BundleType,
  TierType,
  BundleStatus,
  Tier,
} from "@/app/(shared)/types/bundle";
import { useBundleBookFormats } from "@/hooks/queries/useBundleBookFormats";
import { useBundleTierAvailability } from "@/hooks/queries/useBundleTierAvailability";
import { useBundleStatistics } from "@/hooks/queries/useBundleStatistics";
import { useBundlePurchase } from "@/hooks/queries/useBundlePurchase";
import { BundleNotFound } from "./collection-not-found";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { Card } from "@/shared/components/ui/card";
import { AlertCircle, Eye, TrendingDown } from "lucide-react";
import { useCart } from "@/app/(shared)/contexts/cart/cart-provider";
import { useSearchParams } from "next/navigation";

// Configuration: Base tier display order
// 'asc' = low to high (cheapest first), 'desc' = high to low (most expensive first)
const BASE_TIER_DISPLAY_ORDER: "asc" | "desc" = "desc";

// Helper function to sort base tiers by price
const sortBaseTiers = (tiers: Tier[], order: "asc" | "desc") => {
  return order === "asc"
    ? [...tiers].sort((a, b) => a.price - b.price)
    : [...tiers].sort((a, b) => b.price - a.price);
};

// Helper function to get tiers in canonical order (always low to high for logic)
const getCanonicalTiers = (tiers: Tier[]) => {
  return [...tiers].sort((a, b) => a.price - b.price);
};

export function BundleDetail({ bundle }: { bundle: Bundle }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isAuthenticated = !!user;
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const purchaseSummaryRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Check if we should auto-open the upgrade dialog (from payment setup redirect)
  const shouldAutoOpenUpgrade = searchParams.get('upgrade') === 'true' &&
                                 searchParams.get('payment') === 'success';

  // Check bundle timing and status (memoized to prevent recalculation)
  const startDate = useMemo(() => new Date(bundle.startsAt), [bundle.startsAt]);
  const endDate = useMemo(() => new Date(bundle.endsAt), [bundle.endsAt]);

  // Calculate sale period dates with fallbacks
  const saleStartDate = useMemo(
    () => (bundle.sellFrom ? new Date(bundle.sellFrom) : startDate),
    [bundle.sellFrom, startDate]
  );
  const saleEndDate = useMemo(
    () => (bundle.sellTo ? new Date(bundle.sellTo) : endDate),
    [bundle.sellTo, endDate]
  );

  const isBundleActive = bundle.status === BundleStatus.Active;

  // Determine if bundle should be visible - only show if Active status
  const shouldShowBundle = isBundleActive;

  if (!shouldShowBundle) {
    return <BundleNotFound />;
  }

  // Determine bundle state for UI (calculate once on mount)
  const bundleState: "not-started" | "expired" | "active" = useMemo(() => {
    const now = new Date();
    const isBundleNotYetStarted = now < startDate;
    const isBundleExpired = now > endDate;

    if (isBundleNotYetStarted) return "not-started";
    if (isBundleExpired) return "expired";
    return "active";
  }, [startDate, endDate]);

  // Check if sale is currently active (independent of bundle state)
  const isSaleActive = useMemo(() => {
    const now = new Date();
    return now >= saleStartDate && now <= saleEndDate;
  }, [saleStartDate, saleEndDate]);

  // Check if bundle has expired (needed for PurchaseSummary)
  const isBundleExpired = bundleState === "expired";

  // Find base tier matching suggestedPrice
  const initialBaseAmount = useMemo(() => {
    const matchingTier = bundle.tiers?.find(
      (tier) =>
        tier.type === TierType.Base && tier.price === bundle.suggestedPrice
    );
    return matchingTier?.price ?? 0;
  }, [bundle.tiers, bundle.suggestedPrice]);

  // Initialize with the suggested price tier or 0 (no preselection)
  const [baseAmount, setBaseAmount] = useState(initialBaseAmount);
  const [selectedCharityTierIds, setSelectedCharityTierIds] = useState<
    string[]
  >([]);
  const [selectedUpsellTierIds, setSelectedUpsellTierIds] = useState<string[]>(
    []
  );
  const [tipAmount, setTipAmount] = useState(0);

  const tiers = useMemo(() => bundle.tiers || [], [bundle]);
  const allProducts = bundle.products;

  // Fetch book formats for book bundles
  const isBookBundle = bundle.type === BundleType.EBook;
  const { data: bookFormats } = useBundleBookFormats(bundle.id, isBookBundle);

  // Fetch tier availability (only for authenticated users and Steam bundles)
  const isSteamBundle = bundle.type === BundleType.SteamGame;
  const { data: tierAvailability } = useBundleTierAvailability(
    bundle.id,
    isAuthenticated && isSteamBundle
  );

  // Fetch bundle statistics (total raised for charity)
  const { data: bundleStatistics } = useBundleStatistics(bundle.id);

  // Fetch user's purchase of this bundle (only if authenticated)
  const { data: userPurchase, isLoading: isLoadingPurchase } = useBundlePurchase(
    bundle.id,
    isAuthenticated
  );

  // Separate tiers by type and sort by price (memoized to prevent infinite loops)
  // baseTiersCanonical: Always sorted low to high for business logic
  const baseTiersCanonical = useMemo(
    () =>
      getCanonicalTiers(tiers.filter((tier) => tier.type === TierType.Base)),
    [tiers]
  );

  // baseTiers: Sorted according to display order configuration for UI rendering
  const baseTiers = useMemo(
    () => sortBaseTiers(baseTiersCanonical, BASE_TIER_DISPLAY_ORDER),
    [baseTiersCanonical]
  );
  const charityTiers = useMemo(
    () =>
      tiers
        .filter((tier) => tier.type === TierType.Charity)
        .sort((a, b) => a.price - b.price),
    [tiers]
  );
  const upsellTiers = useMemo(
    () =>
      tiers
        .filter((tier) => tier.type === TierType.Upsell)
        .sort((a, b) => a.price - b.price),
    [tiers]
  );

  // Check if all base tiers are available for authenticated Steam bundles
  const hasAvailableBaseTiers = useMemo(() => {
    if (!isAuthenticated || !isSteamBundle || !tierAvailability) {
      return true; // Not applicable or data not loaded yet
    }

    // Check if ALL base tiers exist in the availability dictionary AND have keys > 0
    return baseTiersCanonical.every((tier) => {
      const keysAvailable = tierAvailability[tier.id];
      return keysAvailable !== undefined && keysAvailable > 0;
    });
  }, [isAuthenticated, isSteamBundle, tierAvailability, baseTiersCanonical]);

  // Calculate minimum available keys across base tiers
  const minAvailableKeys = useMemo(() => {
    if (!isSteamBundle || !tierAvailability) {
      return null;
    }

    const baseKeyCounts = baseTiersCanonical
      .map((tier) => tierAvailability[tier.id])
      .filter((count) => count !== undefined);

    if (baseKeyCounts.length === 0) {
      return null;
    }

    return Math.min(...baseKeyCounts);
  }, [isSteamBundle, tierAvailability, baseTiersCanonical]);

  // Check if bundle is running low on keys (less than 1000)
  const isRunningLowOnKeys =
    minAvailableKeys !== null && minAvailableKeys < 1000;

  // Determine the reason for bundle unavailability (country vs sold out)
  const bundleUnavailabilityReason = useMemo(() => {
    if (
      !isAuthenticated ||
      !isSteamBundle ||
      !tierAvailability ||
      hasAvailableBaseTiers
    ) {
      return null;
    }

    // Check if any base tier is missing from the response (not available in country)
    const hasMissingTier = baseTiersCanonical.some(
      (tier) => !(tier.id in tierAvailability)
    );

    if (hasMissingTier) {
      return "country"; // Not available in country
    } else {
      return "soldout"; // All tiers present but at least one has 0 keys
    }
  }, [
    isAuthenticated,
    isSteamBundle,
    tierAvailability,
    hasAvailableBaseTiers,
    baseTiersCanonical,
  ]);

  // Calculate selected tier amounts
  const selectedCharityTiers = charityTiers.filter((tier) =>
    selectedCharityTierIds.includes(tier.id)
  );
  const selectedUpsellTiers = upsellTiers.filter((tier) =>
    selectedUpsellTierIds.includes(tier.id)
  );
  const totalCharityAmount = selectedCharityTiers.reduce(
    (sum, tier) => sum + tier.price,
    0
  );
  const totalUpsellAmount = selectedUpsellTiers.reduce(
    (sum, tier) => sum + tier.price,
    0
  );

  // NEW SIMPLIFIED CALCULATION: Everything is additive
  const totalAmount =
    baseAmount + totalCharityAmount + tipAmount + totalUpsellAmount;

  // Use only base tiers for determining the current tier (use canonical for logic)
  const unlockedBaseTiers = baseTiersCanonical.filter(
    (tier) => tier.price <= baseAmount
  );
  const currentTier =
    unlockedBaseTiers.length > 0
      ? unlockedBaseTiers[unlockedBaseTiers.length - 1]
      : null;

  const currentTierIndexCanonical = baseTiersCanonical.findIndex(
    (tier) => tier.id === currentTier?.id
  );

  // Get base tier unlocked products (use canonical order for logic)
  const baseUnlockedProducts = baseTiersCanonical
    .slice(0, currentTierIndexCanonical + 1)
    .flatMap((tier) =>
      allProducts.filter((product) => product.bundleTierId == tier.id)
    );

  // Add addon tier products if selected
  const charityProducts = selectedCharityTiers.flatMap((tier) =>
    allProducts.filter((product) => product.bundleTierId === tier.id)
  );
  const upsellProducts = selectedUpsellTiers.flatMap((tier) =>
    allProducts.filter((product) => product.bundleTierId === tier.id)
  );

  const unlockedProducts = [
    ...baseUnlockedProducts,
    ...charityProducts,
    ...upsellProducts,
  ];

  const unlockedProductsValue = unlockedProducts.reduce(
    (sum, game) => sum + game.price,
    0
  );

  // Calculate charity amount for display (base 5% + charity tiers + tip if applicable)
  let charityAmountForDisplay = baseAmount * 0.05; // Base 5% to charity
  charityAmountForDisplay += totalCharityAmount; // Add charity tier amounts

  // Add tip to charity only if that's the distribution type
  if (bundle.excessDistributionType !== "Publishers" && tipAmount > 0) {
    charityAmountForDisplay += tipAmount;
  }
  // If tip goes to publishers, 100% goes to publishers (nothing to charity)

  // Handle Add to Cart for mobile
  const handleMobileAddToCart = () => {
    if (!currentTier) return;

    addToCart({
      bundleId: bundle.id,
      baseTierId: currentTier.id,
      ...(selectedCharityTierIds.length > 0 && {
        charityTierId: selectedCharityTierIds[0],
      }),
      ...(selectedUpsellTierIds.length > 0 && {
        upsellTierIds: selectedUpsellTierIds,
      }),
      ...(tipAmount > 0 && { tipAmount }),
    });
  };

  // Scroll to purchase summary on mobile
  const handleViewDetails = () => {
    setMobileSheetOpen(true);
  };

  // Check if CTA should be disabled
  // Add to Cart is enabled only if sale is active (regardless of bundle state)
  const isCtaDisabled =
    !hasAvailableBaseTiers || !isSaleActive;

  // Render status banner based on sale status
  const renderStatusBanner = () => {
    // Only show banner if sale is not active
    if (isSaleActive) return null;

    const bannerConfig = {
      icon: AlertCircle,
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      borderColor: "border-orange-200 dark:border-orange-800",
      textColor: "text-orange-700 dark:text-orange-300",
      title: "Sale Not Active",
      description: "This collection is not currently available for purchase.",
    };

    const Icon = bannerConfig.icon;

    return (
      <Card
        className={`p-4 ${bannerConfig.bgColor} border ${bannerConfig.borderColor} my-6`}
      >
        <div className="flex items-start gap-3">
          <Icon
            className={`h-5 w-5 ${bannerConfig.textColor} mt-0.5 flex-shrink-0`}
          />
          <div className="flex-1">
            <p
              className={`text-sm font-semibold ${bannerConfig.textColor} mb-1`}
            >
              {bannerConfig.title}
            </p>
            <p className={`text-xs ${bannerConfig.textColor}`}>
              {bannerConfig.description}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  // Render low stock banner
  const renderLowStockBanner = () => {
    if (!isRunningLowOnKeys || !isSaleActive) return null;

    return (
      <Card className="relative overflow-hidden p-5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-300 dark:border-amber-700 my-6 shadow-md">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-800/60 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-amber-700 dark:text-amber-300" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5">
              <h3 className="text-base font-semibold text-amber-900 dark:text-amber-100">
                Limited Availability
              </h3>
              <span className="px-2.5 py-0.5 bg-amber-200 dark:bg-amber-800/50 rounded-full text-xs font-medium text-amber-800 dark:text-amber-200">
                {minAvailableKeys} left
              </span>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Only a few copies remaining. This collection will not be restocked once sold out.
            </p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        <BundleHero bundle={bundle} />

        {bundle.curators && bundle.curators.length > 0 && (
          <BundleCurators
            curators={bundle.curators}
            curatorStatement={bundle.curatorStatement}
            curatorVideoLink={bundle.curatorVideoLink}
          />
        )}

        {renderStatusBanner()}
        {renderLowStockBanner()}

        <div className="mt-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <div id="bundle-progressbar" className="mb-8 space-y-8">
              <BundleProgress
                bundle={bundle}
                selectedTier={currentTier}
                totalAmount={baseAmount}
                unlockedProducts={baseUnlockedProducts}
                setTotalAmount={setBaseAmount}
                baseTiersCanonical={baseTiersCanonical}
                className="dark:ring-1 dark:ring-primary/30 dark:shadow-[0_0_30px_rgba(57,130,245,0.2)]"
              />

              <ProductGrid
                bundle={bundle}
                products={allProducts.filter(
                  (p) =>
                    !p.bundleTierId ||
                    baseTiersCanonical.some((t) => t.id === p.bundleTierId)
                )}
                unlockedProducts={baseUnlockedProducts} // Base products only for grid display
                selectedTier={currentTier}
                tiers={baseTiers}
                baseTiersCanonical={baseTiersCanonical}
                displayOrder={BASE_TIER_DISPLAY_ORDER}
                setTotalAmount={setBaseAmount}
                bookFormats={bookFormats}
                allBundleProducts={allProducts} // Pass all products from all tiers
                allUnlockedProducts={unlockedProducts} // Pass all unlocked products including charity/upsell
              />

              {/* Charity Tier Sections */}
              {charityTiers.map((tier) => {
                const isUnlocked = selectedCharityTierIds.includes(tier.id);
                const isAvailable = tierAvailability
                  ? tier.id in tierAvailability && tierAvailability[tier.id] > 0
                  : true;
                const keysCount = tierAvailability?.[tier.id];
                return (
                  <CharityTierSection
                    key={tier.id}
                    tier={tier}
                    products={allProducts.filter(
                      (p) => p.bundleTierId === tier.id
                    )}
                    isUnlocked={isUnlocked}
                    totalAmount={totalAmount}
                    onUnlock={() => {
                      if (!selectedCharityTierIds.includes(tier.id)) {
                        setSelectedCharityTierIds([
                          ...selectedCharityTierIds,
                          tier.id,
                        ]);
                      }
                    }}
                    onCancel={() => {
                      setSelectedCharityTierIds(
                        selectedCharityTierIds.filter((id) => id !== tier.id)
                      );
                    }}
                    bundleType={bundle.type}
                    isAvailable={isAvailable}
                    keysCount={keysCount}
                    hasAvailableBaseTiers={hasAvailableBaseTiers}
                    bundle={bundle}
                    allBundleProducts={allProducts}
                    allUnlockedProducts={[
                      ...baseUnlockedProducts,
                      ...allProducts.filter((p) =>
                        selectedCharityTierIds.includes(p.bundleTierId || "")
                      ),
                      ...allProducts.filter((p) =>
                        selectedUpsellTierIds.includes(p.bundleTierId || "")
                      ),
                    ]}
                  />
                );
              })}

              {/* Upsell Tier Sections */}
              {upsellTiers.map((tier) => {
                const isUnlocked = selectedUpsellTierIds.includes(tier.id);
                const isAvailable = tierAvailability
                  ? tier.id in tierAvailability && tierAvailability[tier.id] > 0
                  : true;
                const keysCount = tierAvailability?.[tier.id];
                return (
                  <UpsellTierSection
                    key={tier.id}
                    tier={tier}
                    products={allProducts.filter(
                      (p) => p.bundleTierId === tier.id
                    )}
                    isUnlocked={isUnlocked}
                    totalAmount={totalAmount}
                    onUnlock={() => {
                      if (!selectedUpsellTierIds.includes(tier.id)) {
                        setSelectedUpsellTierIds([
                          ...selectedUpsellTierIds,
                          tier.id,
                        ]);
                      }
                    }}
                    onCancel={() => {
                      setSelectedUpsellTierIds(
                        selectedUpsellTierIds.filter((id) => id !== tier.id)
                      );
                    }}
                    bundleType={bundle.type}
                    highestBaseTierPrice={
                      baseTiersCanonical[baseTiersCanonical.length - 1]
                        ?.price || 0
                    }
                    isAvailable={isAvailable}
                    keysCount={keysCount}
                    hasAvailableBaseTiers={hasAvailableBaseTiers}
                    bundle={bundle}
                    allBundleProducts={allProducts}
                    allUnlockedProducts={[
                      ...baseUnlockedProducts,
                      ...allProducts.filter((p) =>
                        selectedCharityTierIds.includes(p.bundleTierId || "")
                      ),
                      ...allProducts.filter((p) =>
                        selectedUpsellTierIds.includes(p.bundleTierId || "")
                      ),
                    ]}
                  />
                );
              })}

              {/* Curator Comments - Full version in left column */}
              {/* {bundle.curatorComment && (
                <CuratorComments content={bundle.curatorComment} />
              )} */}

              {/* Charity Highlight */}
              {bundle.charities && bundle.charities.length > 0 && (
                <CharityHighlight
                  charities={bundle.charities.map((bc) => bc.charity)}
                  charityAmount={charityAmountForDisplay}
                  totalRaisedForCharity={
                    bundleStatistics?.totalRaisedForCharity
                  }
                  charityGoal={bundleStatistics?.charityGoal}
                />
              )}
            </div>

            <div className="space-y-4" ref={purchaseSummaryRef}>
              {/* Curator Comments - Compact version in right column */}
              {bundle.curatorComment && (
                <CuratorComments content={bundle.curatorComment} compact />
              )}

              {/* Charity Leaderboard */}
              <CharityLeaderboard bundleId={bundle.id} />

              {/* Desktop Purchase Summary */}
              {/* <div className="hidden lg:block sticky top-16"> */}
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
                isBundleExpired={isBundleExpired}
                tierAvailability={tierAvailability}
                hasAvailableBaseTiers={hasAvailableBaseTiers}
                bundleUnavailabilityReason={bundleUnavailabilityReason}
                bundleState={bundleState}
                isSaleActive={isSaleActive}
                showCharityLeaderboard={false}
                userPurchase={userPurchase}
                isLoadingPurchase={isLoadingPurchase}
                autoOpenUpgrade={shouldAutoOpenUpgrade}
              />
              {/* </div> */}
            </div>
          </div>
        </div>

        {/* Mobile Sticky CTA Bar */}
        <MobileStickyCTA
          bundleId={bundle.id}
          baseTierId={currentTier?.id}
          charityTierId={selectedCharityTierIds[0]}
          tipAmount={tipAmount}
          totalAmount={totalAmount}
          selectedUpsellTierIds={selectedUpsellTierIds}
          unlockedProductsCount={unlockedProducts.length}
          onViewDetails={handleViewDetails}
          bundleTitle={bundle.title}
          isBundleExpired={isBundleExpired}
          hasAvailableBaseTiers={hasAvailableBaseTiers}
          bundleUnavailabilityReason={bundleUnavailabilityReason}
          disabled={isCtaDisabled}
          bundleType={bundle.type}
          bundleState={bundleState}
          isSaleActive={isSaleActive}
          className="pb-6"
          userPurchase={userPurchase}
          bundle={bundle}
        />

        {/* Mobile Purchase Sheet */}
        <MobilePurchaseSheet
          open={mobileSheetOpen}
          onOpenChange={setMobileSheetOpen}
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
          isBundleExpired={isBundleExpired}
          tierAvailability={tierAvailability}
          hasAvailableBaseTiers={hasAvailableBaseTiers}
          bundleUnavailabilityReason={bundleUnavailabilityReason}
          bundleState={bundleState}
          isSaleActive={isSaleActive}
          userPurchase={userPurchase}
          isLoadingPurchase={isLoadingPurchase}
        />
      </div>
    </TooltipProvider>
  );
}
