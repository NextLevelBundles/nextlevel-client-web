"use client";

import { useState, useEffect, useMemo } from "react";
import { CartItem, CartItemStatus } from "@/lib/api/types/cart";
import { Bundle, Tier, TierType } from "@/app/(shared)/types/bundle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
} from "@/app/(shared)/components/ui/dialog";
import { Button } from "@/app/(shared)/components/ui/button";
import { Card, CardContent } from "@/app/(shared)/components/ui/card";
import { Loader2, ArrowUp, Check, CreditCard, ExternalLink } from "lucide-react";
import { upgradeApi } from "@/lib/api";
import { UpgradePreviewResponse, PaymentStatusResponse } from "@/lib/api/types/upgrade";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/app/(shared)/components/ui/checkbox";
import { Label } from "@/app/(shared)/components/ui/label";

interface UpgradePurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cartItem: CartItem;
  bundle: Bundle;
}

export function UpgradePurchaseDialog({
  isOpen,
  onClose,
  cartItem,
  bundle,
}: UpgradePurchaseDialogProps) {
  const queryClient = useQueryClient();
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [upgradePreview, setUpgradePreview] =
    useState<UpgradePreviewResponse | null>(null);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatusResponse | null>(null);
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(false);
  const [isSettingUpPayment, setIsSettingUpPayment] = useState(false);

  // Get tiers from bundle
  const baseTiers = useMemo(
    () =>
      bundle.tiers
        .filter((tier) => tier.type === TierType.Base)
        .sort((a, b) => a.price - b.price),
    [bundle.tiers]
  );

  const charityTiers = useMemo(
    () =>
      bundle.tiers
        .filter((tier) => tier.type === TierType.Charity)
        .sort((a, b) => a.price - b.price),
    [bundle.tiers]
  );

  const upsellTiers = useMemo(
    () =>
      bundle.tiers
        .filter((tier) => tier.type === TierType.Upsell)
        .sort((a, b) => a.price - b.price),
    [bundle.tiers]
  );

  // Determine purchased tiers from CartItem snapshot
  const purchasedBaseTierPrice = cartItem.snapshotTierPrice || 0;
  const purchasedBaseTier = baseTiers.find(
    (t) => t.price === purchasedBaseTierPrice
  );

  // Check if charity tier was purchased (charityAmount > 0)
  const hasCharityTier = (cartItem.charityAmount || 0) > 0;

  // Get purchased upsell tier IDs from snapshot products
  // We need to identify which products belong to upsell tiers
  const purchasedProductIds = new Set(
    cartItem.snapshotProducts.map((p) => p.productId)
  );

  // State for selections
  const [selectedBaseTierId, setSelectedBaseTierId] = useState<string>("");
  const [selectedCharityTierId, setSelectedCharityTierId] = useState<
    string | undefined
  >();
  const [selectedUpsellTierIds, setSelectedUpsellTierIds] = useState<string[]>(
    []
  );

  // Initialize selections when dialog opens
  useEffect(() => {
    if (isOpen && baseTiers.length > 0) {
      // Don't preselect any tier - let user choose
      setSelectedBaseTierId("");
      setSelectedCharityTierId(undefined);
      setSelectedUpsellTierIds([]);
      setUpgradePreview(null);
    }
  }, [isOpen, baseTiers]);

  // Load preview when selections change
  useEffect(() => {
    if (!isOpen) return;

    // Check if user has made any selection
    const hasSelection =
      selectedBaseTierId ||
      selectedCharityTierId ||
      selectedUpsellTierIds.length > 0;

    if (!hasSelection) {
      setUpgradePreview(null);
      return;
    }

    const loadPreview = async () => {
      setIsLoadingPreview(true);
      try {
        const preview = await upgradeApi.createUpgradePreview({
          cartItemId: cartItem.id,
          toBaseTierId: selectedBaseTierId, // Only send if actually upgrading base tier
          toCharityTierId: selectedCharityTierId,
          toUpsellTierIds:
            selectedUpsellTierIds.length > 0
              ? selectedUpsellTierIds
              : undefined,
        });
        setUpgradePreview(preview);
      } catch (error) {
        console.error("Failed to load upgrade preview:", error);
        setUpgradePreview(null);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    loadPreview();
  }, [
    isOpen,
    cartItem.id,
    selectedBaseTierId,
    selectedCharityTierId,
    selectedUpsellTierIds,
  ]);

  // Fetch payment status when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    const loadPaymentStatus = async () => {
      setIsLoadingPaymentStatus(true);
      try {
        const status = await upgradeApi.getPaymentStatus();
        setPaymentStatus(status);
      } catch (error) {
        console.error("Failed to load payment status:", error);
        setPaymentStatus(null);
      } finally {
        setIsLoadingPaymentStatus(false);
      }
    };

    loadPaymentStatus();
  }, [isOpen]);

  const resetState = () => {
    // Reset all state to initial values
    setSelectedBaseTierId("");
    setSelectedCharityTierId(undefined);
    setSelectedUpsellTierIds([]);
    setUpgradePreview(null);
    setIsLoadingPreview(false);
    setIsCompleting(false);
    setIsCancelling(false);
    setPaymentStatus(null);
    setIsLoadingPaymentStatus(false);
    setIsSettingUpPayment(false);
  };

  const handleClose = async () => {
    // Cancel the upgrade preview
    if (upgradePreview) {
      setIsCancelling(true);
      try {
        await upgradeApi.cancelUpgrade(upgradePreview.upgradeId);
      } catch (error) {
        console.error("Failed to cancel upgrade:", error);
      } finally {
        setIsCancelling(false);
      }
    }
    resetState();
    onClose();
  };

  const handleSetupPayment = async () => {
    setIsSettingUpPayment(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_AUTH_URL || process.env.AUTH_URL || window.location.origin;
      const setupSession = await upgradeApi.getStripeSetupSession({
        successUrl: `${baseUrl}/customer/purchases?upgrade=true&cartItemId=${cartItem.id}&payment=success`,
        cancelUrl: `${baseUrl}/customer/purchases?upgrade=true&cartItemId=${cartItem.id}&payment=cancelled`,
      });
      if (setupSession.url) {
        window.location.href = setupSession.url;
      } else {
        toast.error("Failed to get payment setup URL");
      }
    } catch (error) {
      console.error("Failed to setup payment:", error);
      toast.error("Failed to setup payment method");
    } finally {
      setIsSettingUpPayment(false);
    }
  };

  const handleComplete = async () => {
    if (!upgradePreview) return;

    setIsCompleting(true);
    try {
      await upgradeApi.completeUpgrade(upgradePreview.upgradeId);
      toast.success("Purchase upgraded successfully!");

      // Invalidate purchases query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["purchases"] });

      resetState();
      onClose();
    } catch (error) {
      console.error("Failed to complete upgrade:", error);
      // Error toast is handled by the API client
    } finally {
      setIsCompleting(false);
    }
  };

  // Get products unlocked by selected base tier
  const selectedBaseTierIndex = baseTiers.findIndex(
    (t) => t.id === selectedBaseTierId
  );
  const unlockedBaseTiers = baseTiers.slice(0, selectedBaseTierIndex + 1);
  const newBaseProducts = bundle.products.filter(
    (p) =>
      p.bundleTierId &&
      unlockedBaseTiers.some((t) => t.id === p.bundleTierId) &&
      !purchasedProductIds.has(p.id)
  );

  // Get charity products
  const newCharityProducts = selectedCharityTierId
    ? bundle.products.filter((p) => p.bundleTierId === selectedCharityTierId)
    : [];

  // Get upsell products
  const newUpsellProducts = bundle.products.filter(
    (p) =>
      p.bundleTierId && selectedUpsellTierIds.includes(p.bundleTierId)
  );

  const totalNewProducts =
    newBaseProducts.length +
    newCharityProducts.length +
    newUpsellProducts.length;

  // Check if base tier is actually an upgrade
  const isBaseTierUpgrade =
    selectedBaseTierId !== purchasedBaseTier?.id &&
    baseTiers.findIndex((t) => t.id === selectedBaseTierId) >
      baseTiers.findIndex((t) => t.id === purchasedBaseTier?.id);

  // Can only complete if there's an actual upgrade
  const canComplete =
    upgradePreview &&
    (isBaseTierUpgrade ||
      (selectedCharityTierId && !hasCharityTier) ||
      selectedUpsellTierIds.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogPortal>
        {/* Higher z-index overlay for popup-on-popup effect */}
        <DialogOverlay className="z-[150] bg-black/80" />
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-hidden z-[200] flex flex-col"
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Upgrade Purchase</DialogTitle>
            <DialogDescription>
              Upgrade your purchase of {cartItem.snapshotTitle} to unlock more
              content
            </DialogDescription>
          </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Collection Tier Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Collection Tier</h3>
            <div className="space-y-2">
              {baseTiers.map((tier) => {
                const isPurchased = tier.id === purchasedBaseTier?.id;
                const isLowerTier =
                  baseTiers.findIndex((t) => t.id === tier.id) <
                  baseTiers.findIndex((t) => t.id === purchasedBaseTier?.id);
                const isSelected = tier.id === selectedBaseTierId;
                const isDisabled = isLowerTier || isPurchased;

                // Get products specific to this tier
                const tierProducts = bundle.products.filter(
                  (p) => p.bundleTierId === tier.id
                );
                const itemCount = tierProducts.length;

                // Determine item type based on bundle type
                const isBookBundle = bundle.type === "EBook";
                const itemLabel = itemCount === 1
                  ? (isBookBundle ? "Book" : "Game")
                  : (isBookBundle ? "Books" : "Games");

                return (
                  <Card
                    key={tier.id}
                    className={`transition-all ${
                      isSelected
                        ? "border-2 border-primary bg-primary/10 dark:bg-primary/20 shadow-md"
                        : isPurchased
                          ? "border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 cursor-not-allowed"
                          : isLowerTier
                            ? "border-muted bg-muted/30 dark:bg-muted/10 cursor-not-allowed"
                            : "border-border hover:border-primary/50 hover:bg-accent cursor-pointer"
                    }`}
                    onClick={() => {
                      if (!isDisabled) {
                        setSelectedBaseTierId(tier.id);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`font-semibold ${
                                isLowerTier
                                  ? "text-muted-foreground"
                                  : isPurchased
                                    ? "text-green-700 dark:text-green-300"
                                    : isSelected
                                      ? "text-primary"
                                      : ""
                              }`}
                            >
                              {tier.name}
                            </span>
                            {isPurchased && (
                              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded font-medium">
                                Current Tier
                              </span>
                            )}
                            {isLowerTier && (
                              <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded font-medium">
                                Already Owned
                              </span>
                            )}
                            {isSelected && !isPurchased && (
                              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                                ↑ Upgrading to This
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              isDisabled
                                ? "text-muted-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {itemCount} {itemLabel}
                          </span>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              isDisabled
                                ? "text-muted-foreground"
                                : isSelected
                                  ? "text-primary"
                                  : ""
                            }`}
                          >
                            ${tier.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Charity Tier Selection */}
          {charityTiers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Add Charity Tier (Optional)
              </h3>
              <div className="space-y-2">
                {charityTiers.map((tier) => {
                  const tierProducts = bundle.products.filter(
                    (p) => p.bundleTierId === tier.id
                  );
                  const itemCount = tierProducts.length;
                  const isBookBundle = bundle.type === "EBook";
                  const itemLabel = itemCount === 1
                    ? (isBookBundle ? "Book" : "Game")
                    : (isBookBundle ? "Books" : "Games");
                  const isPurchased = hasCharityTier;

                  return (
                    <div key={tier.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`charity-${tier.id}`}
                        checked={selectedCharityTierId === tier.id}
                        disabled={isPurchased}
                        onCheckedChange={(checked) => {
                          setSelectedCharityTierId(
                            checked ? tier.id : undefined
                          );
                        }}
                      />
                      <Label
                        htmlFor={`charity-${tier.id}`}
                        className={`flex items-center justify-between flex-1 ${!isPurchased ? "cursor-pointer" : "opacity-50"}`}
                      >
                        <span>
                          {tier.name} - {itemCount} {itemLabel}
                          {isPurchased && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-2 py-0.5 rounded">
                              Already Owned
                            </span>
                          )}
                        </span>
                        <span className="font-semibold">
                          ${tier.price.toFixed(2)}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upsell Tier Selection */}
          {upsellTiers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Add Bonus Tiers (Optional)
              </h3>
              <div className="space-y-2">
                {upsellTiers.map((tier) => {
                  // Check if this tier was already purchased
                  const tierProducts = bundle.products.filter(
                    (p) => p.bundleTierId === tier.id
                  );
                  const isPurchased = tierProducts.every((p) =>
                    purchasedProductIds.has(p.id)
                  );
                  const itemCount = tierProducts.length;
                  const isBookBundle = bundle.type === "EBook";
                  const itemLabel = itemCount === 1
                    ? (isBookBundle ? "Book" : "Game")
                    : (isBookBundle ? "Books" : "Games");

                  return (
                    <div key={tier.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`upsell-${tier.id}`}
                        checked={selectedUpsellTierIds.includes(tier.id)}
                        disabled={isPurchased}
                        onCheckedChange={(checked) => {
                          setSelectedUpsellTierIds((prev) =>
                            checked
                              ? [...prev, tier.id]
                              : prev.filter((id) => id !== tier.id)
                          );
                        }}
                      />
                      <Label
                        htmlFor={`upsell-${tier.id}`}
                        className={`flex items-center justify-between flex-1 ${!isPurchased ? "cursor-pointer" : "opacity-50"}`}
                      >
                        <span>
                          {tier.name} - {itemCount} {itemLabel}
                          {isPurchased && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-2 py-0.5 rounded">
                              Already Owned
                            </span>
                          )}
                        </span>
                        <span className="font-semibold">
                          ${tier.price.toFixed(2)}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upgrade Preview Summary */}
          <div className={`rounded-lg border min-h-[280px] ${isLoadingPreview ? "bg-muted/30" : upgradePreview ? "bg-card" : "bg-muted/20"}`}>
            {isLoadingPreview ? (
              <div className="flex items-center justify-center h-[280px]">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Calculating upgrade cost...</span>
              </div>
            ) : upgradePreview ? (
              <div className="p-6 space-y-4 min-h-[280px]">
                <div className="flex items-center gap-2 pb-3 border-b">
                  <ArrowUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Upgrade Summary</h3>
                </div>

                <div className="space-y-3">
                  {upgradePreview.baseTierUpgradeAmount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Collection Tier Upgrade</span>
                      <span className="font-semibold">
                        ${upgradePreview.baseTierUpgradeAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {upgradePreview.charityTierAmount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Charity Tier</span>
                      <span className="font-semibold">
                        ${upgradePreview.charityTierAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {upgradePreview.upsellAmount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Bonus Tiers</span>
                      <span className="font-semibold">
                        ${upgradePreview.upsellAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-base font-semibold">Total to Pay</span>
                  <span className="text-2xl font-bold text-primary">
                    ${upgradePreview.totalAmount.toFixed(2)}
                  </span>
                </div>

                {totalNewProducts > 0 && (
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-muted-foreground">
                      You'll unlock {totalNewProducts} new{" "}
                      {totalNewProducts === 1
                        ? (bundle.type === "EBook" ? "book" : "game")
                        : (bundle.type === "EBook" ? "books" : "games")}
                    </span>
                  </div>
                )}

                {paymentStatus && !paymentStatus.hasStripePaymentMethod && (
                  <div className="flex items-start gap-3 p-4 mt-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        Payment Method Required
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        Add a payment method to complete this upgrade securely via Stripe.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ArrowUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-base mb-2">Select Your Upgrade</h4>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Choose a collection tier above to see pricing details and unlock new content
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 flex-shrink-0 mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCompleting || isCancelling || isSettingUpPayment}
          >
            {isCancelling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel"
            )}
          </Button>
          {paymentStatus && !paymentStatus.hasStripePaymentMethod ? (
            <Button
              onClick={handleSetupPayment}
              disabled={isSettingUpPayment || isLoadingPaymentStatus}
            >
              {isSettingUpPayment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Setup Payment Method
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canComplete || isLoadingPreview || isCompleting || isCancelling || isLoadingPaymentStatus}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Complete Upgrade
                </>
              )}
            </Button>
          )}
        </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
