"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { PurchaseSummary } from "./purchase-summary";
import { Bundle, Tier } from "@/shared/types/bundle";
import { BundleBookFormatsResponse } from "@/lib/api/types/bundle";

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
  bundleState: "preview" | "not-started" | "expired" | "active";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobilePurchaseSheet({
  open,
  onOpenChange,
  ...purchaseSummaryProps
}: MobilePurchaseSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-2xl p-0 flex flex-col lg:hidden"
      >
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Purchase Options</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <PurchaseSummary {...purchaseSummaryProps} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
