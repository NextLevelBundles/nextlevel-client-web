"use client";

import { ChevronUp, Stamp as Steam } from "lucide-react";
import { cn } from "@/shared/utils/tailwind";
import { Button } from "@/shared/components/ui/button";
import { AddToCartButton } from "../cart/add-to-cart-button";
import { BundleType } from "@/app/(shared)/types/bundle";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useRouter } from "next/navigation";

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
  bundleState?: "preview" | "not-started" | "expired" | "active";
  isPreviewMode?: boolean;
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
  isPreviewMode = false,
}: MobileStickyCTAProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();
  const { data: customer } = useCustomer();

  const isSteamBundle = bundleType === BundleType.SteamGame;
  const isSteamConnected = customer && customer.steamId;
  const needsSteamConnection = isSteamBundle && isAuthenticated && !isSteamConnected;
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

          {/* Add to Cart Button or Connect Steam */}
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
                disabled={disabled || (bundleState === "expired") || (bundleState === "not-started" && !isPreviewMode)}
                className="w-full h-auto px-6 py-3 text-sm"
              >
                Add to Cart
              </AddToCartButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
