"use client";

import { useState } from "react";
import { Button } from "@/app/(shared)/components/ui/button";
import { CartItem, CartItemStatus } from "@/lib/api/types/cart";
import { ArrowUp, Loader2, AlertCircle, Info } from "lucide-react";
import { UpgradePurchaseDialog } from "./upgrade-purchase-dialog";
import { UpgradeInfoDialog } from "./upgrade-info-dialog";
import { useQuery } from "@tanstack/react-query";
import { Bundle } from "@/app/(shared)/types/bundle";

interface UpgradePurchaseButtonProps {
  purchase: CartItem;
}

// Fetch bundle via server action
async function fetchBundleById(bundleId: string): Promise<Bundle> {
  const response = await fetch(`/api/customer/bundle/${bundleId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch bundle");
  }
  return response.json();
}

export function UpgradePurchaseButton({
  purchase,
}: UpgradePurchaseButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  // Only show upgrade button for completed purchases
  if (purchase.status !== CartItemStatus.Completed) {
    return null;
  }

  if (!purchase.bundleId) {
    return null;
  }

  // Check if this is a gifted purchase
  const isGiftedPurchase = purchase.isGift === true;

  // Fetch bundle data when dialog opens (only for non-gifted purchases)
  const {
    data: bundle,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bundle", purchase.bundleId],
    queryFn: () => fetchBundleById(purchase.bundleId!),
    enabled: isDialogOpen && !isGiftedPurchase,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleButtonClick = () => {
    if (isGiftedPurchase) {
      setIsInfoDialogOpen(true);
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 ${isGiftedPurchase ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleButtonClick}
      >
        <ArrowUp className="h-4 w-4" />
        Upgrade
      </Button>

      {/* Info dialog for gifted purchases */}
      <UpgradeInfoDialog
        isOpen={isInfoDialogOpen}
        onClose={() => setIsInfoDialogOpen(false)}
      />

      {/* Upgrade dialog for owned purchases */}
      {isDialogOpen && !isGiftedPurchase && (
        <>
          {isLoading ? (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading collection details...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 max-w-md p-6 bg-card rounded-lg border">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-center">
                  Failed to load collection details. Please try again.
                </p>
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              </div>
            </div>
          ) : bundle ? (
            <UpgradePurchaseDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              cartItem={purchase}
              bundle={bundle}
            />
          ) : null}
        </>
      )}
    </>
  );
}
