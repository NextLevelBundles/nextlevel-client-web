"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Stamp as Steam,
  DollarSign,
  Heart,
  BookOpen,
  Gamepad2,
  MapPin,
  Download,
  AlertCircle,
  Clock,
  RefreshCw,
  ShieldAlert,
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
import { CartItem, CartItemStatus } from "@/lib/api/types/cart";
import { UpgradePurchaseDialog } from "@/customer/components/purchases/upgrade-purchase-dialog";
import { UpgradeInfoDialog } from "@/customer/components/purchases/upgrade-info-dialog";
import { ArrowUp, CheckCircle2 } from "lucide-react";
import { isUpgradePeriodActive } from "@/app/(shared)/utils/bundle";
import { useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";

// Steam Level Warning Component
interface SteamLevelWarningProps {
  steamLevelStatus: { isValid: boolean; reason: "unsync" | "private" | "error" | "zero" | null };
  getSteamLevelWarningMessage: () => string;
  handleSyncSteamLevel: () => Promise<void>;
  isSyncingSteamLevel: boolean;
}

function SteamLevelWarning({
  steamLevelStatus,
  getSteamLevelWarningMessage,
  handleSyncSteamLevel,
  isSyncingSteamLevel,
}: SteamLevelWarningProps) {
  return (
    <div className="mb-4 space-y-2">
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
              Steam Level Verification Required
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {getSteamLevelWarningMessage()}
              {steamLevelStatus.reason === "private" && (
                <>
                  {" "}
                  <a
                    href="https://help.steampowered.com/en/faqs/view/588C-C67D-0251-C276"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 dark:text-amber-300 underline hover:no-underline"
                  >
                    Learn how to make your profile public
                  </a>
                  .
                </>
              )}
              {steamLevelStatus.reason === "zero" && (
                <>
                  {" "}
                  <a
                    href="https://help.steampowered.com/en/faqs/view/1F74-BE45-3AAC-1B47"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 dark:text-amber-300 underline hover:no-underline"
                  >
                    Learn how to increase your Steam level
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={handleSyncSteamLevel}
        disabled={isSyncingSteamLevel}
      >
        {isSyncingSteamLevel ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Steam Level
          </>
        )}
      </Button>
    </div>
  );
}

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
  userPurchase?: CartItem | null;
  isLoadingPurchase?: boolean;
  autoOpenUpgrade?: boolean;
  isPreview?: boolean;
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
  userPurchase,
  isLoadingPurchase = false,
  autoOpenUpgrade = false,
  isPreview = false,
}: PurchaseSummaryProps) {
  const [tipInputValue, setTipInputValue] = useState("");
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isSyncingSteamLevel, setIsSyncingSteamLevel] = useState(false);
  const queryClient = useQueryClient();

  // Auto-open upgrade dialog when redirected back from payment setup
  useEffect(() => {
    if (autoOpenUpgrade && userPurchase && !isLoadingPurchase) {
      setIsUpgradeDialogOpen(true);
    }
  }, [autoOpenUpgrade, userPurchase, isLoadingPurchase]);
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

  // Steam level validation helper
  const getSteamLevelStatus = () => {
    if (!customer?.steamLevel) return { isValid: false, reason: "unsync" as const };

    const level = customer.steamLevel;

    if (level === "unsync") {
      return { isValid: false, reason: "unsync" as const };
    }
    if (level === "private") {
      return { isValid: false, reason: "private" as const };
    }
    if (level === "error") {
      return { isValid: false, reason: "error" as const };
    }

    const numericLevel = parseInt(level, 10);
    if (isNaN(numericLevel) || numericLevel <= 0) {
      return { isValid: false, reason: "zero" as const };
    }

    return { isValid: true, reason: null };
  };

  const steamLevelStatus = getSteamLevelStatus();
  const needsSteamLevelSync = isSteamBundle && isAuthenticated && !!customer?.steamId && !steamLevelStatus.isValid;

  // Handle Steam level sync
  const handleSyncSteamLevel = async () => {
    setIsSyncingSteamLevel(true);

    try {
      await userApi.syncSteamLevel();
      // Always invalidate customer cache to refresh data with new steamLevel
      await queryClient.invalidateQueries({ queryKey: ["customer"] });
    } finally {
      setIsSyncingSteamLevel(false);
    }
  };

  // Get Steam level warning message
  const getSteamLevelWarningMessage = () => {
    switch (steamLevelStatus.reason) {
      case "unsync":
        return "Please sync your Steam profile to verify your account level.";
      case "private":
        return "Your Steam profile is private. Please set \"My profile\" to public in your Steam privacy settings.";
      case "error":
        return "Unable to verify your Steam level. Please try syncing again later.";
      case "zero":
        return "Your Steam level must be greater than 0 to purchase or gift this collection. Please increase your Steam level and try syncing again.";
      default:
        return "Please sync your Steam profile.";
    }
  };

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

  // Check upgrade eligibility (reuse logic from cart-item-modal)
  const upgradeEligibility = useMemo(() => {
    // No purchase found
    if (!userPurchase) {
      return { canUpgrade: false, reason: null };
    }

    // Only for completed purchases
    if (userPurchase.status !== CartItemStatus.Completed) {
      return { canUpgrade: false, reason: "Purchase not completed" };
    }

    // Check if this is a gifted purchase
    const isGiftedPurchase = userPurchase.isGift === true;

    // FIRST: Check if user has maxed out all tiers
    // (This should be prioritized over upgrade period check)
    const baseTiersSorted = baseTiers.sort((a, b) => a.price - b.price);
    const purchasedBaseTierPrice = userPurchase.snapshotTierPrice || 0;
    const highestBaseTierPrice =
      baseTiersSorted.length > 0
        ? baseTiersSorted[baseTiersSorted.length - 1].price
        : 0;
    const hasHighestBaseTier = purchasedBaseTierPrice >= highestBaseTierPrice;

    const hasCharityTier = (userPurchase.charityAmount || 0) > 0;
    const allCharityTiersPurchased =
      charityTiers.length === 0 || hasCharityTier;

    // Check if all upsell tiers are purchased
    const purchasedProductIds = new Set(
      userPurchase.snapshotProducts.map((p) => p.productId)
    );
    const allUpsellTiersPurchased = upsellTiers.every((tier) => {
      const tierProducts = bundle.products.filter(
        (p) => p.bundleTierId === tier.id
      );
      return tierProducts.every((p) => purchasedProductIds.has(p.id));
    });

    const hasMaxedOut =
      hasHighestBaseTier &&
      allCharityTiersPurchased &&
      allUpsellTiersPurchased;

    if (hasMaxedOut) {
      return {
        canUpgrade: false,
        reason:
          "You own the complete collection with all available tiers",
      };
    }

    // SECOND: Check if upgrade period is active
    // (Only check this if user hasn't maxed out)
    if (!isUpgradePeriodActive(bundle)) {
      return { canUpgrade: false, reason: "Upgrade period has ended" };
    }

    return {
      canUpgrade: true,
      isGiftedPurchase,
      reason: null,
    };
  }, [userPurchase, bundle, baseTiers, charityTiers, upsellTiers]);

  const handleUpgradeClick = () => {
    if (upgradeEligibility.isGiftedPurchase) {
      setIsInfoDialogOpen(true);
    } else {
      setIsUpgradeDialogOpen(true);
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
                <Gamepad2 className="h-4 w-4 text-primary" />
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
                  const isAvailable = isPreview || (tierAvailability
                    ? tier.id in tierAvailability &&
                      tierAvailability[tier.id] > 0
                    : true);
                  // Allow deselection even if not available, but only if already selected
                  const isClickable = isAvailable || isSelected;
                  return (
                    <div
                      key={tier.id}
                      className={cn(
                        "p-3 rounded-lg border relative transition-all",
                        isSelected
                          ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
                          : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700",
                        isClickable
                          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/40"
                          : "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (!isClickable) return;
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
                      tabIndex={isClickable ? 0 : -1}
                      aria-pressed={isSelected}
                      aria-disabled={!isClickable}
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
                  const isAvailable = isPreview || (tierAvailability
                    ? tier.id in tierAvailability &&
                      tierAvailability[tier.id] > 0
                    : true);
                  // Allow deselection even if not available, but only if already selected
                  const isClickable = isAvailable || isSelected;
                  return (
                    <div
                      key={tier.id}
                      className={cn(
                        "p-3 rounded-lg border relative transition-all",
                        isSelected
                          ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800"
                          : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700",
                        isClickable
                          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/40"
                          : "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (!isClickable) return;
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
                      tabIndex={isClickable ? 0 : -1}
                      aria-pressed={isSelected}
                      aria-disabled={!isClickable}
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
            ) : needsSteamLevelSync ? (
              <SteamLevelWarning
                steamLevelStatus={steamLevelStatus}
                getSteamLevelWarningMessage={getSteamLevelWarningMessage}
                handleSyncSteamLevel={handleSyncSteamLevel}
                isSyncingSteamLevel={isSyncingSteamLevel}
              />
            ) : userPurchase && userPurchase.status === CartItemStatus.Completed && upgradeEligibility.canUpgrade ? (
              // User owns the bundle (completed purchase) and can upgrade
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      You own this collection!
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={handleUpgradeClick}
                >
                  <ArrowUp className="h-4 w-4" />
                  Upgrade This Purchase
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <AddToCartButton
                  bundleId={bundle.id}
                  baseTierId={currentTier?.id}
                  charityTierId={selectedCharityTierIds[0]}
                  tipAmount={tipAmount}
                  totalAmount={totalAmount}
                  selectedUpsellTierIds={selectedUpsellTierIds}
                  isBundleExpired={bundleState === "expired" || isBundleExpired}
                  hasAvailableBaseTiers={hasAvailableBaseTiers}
                  bundleType={bundle.type}
                  bundleUnavailabilityReason={bundleUnavailabilityReason}
                  disabled={!isSaleActive}
                >
                  Gift this collection
                </AddToCartButton>
              </div>
            ) : userPurchase && userPurchase.status === CartItemStatus.Completed && !upgradeEligibility.canUpgrade && upgradeEligibility.reason ? (
              // User owns the bundle (completed purchase) but cannot upgrade (maxed out or other reason)
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      {upgradeEligibility.reason}
                    </p>
                  </div>
                </div>
                <AddToCartButton
                  bundleId={bundle.id}
                  baseTierId={currentTier?.id}
                  charityTierId={selectedCharityTierIds[0]}
                  tipAmount={tipAmount}
                  totalAmount={totalAmount}
                  selectedUpsellTierIds={selectedUpsellTierIds}
                  isBundleExpired={bundleState === "expired" || isBundleExpired}
                  hasAvailableBaseTiers={hasAvailableBaseTiers}
                  bundleType={bundle.type}
                  bundleUnavailabilityReason={bundleUnavailabilityReason}
                  disabled={!isSaleActive}
                >
                  Gift this collection
                </AddToCartButton>
              </div>
            ) : (
              // User doesn't own the bundle or not authenticated
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

      {/* Upgrade dialogs */}
      {userPurchase && upgradeEligibility.canUpgrade && (
        <>
          <UpgradeInfoDialog
            isOpen={isInfoDialogOpen}
            onClose={() => setIsInfoDialogOpen(false)}
          />
          {!upgradeEligibility.isGiftedPurchase && (
            <UpgradePurchaseDialog
              isOpen={isUpgradeDialogOpen}
              onClose={() => setIsUpgradeDialogOpen(false)}
              cartItem={userPurchase}
              bundle={bundle}
              paymentSetupSuccessUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/collections/${bundle.slug}?upgrade=true&cartItemId=${userPurchase.id}&payment=success`}
              paymentSetupCancelUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/collections/${bundle.slug}?upgrade=true&cartItemId=${userPurchase.id}&payment=cancelled`}
            />
          )}
        </>
      )}
    </div>
  );
}
