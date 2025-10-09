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
  Info,
  Download,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/tailwind";
import {
  Bundle,
  Tier,
  BundleType,
  TierType,
} from "@/app/(shared)/types/bundle";
import { BundleBookFormatsResponse } from "@/lib/api/types/bundle";
import { AddToCartButton } from "../cart/add-to-cart-button";
import { useCustomerLocation } from "@/hooks/queries/useCustomerLocation";
import { useCustomer } from "@/hooks/queries/useCustomer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { useRouter } from "next/navigation";

interface PurchaseSummaryProps {
  bundle: Bundle;
  tiers: Tier[];
  currentTier: Tier;
  baseAmount: number;
  totalAmount: number;
  unlockedProductsValue: number;
  setBaseAmount: (amount: number) => void;
  selectedCharityTierIds: string[];
  selectedUpsellTierIds: string[];
  setSelectedCharityTierIds: (ids: string[]) => void;
  setSelectedUpsellTierIds: (ids: string[]) => void;
  onToggleCharityTier?: (tierId: string) => void;
  manuallySelectedCharityTierIds?: string[];
  bookFormats?: BundleBookFormatsResponse | null;
}

export function PurchaseSummary({
  bundle,
  tiers,
  baseAmount,
  totalAmount,
  currentTier,
  unlockedProductsValue,
  setBaseAmount,
  selectedCharityTierIds,
  selectedUpsellTierIds,
  setSelectedCharityTierIds,
  setSelectedUpsellTierIds,
  onToggleCharityTier,
  manuallySelectedCharityTierIds = [],
  bookFormats,
}: PurchaseSummaryProps) {
  const [customInputValue, setCustomInputValue] = useState("");
  const [inputTimeout, setInputTimeout] = useState<NodeJS.Timeout>();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();

  // Only fetch location data if user is authenticated
  const { data: locationData, isLoading: isLoadingLocation } =
    useCustomerLocation(isAuthenticated);

  // Fetch customer data to check Steam connection status (only if authenticated)
  const { data: customer } = useCustomer();

  // Separate tiers by type
  const baseTiers = tiers.filter((tier) => tier.type === TierType.Base);
  const charityTiers = tiers.filter((tier) => tier.type === TierType.Charity).sort((a, b) => a.price - b.price);
  const upsellTiers = tiers.filter((tier) => tier.type === TierType.Upsell).sort((a, b) => a.price - b.price);

  const minimumPrice = baseTiers[0]?.price || tiers[0].price;

  // Check if this is a Steam bundle and user hasn't connected Steam
  const isSteamBundle = bundle.type === BundleType.SteamGame;

  // Determine Steam connection status from customer data (more reliable than locationData)
  const isSteamConnected = customer && customer.steamId;

  const needsSteamConnection =
    isSteamBundle && isAuthenticated && !isSteamConnected;

  // Get the highest base tier price
  const highestBaseTierPrice =
    baseTiers.length > 0 ? baseTiers[baseTiers.length - 1].price : 0;

  // Calculate selected tier amounts
  const selectedCharityTiers = charityTiers.filter(tier => selectedCharityTierIds.includes(tier.id));
  const selectedUpsellTiers = upsellTiers.filter(tier => selectedUpsellTierIds.includes(tier.id));
  const totalSelectedCharityAmount = selectedCharityTiers.reduce((sum, tier) => sum + tier.price, 0);
  const totalSelectedUpsellAmount = selectedUpsellTiers.reduce((sum, tier) => sum + tier.price, 0);

  // Calculate charity amount based on addon model and custom amounts
  let totalCharityAmount = 0;
  let publisherAmount = 0;
  let platformAmount = 0;
  let developerSupportAmount = 0;

  // If upsell addons are selected, full amounts go to developers
  if (selectedUpsellTierIds.length > 0) {
    developerSupportAmount = totalSelectedUpsellAmount;
  }

  // Calculate amounts based on the scenario
  // First, determine how much of the base amount goes to standard distribution
  const effectiveBaseForDistribution = Math.min(
    baseAmount,
    highestBaseTierPrice
  );

  // Base distribution (75/20/5) for the standard portion
  const basePublisherAmount = effectiveBaseForDistribution * 0.75;
  const basePlatformAmount = effectiveBaseForDistribution * 0.2;
  const baseCharityAmount = effectiveBaseForDistribution * 0.05;

  // Start with base distribution
  publisherAmount = basePublisherAmount;
  platformAmount = basePlatformAmount;
  totalCharityAmount = baseCharityAmount;

  // Developer support amount is kept separate for display
  // (no longer added to publisherAmount)

  // Handle charity tiers if selected
  if (selectedCharityTierIds.length > 0) {
    totalCharityAmount += totalSelectedCharityAmount;
  }

  // Handle any extra amount above highest base tier and selected charity tiers (goes to charity)
  const totalCharityAndBase = highestBaseTierPrice + totalSelectedCharityAmount;
  if (baseAmount > totalCharityAndBase) {
    const extraForCharity = baseAmount - totalCharityAndBase;
    totalCharityAmount += extraForCharity;
  }

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

  return (
    <div className="lg:sticky lg:top-20 lg:h-fit space-y-4 lg:w-[370px] w-full animate-fade-up">
      <Card className="p-6 bg-white dark:bg-card/70 backdrop-blur-xs border border-gray-100 dark:border-border shadow-xs hover:shadow-md transition-all duration-300 rounded-xl">
        <h3 className="font-rajdhani text-xl font-bold mb-4">Bundle Summary</h3>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {bundle.type === BundleType.EBook ? (
              <BookOpen className="h-4 w-4 text-primary" />
            ) : (
              <Gift className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-medium">
              You&apos;re getting ${unlockedProductsValue.toFixed(2)} worth of
              {bundle.type === BundleType.EBook ? " books" : " games"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Get a smaller bundle for less, or go all-in to support good work and
            good causes.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {baseTiers.map((tier) => (
              <Button
                key={tier.id}
                variant={currentTier?.id === tier.id ? "default" : "outline"}
                onClick={() => {
                  setCustomInputValue("");
                  setBaseAmount(tier.price);
                }}
                className={cn(
                  "w-full font-mono transition-all duration-300 relative",
                  totalAmount === tier.price &&
                    "bg-primary text-white font-semibold shadow-md shadow-primary/20 dark:shadow-primary/30 hover:shadow-lg hover:shadow-primary/30 dark:hover:shadow-primary/40 border-primary hover:scale-[1.02]"
                )}
              >
                ${tier.price}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              step="1"
              value={customInputValue}
              onChange={(e) => {
                const inputValue = e.target.value;
                setCustomInputValue(inputValue);

                // Clear existing timeout
                if (inputTimeout) {
                  clearTimeout(inputTimeout);
                }

                // Set new timeout
                const timeout = setTimeout(() => {
                  if (inputValue === "") {
                    setBaseAmount(0);
                    return;
                  }

                  const parsedValue = parseFloat(inputValue);
                  if (!isNaN(parsedValue) && parsedValue >= minimumPrice) {
                    const roundedValue = Math.round(parsedValue);
                    setBaseAmount(roundedValue);
                  }
                }, 300);

                setInputTimeout(timeout);
              }}
              placeholder={`Enter custom amount`}
              className="pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-left font-mono bg-white dark:bg-card border-gray-200 dark:border-border focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

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
                  width: `${Math.max(0, (publisherAmount / totalAmount) * 100)}%`,
                }}
              />
              {developerSupportAmount > 0 && (
                <div
                  className="bg-purple-400 dark:bg-purple-600 transition-all"
                  style={{
                    width: `${Math.max(0, (developerSupportAmount / totalAmount) * 100)}%`,
                  }}
                />
              )}
              <div
                className="bg-blue-400 dark:bg-blue-600 transition-all"
                style={{
                  width: `${Math.max(0, (platformAmount / totalAmount) * 100)}%`,
                }}
              />
              <div
                className="bg-rose-400 dark:bg-rose-600 transition-all"
                style={{
                  width: `${Math.max(0, (totalCharityAmount / totalAmount) * 100)}%`,
                }}
              />
            </div>

            {/* Distribution Labels */}
            <div className="space-y-2 mt-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-400 dark:bg-yellow-600" />
                  <span className="text-sm font-medium">
                    Publishers (75%)
                  </span>
                </div>
                <span className="text-sm font-bold">
                  ${publisherAmount.toFixed(2)}
                </span>
              </div>
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
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-400 dark:bg-blue-600" />
                  <span className="text-sm font-medium">Platform (20%)</span>
                </div>
                <span className="text-sm font-bold">
                  ${platformAmount.toFixed(2)}
                </span>
              </div>
              {totalCharityAmount > 0 && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-rose-400 dark:bg-rose-600" />
                    <span className="text-sm font-medium">
                      Charity{selectedCharityTierIds.length === 0 ? " (5%)" : ""}
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    ${totalCharityAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {charityTiers.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Charity Tiers (click to add/remove)
                </p>
                {charityTiers.map((tier) => {
                  const isSelected = selectedCharityTierIds.includes(tier.id);
                  const isManuallySelected = manuallySelectedCharityTierIds.includes(tier.id);
                  return (
                    <div
                      key={tier.id}
                      className={cn(
                        "p-3 rounded-lg border relative cursor-pointer transition-all",
                        isSelected
                          ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/40"
                          : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/40"
                      )}
                      onClick={() => onToggleCharityTier?.(tier.id)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
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
                              {tier.name || "Charity Tier"}{" "}
                              {isSelected ? (isManuallySelected ? "(Manual)" : "(Auto)") : "Not Included"}
                            </p>
                            <p
                              className={cn(
                                "text-xs",
                                isSelected
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-gray-500 dark:text-gray-500"
                              )}
                            >
                              {isSelected
                                ? `100% of this tier ($${tier.price}) goes to charity`
                                : `Requires $${tier.price} extra for charity`}
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
                            {isSelected ? (
                              <Heart className="h-3 w-3 fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400" />
                            ) : (
                              <Heart className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {upsellTiers.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Developer Support Tiers
                </p>
                {upsellTiers.map((tier) => {
                  const isSelected = selectedUpsellTierIds.includes(tier.id);
                  return (
                    <div
                      key={tier.id}
                      className={cn(
                        "p-3 rounded-lg border relative cursor-pointer transition-all",
                        isSelected
                          ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-950/40"
                          : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/40"
                      )}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedUpsellTierIds(selectedUpsellTierIds.filter(id => id !== tier.id));
                        } else {
                          setSelectedUpsellTierIds([...selectedUpsellTierIds, tier.id]);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
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
                            {tier.name || "Extra Items"}{" "}
                            {isSelected ? "Included" : "Not Included"}
                          </p>
                          <p
                            className={cn(
                              "text-xs",
                              isSelected
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-gray-500 dark:text-gray-500"
                            )}
                          >
                            {isSelected
                              ? `100% of developer tier ($${tier.price}) goes to developers`
                              : `Click to add $${tier.price} for developers`}
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
                          {isSelected ? (
                            <X className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Gamepad2 className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="py-4 border-t border-gray-100 dark:border-border">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total</span>
            <span>${totalAmount}</span>
          </div>

          {needsSteamConnection ? (
            <div className="space-y-2">
              <Button
                onClick={() => router.push("/customer/settings/steam")}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                <Gamepad2 className="mr-2 h-4 w-4" />
                Connect Steam Account
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Connect your Steam account to be able to Add to Cart this bundle
              </p>
            </div>
          ) : (
            <AddToCartButton
              bundleId={bundle.id}
              selectedTierId={currentTier.id}
              totalAmount={totalAmount}
              selectedCharityTierIds={selectedCharityTierIds}
              selectedUpsellTierIds={selectedUpsellTierIds}
            />
          )}
        </div>
      </Card>

      {/* Only show Steam keys section for SteamGame bundle type */}
      {bundle.type === BundleType.SteamGame && (
        <Card className="p-4 bg-white dark:bg-card/70 backdrop-blur-xs border border-gray-100 dark:border-border shadow-xs rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Steam className="h-4 w-4 text-primary" />
            <span>Steam Keys Information</span>
          </div>

          <div className="space-y-2">
            {isAuthenticated ? (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  {isLoadingLocation ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-xs text-muted-foreground">
                        Detecting your location...
                      </span>
                    </div>
                  ) : locationData?.profileCountry ? (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Keys will be allocated for:
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <span className="text-base">
                              {locationData.profileCountry.flag}
                            </span>
                            {locationData.profileCountry.name}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">
                                  Based on your Digiphile profile country
                                  setting. Steam keys are region-locked and will
                                  be allocated for this region.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Using your profile country setting
                        </p>
                      </div>

                      {/* Show warning if IP country doesn't match profile country */}
                      {locationData.ipCountry &&
                        locationData.ipCountry.id !==
                          locationData.profileCountry.id && (
                          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                                Location mismatch detected
                              </p>
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                Your current location (
                                {locationData.ipCountry.flag}{" "}
                                {locationData.ipCountry.name}) differs from your
                                profile country. Steam keys will be allocated
                                for {locationData.profileCountry.flag}{" "}
                                {locationData.profileCountry.name} as per your
                                profile settings.
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Unable to determine location
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    Sign in to see region-specific key availability
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 dark:border-border">
              <p className="text-xs text-muted-foreground">
                Steam keys are delivered instantly after purchase
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Show eBook delivery section for EBook bundle type */}
      {bundle.type === BundleType.EBook && (
        <Card className="p-4 bg-white dark:bg-card/70 backdrop-blur-xs border border-gray-100 dark:border-border shadow-xs rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Digital Library</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Download className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">
                    {uniqueFormats.length > 0
                      ? `${uniqueFormats.length} format${uniqueFormats.length > 1 ? "s" : ""} available (${uniqueFormats.join(", ")})`
                      : "Multiple formats available"}
                  </p>
                  {bookFormats && bookFormats.products.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left" className="w-96 p-0">
                          <div className="p-4">
                            <p className="font-semibold text-sm mb-3">
                              Available Book Formats
                            </p>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {bookFormats.products.map((product) => (
                                <div
                                  key={product.productId}
                                  className="flex items-center justify-between gap-3 border-b border-border last:border-0 pb-2 last:pb-0"
                                >
                                  <p
                                    className="text-xs font-medium flex-1 truncate min-w-0"
                                    title={product.title}
                                  >
                                    {product.title}
                                  </p>
                                  <div className="flex flex-shrink-0 gap-1">
                                    {product.availableFormats.map((format) => (
                                      <span
                                        key={`${product.productId}-${format}`}
                                        className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/10"
                                      >
                                        {format.toUpperCase()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Gift className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  DRM-free downloads - read on any device
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-border">
              <p className="text-xs text-muted-foreground">
                eBooks are delivered instantly after purchase
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
