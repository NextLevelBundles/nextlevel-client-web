"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Stamp as Steam,
  Gift,
  DollarSign,
  Heart,
  BookOpen,
  Gamepad2,
  MapPin,
  Download,
  AlertCircle,
  Clock,
} from "lucide-react";
import { CharityLeaderboard } from "./charity-leaderboard";
import dayjs from "dayjs";
import { cn } from "@/shared/utils/tailwind";
import {
  Bundle,
  Tier,
  BundleType,
  TierType,
  ExcessDistributionType,
} from "@/app/(shared)/types/bundle";
import {
  BundleBookFormatsResponse,
  BundleTierAvailabilityResponse,
} from "@/lib/api/types/bundle";
import { AddToCartButton } from "../cart/add-to-cart-button";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { useRouter } from "next/navigation";

interface PurchaseSummaryProps {
  bundle: Bundle;
  tiers: Tier[];
  currentTier: Tier | null;
  baseAmount: number;
  totalAmount: number;
  unlockedProductsValue: number;
  setBaseAmount: (amount: number) => void;
  selectedCharityTierIds: string[];
  selectedUpsellTierIds: string[];
  setSelectedCharityTierIds: (ids: string[]) => void;
  setSelectedUpsellTierIds: (ids: string[]) => void;
  tipAmount: number;
  setTipAmount: (amount: number) => void;
  bookFormats?: BundleBookFormatsResponse | null;
  isBundleExpired: boolean;
  tierAvailability?: BundleTierAvailabilityResponse;
  hasAvailableBaseTiers: boolean;
  bundleUnavailabilityReason: "country" | "soldout" | null;
  bundleState: "not-started" | "expired" | "active";
  isSaleActive: boolean;
  isMobileSheet?: boolean;
  showCharityLeaderboard?: boolean;
}

