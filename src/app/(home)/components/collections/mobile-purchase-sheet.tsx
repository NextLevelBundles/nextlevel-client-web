"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Clock, Stamp as Steam, MapPin, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import { PurchaseSummary } from "./purchase-summary";
import { Bundle, Tier, BundleType } from "@/shared/types/bundle";
import { BundleBookFormatsResponse } from "@/lib/api/types/bundle";
import { AddToCartButton } from "../cart/add-to-cart-button";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useRouter } from "next/navigation";
import { CartItem } from "@/lib/api/types/cart";

interface MobilePurchaseSheetProps {
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
  tierAvailability?: Record<string, number>;
  hasAvailableBaseTiers: boolean;
  bundleUnavailabilityReason: "country" | "soldout" | null;
  bundleState: "not-started" | "expired" | "active";
  isSaleActive: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPurchase?: CartItem | null;
  isLoadingPurchase?: boolean;
}

export function MobilePurchaseSheet({
  open,
  onOpenChange,
  bundle,
  currentTier,
  totalAmount,
  isBundleExpired,
  hasAvailableBaseTiers,
  bundleUnavailabilityReason,
  bundleState,
  isSaleActive,
  selectedCharityTierIds,
  selectedUpsellTierIds,
  tipAmount,
  userPurchase,
  isLoadingPurchase = false,
  ...purchaseSummaryProps
}: MobilePurchaseSheetProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();
  const { data: customer } = useCustomer();

  const isSteamBundle = bundle.type === BundleType.SteamGame;
  const isSteamConnected = customer && customer.steamId;
  const needsSteamConnection = isSteamBundle && isAuthenticated && !isSteamConnected;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92vh] rounded-t-2xl p-0 flex flex-col lg:hidden"
      >
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Purchase Options</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <PurchaseSummary
            {...purchaseSummaryProps}
            bundle={bundle}
            currentTier={currentTier}
            totalAmount={totalAmount}
            isBundleExpired={isBundleExpired}
            hasAvailableBaseTiers={hasAvailableBaseTiers}
            bundleUnavailabilityReason={bundleUnavailabilityReason}
            bundleState={bundleState}
            isSaleActive={isSaleActive}
            selectedCharityTierIds={selectedCharityTierIds}
            selectedUpsellTierIds={selectedUpsellTierIds}
            tipAmount={tipAmount}
            isMobileSheet={true}
            userPurchase={userPurchase}
            isLoadingPurchase={isLoadingPurchase}
          />
        </div>

        {/* Sticky Footer with Total and CTA */}
        <div className="shrink-0 border-t-2 bg-white dark:bg-card px-6 py-4 pb-6 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)]">
          {/* Steam Key Country Info or Unavailability */}
          {isSteamBundle && isAuthenticated && customer?.country && (
            bundleUnavailabilityReason ? (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
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
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
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
            )
          )}

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
                Connect your Steam account to be able to Add to Cart this bundle
              </p>
            </div>
          ) : (
            <>
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
              />
              {isSaleActive && hasAvailableBaseTiers && !bundleUnavailabilityReason && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  * Sales tax may be calculated during checkout depending on
                  your location
                </p>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
