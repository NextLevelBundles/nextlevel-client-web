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
import {
  Bundle,
  BundleType,
  TierType,
  BundleStatus,
  Tier,
} from "@/app/(shared)/types/bundle";
import { useBundleBookFormats } from "@/hooks/queries/useBundleBookFormats";
import { useBundleTierAvailability } from "@/hooks/queries/useBundleTierAvailability";
import { BundleNotFound } from "./bundle-not-found";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { Card } from "@/shared/components/ui/card";
import { AlertCircle, Clock, Eye } from "lucide-react";

// Configuration: Base tier display order
// 'asc' = low to high (cheapest first), 'desc' = high to low (most expensive first)
const BASE_TIER_DISPLAY_ORDER: 'asc' | 'desc' = 'desc';

// Helper function to sort base tiers by price
const sortBaseTiers = (tiers: Tier[], order: 'asc' | 'desc') => {
  return order === 'asc'
    ? [...tiers].sort((a, b) => a.price - b.price)
    : [...tiers].sort((a, b) => b.price - a.price);
};

// Helper function to get tiers in canonical order (always low to high for logic)
const getCanonicalTiers = (tiers: Tier[]) => {
  return [...tiers].sort((a, b) => a.price - b.price);
};

export function BundleDetail({
  bundle,
  isPreviewMode = false,
}: {
  bundle: Bundle;
  isPreviewMode?: boolean;
}) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Check bundle timing and status (memoized to prevent recalculation)
  const startDate = useMemo(() => new Date(bundle.startsAt), [bundle.startsAt]);
  const endDate = useMemo(() => new Date(bundle.endsAt), [bundle.endsAt]);

  const isBundleActive = bundle.status === BundleStatus.Active;

  // Determine if bundle should be visible:
  // - In preview mode: Always show (regardless of status or timing)
  // - Not in preview mode: Only show if Active status (regardless of timing)
  const shouldShowBundle = isPreviewMode || isBundleActive;

  if (!shouldShowBundle) {
    return <BundleNotFound />;
  }

  // Determine bundle state for UI (calculate once on mount)
  const bundleState: 'preview' | 'not-started' | 'expired' | 'active' = useMemo(() => {
    const now = new Date();
    const isBundleNotYetStarted = now < startDate;
    const isBundleExpired = now > endDate;

    // Even in preview mode, show timing-based states
    return isBundleNotYetStarted
      ? 'not-started'
      : isBundleExpired
      ? 'expired'
      : isPreviewMode
      ? 'preview'
      : 'active';
  }, [isPreviewMode, startDate, endDate]);

  // Check if bundle has expired (needed for PurchaseSummary)
  const isBundleExpired = bundleState === 'expired';

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

  // Separate tiers by type and sort by price (memoized to prevent infinite loops)
  // baseTiersCanonical: Always sorted low to high for business logic
  const baseTiersCanonical = useMemo(
    () => getCanonicalTiers(tiers.filter((tier) => tier.type === TierType.Base)),
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

  // Countdown timer for not-yet-started bundles
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (bundleState !== 'not-started') return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const start = startDate.getTime();
      const distance = start - now;

      if (distance < 0) {
        setCountdown(null);
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [bundleState, startDate]);

  // Render status banner based on bundle state
  const renderStatusBanner = () => {
    if (bundleState === 'active' || bundleState === 'preview') return null;

    const bannerConfig = {
      'not-started': {
        icon: Clock,
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-800',
        textColor: 'text-blue-700 dark:text-blue-300',
        title: 'Bundle Not Yet Started',
        description: countdown
          ? `Starts in ${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`
          : 'This bundle has not started yet.',
      },
      expired: {
        icon: AlertCircle,
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        borderColor: 'border-orange-200 dark:border-orange-800',
        textColor: 'text-orange-700 dark:text-orange-300',
        title: 'Bundle Ended',
        description: 'This bundle has ended and is no longer available for purchase.',
      },
    };

    const config = bannerConfig[bundleState];
    const Icon = config.icon;

    return (
      <Card
        className={`p-4 ${config.bgColor} border ${config.borderColor} my-6`}
      >
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 ${config.textColor} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${config.textColor} mb-1`}>
              {config.title}
            </p>
            <p className={`text-xs ${config.textColor}`}>
              {config.description}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BundleHero bundle={bundle} />

        {renderStatusBanner()}

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
                      baseTiersCanonical[baseTiersCanonical.length - 1]?.price || 0
                    }
                    isAvailable={isAvailable}
                    keysCount={keysCount}
                    hasAvailableBaseTiers={hasAvailableBaseTiers}
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
                />
              )}
            </div>

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
                isBundleExpired={isBundleExpired}
                tierAvailability={tierAvailability}
                hasAvailableBaseTiers={hasAvailableBaseTiers}
                bundleUnavailabilityReason={bundleUnavailabilityReason}
                bundleState={bundleState}
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