export function PurchaseSummary({
  bundle,
  tiers,
  baseAmount,
  currentTier,
  unlockedProductsValue,
  setBaseAmount,
  selectedCharityTierIds,
  selectedUpsellTierIds,
  setSelectedCharityTierIds,
  setSelectedUpsellTierIds,
  tipAmount,
  setTipAmount,
  bookFormats,
  isBundleExpired,
  tierAvailability,
  hasAvailableBaseTiers,
  bundleUnavailabilityReason,
  bundleState,
  isSaleActive,
  isMobileSheet = false,
  showCharityLeaderboard = false,
}: PurchaseSummaryProps) {
  const [tipInputValue, setTipInputValue] = useState("");
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();

  // Only fetch location data if user is authenticated
  // const { data: locationData, isLoading: isLoadingLocation } =
  //   useCustomerLocation(isAuthenticated);

  // Fetch customer data to check Steam connection status (only if authenticated)
  const { data: customer } = useCustomer();

  // Check if this is a Steam bundle (need to determine early)
  const isSteamBundle = bundle.type === BundleType.SteamGame;

  // Separate tiers by type
  const baseTiers = tiers.filter((tier) => tier.type === TierType.Base);
  const charityTiers = tiers
    .filter((tier) => tier.type === TierType.Charity)
    .sort((a, b) => a.price - b.price);
  const upsellTiers = tiers
    .filter((tier) => tier.type === TierType.Upsell)
    .sort((a, b) => a.price - b.price);

  // Check if user has connected Steam
  const isSteamConnected = customer && customer.steamId;
  const needsSteamConnection =
    isSteamBundle && isAuthenticated && !isSteamConnected;

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

  // Revenue distribution calculation (for display only)
  let publisherAmount = 0;
  let platformAmount = 0;
  let charityAmountForDisplay = 0;
  let developerSupportAmount = 0;
  let tipAmountForDisplay = 0;

  // Base tier distribution using bundle-specific splits
  publisherAmount = baseAmount * (bundle.publisherSplit / 100);
  platformAmount = baseAmount * (bundle.platformSplit / 100);
  charityAmountForDisplay = baseAmount * (bundle.charitySplit / 100);

  // Charity tier - 100% to charity
  charityAmountForDisplay += totalCharityAmount;

  // Tip distribution
  if (tipAmount > 0) {
    if (bundle.excessDistributionType === ExcessDistributionType.Publishers) {
      // 100% of tip goes to publishers
      publisherAmount += tipAmount;
      tipAmountForDisplay = tipAmount;
    } else {
      // Tip goes to charity
      charityAmountForDisplay += tipAmount;
      tipAmountForDisplay = tipAmount;
    }
  }

  // Upsell tiers - 100% to publishers
  developerSupportAmount = totalUpsellAmount;

  // Get unique formats from all books
  const getAllUniqueFormats = () => {
    if (!bookFormats?.products) return [];
    const allFormats = new Set<string>();
    bookFormats.products.forEach((product) => {
      product.availableFormats.forEach((format) => allFormats.add(format));
    });
    return Array.from(allFormats).sort();
  };

  const uniqueFormats = getAllUniqueFormats();

  // Update tip amount when input changes
  const handleTipInputChange = (value: string) => {
    setTipInputValue(value);
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      setTipAmount(Math.round(parsedValue));
    } else if (value === "") {
      setTipAmount(0);
    }
  };

  return (
    <div
      className={cn(
        "w-full",
        !isMobileSheet &&
          "lg:sticky lg:top-20 lg:h-fit animate-fade-up space-y-4"
      )}
    >
      <Card
        className={cn(
          "bg-white dark:bg-card/70 backdrop-blur-xs border border-gray-100 dark:border-border shadow-xs transition-all duration-300 rounded-xl",
          !isMobileSheet && "p-6 hover:shadow-md",
          isMobileSheet && "p-0 border-0 shadow-none bg-transparent"
        )}
      >
        <div className={cn(isMobileSheet ? "" : "")}>
          {!isMobileSheet && (
            <h3 className="text-xl font-bold mb-4">Collection Summary</h3>
          )}

          {/* Step 1: Base Collection Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              1. Select Collection Tier
            </h4>
            <div className="flex items-center gap-2 mb-2">
              {bundle.type === BundleType.EBook ? (
                <BookOpen className="h-4 w-4 text-primary" />
              ) : (
                <Gift className="h-4 w-4 text-primary" />
              )}
              <span className="text-sm font-medium">
                You&apos;re getting ${unlockedProductsValue.toFixed(2)} worth of{" "}
                {bundle.type === BundleType.EBook ? "books" : "Steam games"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {baseTiers.map((tier) => {
                return (
                  <Button
                    key={tier.id}
                    variant={
                      currentTier?.id === tier.id ? "default" : "outline"
                    }
                    onClick={() => setBaseAmount(tier.price)}
                    className={cn(
                      "w-full font-mono transition-all duration-300 relative",
                      currentTier?.id === tier.id &&
                        "bg-primary text-white font-semibold shadow-md shadow-primary/20 dark:shadow-primary/30 hover:shadow-lg hover:shadow-primary/30 dark:hover:shadow-primary/40 border-primary hover:scale-[1.02]"
                    )}
                  >
                    ${tier.price}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Charity Tier Selection */}
          {charityTiers.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                2. Support Charity
              </h4>
              <div className="space-y-2">
                {charityTiers.map((tier) => {
                  const isSelected = selectedCharityTierIds.includes(tier.id);
                  const isAvailable = tierAvailability
                    ? tier.id in tierAvailability &&
                      tierAvailability[tier.id] > 0
                    : true;
                  return (
                    <div
                      key={tier.id}
                      className={cn(
                        "p-3 rounded-lg border relative transition-all",
                        isSelected
                          ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
                          : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700",
                        isAvailable
                          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/40"
                          : "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (!isAvailable) return;
                        if (isSelected) {
                          setSelectedCharityTierIds(
                            selectedCharityTierIds.filter(
                              (id) => id !== tier.id
                            )
                          );
                        } else {
                          setSelectedCharityTierIds([
                            ...selectedCharityTierIds,
                            tier.id,
                          ]);
                        }
                      }}
                      role="button"
                      tabIndex={isAvailable ? 0 : -1}
                      aria-pressed={isSelected}
                      aria-disabled={!isAvailable}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <p
                            className={cn(
                              "text-xs font-semibold",
                              isSelected
                                ? "text-rose-700 dark:text-rose-300"
                                : "text-gray-600 dark:text-gray-400"
                            )}
                          >
                            <Heart
                              className={cn(
                                "inline h-3 w-3 mr-1",
                                isSelected
                                  ? "fill-rose-500 text-rose-500"
                                  : "text-gray-400"
                              )}
                            />
                            {tier.name || "Charity Tier"}
                          </p>
                          <p
                            className={cn(
                              "text-xs",
                              isSelected
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-gray-500 dark:text-gray-500"
                            )}
                          >
                            Add ${tier.price} - 100% goes to charity
                          </p>
                        </div>
                        <div
                          className={cn(
                            "ml-2 p-1 rounded-full",
                            isSelected
                              ? "bg-rose-200 dark:bg-rose-800"
                              : "bg-gray-200 dark:bg-gray-700"
                          )}
                        >
                          <Heart
                            className={cn(
                              "h-3 w-3",
                              isSelected
                                ? "fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400"
                                : "text-gray-500 dark:text-gray-400"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Optional Tip */}
          <div className="mb-6">
            {bundle.excessDistributionType ===
            ExcessDistributionType.Publishers ? (
              <>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  3. Support the{" "}
                  {bundle.type == "SteamGame" ? "Devs" : "Publishers"}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  100% of your tip goes directly to{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {bundle.type == "SteamGame" ? "Developers" : "Publishers"}
                  </span>
                </p>
              </>
            ) : (
              <>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  3. Donate more to Charity (optional)
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  100% of your donation goes to{" "}
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {bundle.charities?.[0]?.charity?.name ?? "Charity"}
                  </span>
                </p>
              </>
            )}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                step="1"
                min="0"
                value={tipInputValue}
                onChange={(e) => handleTipInputChange(e.target.value)}
                placeholder="Amount"
                className="pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-left font-mono bg-white dark:bg-card border-gray-200 dark:border-border focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Step 4: Extra Items (Upsell Tiers) */}
          {upsellTiers.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                4. Extra Items
              </h4>
              <div className="space-y-2">
                {upsellTiers.map((tier) => {
                  const isSelected = selectedUpsellTierIds.includes(tier.id);
                  const isAvailable = tierAvailability
                    ? tier.id in tierAvailability &&
                      tierAvailability[tier.id] > 0
                    : true;
                  return (
                    <div
                      key={tier.id}
                      className={cn(
                        "p-3 rounded-lg border relative transition-all",
                        isSelected
                          ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800"
                          : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700",
                        isAvailable
                          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/40"
                          : "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (!isAvailable) return;
                        if (isSelected) {
                          setSelectedUpsellTierIds(
                            selectedUpsellTierIds.filter((id) => id !== tier.id)
                          );
                        } else {
                          setSelectedUpsellTierIds([
                            ...selectedUpsellTierIds,
                            tier.id,
                          ]);
                        }
                      }}
                      role="button"
                      tabIndex={isAvailable ? 0 : -1}
                      aria-pressed={isSelected}
                      aria-disabled={!isAvailable}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <p
                            className={cn(
                              "text-xs font-semibold",
                              isSelected
                                ? "text-purple-700 dark:text-purple-300"
                                : "text-gray-600 dark:text-gray-400"
                            )}
                          >
                            <Gamepad2
                              className={cn(
                                "inline h-3 w-3 mr-1",
                                isSelected ? "text-purple-500" : "text-gray-400"
                              )}
                            />
                            {tier.name || "Extra Items"}
                          </p>
                          <p
                            className={cn(
                              "text-xs",
                              isSelected
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-gray-500 dark:text-gray-500"
                            )}
                          >
                            Add ${tier.price} - 100% goes to publishers
                          </p>
                        </div>
                        <div
                          className={cn(
                            "ml-2 p-1 rounded-full",
                            isSelected
                              ? "bg-purple-200 dark:bg-purple-800"
                              : "bg-gray-200 dark:bg-gray-700"
                          )}
                        >
                          <Gamepad2
                            className={cn(
                              "h-3 w-3",
                              isSelected
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-gray-500 dark:text-gray-400"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Revenue Distribution */}
          <div className="mb-6">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Revenue Distribution</h4>
              </div>

              {/* Distribution Bar */}
              <div className="relative h-6 rounded-lg overflow-hidden flex bg-gray-200 dark:bg-gray-700">
                <div
                  className="bg-yellow-400 dark:bg-yellow-600 transition-all"
                  style={{
                    width:
                      totalAmount > 0
                        ? `${Math.max(0, (publisherAmount / totalAmount) * 100)}%`
                        : "0%",
                  }}
                />
                <div
                  className="bg-blue-400 dark:bg-blue-600 transition-all"
                  style={{
                    width:
                      totalAmount > 0
                        ? `${Math.max(0, (platformAmount / totalAmount) * 100)}%`
                        : "0%",
                  }}
                />
                <div
                  className="bg-rose-400 dark:bg-rose-600 transition-all"
                  style={{
                    width:
                      totalAmount > 0
                        ? `${Math.max(0, (charityAmountForDisplay / totalAmount) * 100)}%`
                        : "0%",
                  }}
                />
                {developerSupportAmount > 0 && (
                  <div
                    className="bg-purple-400 dark:bg-purple-600 transition-all"
                    style={{
                      width:
                        totalAmount > 0
                          ? `${Math.max(0, (developerSupportAmount / totalAmount) * 100)}%`
                          : "0%",
                    }}
                  />
                )}
              </div>

              {/* Distribution Labels */}
              <div className="space-y-2 mt-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-400 dark:bg-yellow-600" />
                    <span className="text-sm font-medium">Publishers</span>
                  </div>
                  <span className="text-sm font-bold">
                    ${publisherAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-400 dark:bg-blue-600" />
                    <span className="text-sm font-medium">Platform</span>
                  </div>
                  <span className="text-sm font-bold">
                    ${platformAmount.toFixed(2)}
                  </span>
                </div>
                {charityAmountForDisplay > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-rose-400 dark:bg-rose-600" />
                      <span className="text-sm font-medium">Charity</span>
                    </div>
                    <span className="text-sm font-bold">
                      ${charityAmountForDisplay.toFixed(2)}
                    </span>
                  </div>
                )}
                {developerSupportAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-purple-400 dark:bg-purple-600" />
                      <span className="text-sm font-medium">Extras</span>
                    </div>
                    <span className="text-sm font-bold">
                      ${developerSupportAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Book Formats (if applicable) */}
          {bundle.type === BundleType.EBook && uniqueFormats.length > 0 && (
            <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <Download className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                    Available Formats
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {uniqueFormats.map((format) => (
                      <span
                        key={format}
                        className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Steam Key Country Allocation or Bundle Not Available */}
          {!isMobileSheet &&
            isSteamBundle &&
            isAuthenticated &&
            customer?.country &&
            (bundleUnavailabilityReason ? (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                      Collection Not Available
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {bundleUnavailabilityReason === "country"
                        ? "The collection is not available in your country"
                        : "The collection is sold out"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Steam Keys Country
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{customer.country.flag}</span>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {customer.country.name}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Your Steam keys will be allocated for this country
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {isMobileSheet && <div className="h-4" />}

        {/* Total - Hidden on mobile sheet (rendered separately in sticky footer) */}
        {!isMobileSheet && (
          <div className="py-4 border-t border-gray-100 dark:border-border">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>

            {/* Expired Bundle Alert */}
            {isBundleExpired && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                      Collection Ended
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      This collection ended on{" "}
                      {dayjs(bundle.endsAt).format("MMM D, YYYY [at] h:mm A")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {needsSteamConnection ? (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/customer/settings/steam")}
                >
                  <Steam className="mr-2 h-4 w-4" />
                  Connect Steam Account
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Connect your Steam account to be able to Add to Cart this
                  bundle
                </p>
              </div>
            ) : (
              <>
                <AddToCartButton
                  bundleId={bundle.id}
                  baseTierId={currentTier?.id}
                  charityTierId={selectedCharityTierIds[0]} // API expects single charity tier
                  tipAmount={tipAmount}
                  totalAmount={totalAmount}
                  selectedUpsellTierIds={selectedUpsellTierIds}
                  isBundleExpired={bundleState === "expired" || isBundleExpired}
                  hasAvailableBaseTiers={hasAvailableBaseTiers}
                  bundleType={bundle.type}
                  bundleUnavailabilityReason={bundleUnavailabilityReason}
                  disabled={!isSaleActive}
                />
                {isSaleActive &&
                  hasAvailableBaseTiers &&
                  !bundleUnavailabilityReason && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      * Sales tax may be calculated during checkout depending on
                      your location
                    </p>
                  )}
              </>
            )}
          </div>
        )}
      </Card>

      {/* Charity Leaderboard - only show on desktop, not in mobile sheet */}
      {!isMobileSheet && showCharityLeaderboard && (
        <CharityLeaderboard bundleId={bundle.id} />
      )}

      {/* Location Warning */}
      {/* {isAuthenticated && !isLoadingLocation && locationData?.ipCountry && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                Location Detected
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Your location: {locationData.ipCountry.name}
              </p>
            </div>
          </div>
        </Card>
      )} */}
    </div>
  );
}
