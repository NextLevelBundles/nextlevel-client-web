"use client";

import { ChevronUp, Stamp as Steam, ArrowUp, RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils/tailwind";
import { Button } from "@/shared/components/ui/button";
import { AddToCartButton } from "../cart/add-to-cart-button";
import { BundleType, Bundle } from "@/app/(shared)/types/bundle";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useRouter } from "next/navigation";
import { CartItem, CartItemStatus } from "@/lib/api/types/cart";
import { useMemo, useState } from "react";
import { UpgradePurchaseDialog } from "@/customer/components/purchases/upgrade-purchase-dialog";
import { UpgradeInfoDialog } from "@/customer/components/purchases/upgrade-info-dialog";
import { isUpgradePeriodActive } from "@/app/(shared)/utils/bundle";
import { useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";

interface MobileStickyCTAProps {
  bundleId: string;
  baseTierId?: string;
  charityTierId?: string;
  tipAmount?: number;
  totalAmount: number;
  selectedUpsellTierIds?: string[];
  unlockedProductsCount: number;
  onViewDetails: () => void;
  className?: string;
  bundleTitle?: string;
  isBundleExpired?: boolean;
  hasAvailableBaseTiers?: boolean;
  bundleUnavailabilityReason?: "country" | "soldout" | null;
  disabled?: boolean;
  bundleType: BundleType;
  bundleState?: "not-started" | "expired" | "active";
  isSaleActive?: boolean;
  userPurchase?: CartItem | null;
  bundle?: Bundle;
}

export function MobileStickyCTA({
  bundleId,
  baseTierId,
  charityTierId,
  tipAmount = 0,
  totalAmount,
  selectedUpsellTierIds = [],
  unlockedProductsCount,
  onViewDetails,
  className,
  bundleTitle,
  isBundleExpired = false,
  hasAvailableBaseTiers = true,
  bundleUnavailabilityReason = null,
  disabled = false,
  bundleType,
  bundleState = "active",
  isSaleActive = true,
  userPurchase,
  bundle,
}: MobileStickyCTAProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();
  const { data: customer } = useCustomer();
  const queryClient = useQueryClient();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isSyncingSteamLevel, setIsSyncingSteamLevel] = useState(false);

  const isSteamBundle = bundleType === BundleType.SteamGame;
  const isSteamConnected = customer && customer.steamId;
  const needsSteamConnection = isSteamBundle && isAuthenticated && !isSteamConnected;

  // Steam level validation
  const getSteamLevelStatus = () => {
    if (!customer?.steamLevel) return { isValid: false, reason: "unsync" as const };

    const level = customer.steamLevel;

    if (level === "unsync") return { isValid: false, reason: "unsync" as const };
    if (level === "private") return { isValid: false, reason: "private" as const };
    if (level === "error") return { isValid: false, reason: "error" as const };

    if (level === "manually_approved") return { isValid: true, reason: null };

    const numericLevel = parseInt(level, 10);
    if (isNaN(numericLevel) || numericLevel <= 0) {
      return { isValid: false, reason: "zero" as const };
    }

    return { isValid: true, reason: null };
  };

  const steamLevelStatus = getSteamLevelStatus();
  const needsSteamLevelSync = isSteamBundle && isAuthenticated && !!customer?.steamId && !steamLevelStatus.isValid;

  const handleSyncSteamLevel = async () => {
    setIsSyncingSteamLevel(true);
    try {
      await userApi.syncSteamLevel();
      await queryClient.invalidateQueries({ queryKey: ["customer"] });
    } finally {
      setIsSyncingSteamLevel(false);
    }
  };

  // Check if user can upgrade (simplified check for mobile)
  const canUpgrade = useMemo(() => {
    if (!userPurchase || !bundle) return false;
    if (userPurchase.status !== CartItemStatus.Completed) return false;
    if (userPurchase.isGift === true) return false;

    // Check if upgrade period is active using the shared utility function
    return isUpgradePeriodActive(bundle);
  }, [userPurchase, bundle]);

  const handleUpgradeClick = () => {
    if (userPurchase?.isGift === true) {
      setIsInfoDialogOpen(true);
    } else {
      setIsUpgradeDialogOpen(true);
    }
  };
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl",
        "safe-area-bottom pb-safe",
        className
      )}
    >
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Price and Items Info */}
          <button
            onClick={onViewDetails}
            className="flex flex-col items-start gap-0.5 min-w-0 flex-shrink-0 active:scale-95 transition-transform"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>{unlockedProductsCount} items</span>
              <ChevronUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 text-xs text-primary mt-0.5">
              <span className="font-medium">Tap to view summary</span>
            </div>
          </button>

          {/* Add to Cart Button or Connect Steam or Upgrade */}
          <div className="flex-1 max-w-[200px]">
            {needsSteamConnection ? (
              <Button
                variant="outline"
                className="w-full h-auto px-6 py-3 text-sm font-semibold"
                onClick={() => router.push("/customer/settings/steam")}
              >
                <Steam className="mr-2 h-4 w-4" />
                Connect Steam
              </Button>
            ) : needsSteamLevelSync ? (
              <Button
                variant="outline"
                className="w-full h-auto px-6 py-3 text-sm font-semibold"
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
            ) : canUpgrade ? (
              <Button
                className="w-full h-auto px-6 py-3 text-sm font-semibold"
                onClick={handleUpgradeClick}
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Upgrade
              </Button>
            ) : (
              <AddToCartButton
                bundleId={bundleId}
                baseTierId={baseTierId}
                charityTierId={charityTierId}
                tipAmount={tipAmount}
                totalAmount={totalAmount}
                selectedUpsellTierIds={selectedUpsellTierIds}
                isBundleExpired={isBundleExpired}
                hasAvailableBaseTiers={hasAvailableBaseTiers}
                bundleType={bundleType}
                bundleUnavailabilityReason={bundleUnavailabilityReason}
                disabled={disabled || !isSaleActive}
                className="w-full h-auto px-6 py-3 text-sm"
              >
                Add to Cart
              </AddToCartButton>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade dialogs */}
      {userPurchase && bundle && canUpgrade && (
        <>
          <UpgradeInfoDialog
            isOpen={isInfoDialogOpen}
            onClose={() => setIsInfoDialogOpen(false)}
          />
          {!userPurchase.isGift && (
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
