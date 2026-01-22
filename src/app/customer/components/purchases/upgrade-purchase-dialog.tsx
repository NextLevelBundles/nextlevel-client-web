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
  paymentSetupSuccessUrl?: string;
  paymentSetupCancelUrl?: string;
}

export function UpgradePurchaseDialog({
  isOpen,
  onClose,
  cartItem,
  bundle,
  paymentSetupSuccessUrl,
  paymentSetupCancelUrl,
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

      // Use provided URLs or fallback to default purchase page URLs
      const defaultSuccessUrl = `${baseUrl}/customer/purchases?upgrade=true&cartItemId=${cartItem.id}&payment=success`;
      const defaultCancelUrl = `${baseUrl}/customer/purchases?upgrade=true&cartItemId=${cartItem.id}&payment=cancelled`;

      const setupSession = await upgradeApi.getStripeSetupSession({
        successUrl: paymentSetupSuccessUrl || defaultSuccessUrl,
        cancelUrl: paymentSetupCancelUrl || defaultCancelUrl,
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

      // Invalidate bundle purchase query to refresh the bundle details page
      queryClient.invalidateQueries({ queryKey: ["bundle-purchase", bundle.id] });

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
              <div className="space-y-2 p-1">
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
                        checked={isPurchased || selectedCharityTierId === tier.id}
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
              <div className="space-y-2 p-1">
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
                        checked={isPurchased || selectedUpsellTierIds.includes(tier.id)}
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

                {paymentStatus?.hasStripePaymentMethod && paymentStatus.paymentMethod && (
                  <div className="flex items-start gap-3 p-4 mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    {/* Apple Pay */}
                    {(paymentStatus.paymentMethod.type === 'card' && (paymentStatus.paymentMethod.brand === 'apple_pay' || paymentStatus.paymentMethod.displayName?.includes('Apple Pay'))) ? (
                      <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path fill="#F6F8FA" d="M0 0h32v32H0z"></path>
                        <path d="M26.672 8H5.328c-.163 0-.327.002-.49.004a3.265 3.265 0 0 0-.49.043 1.56 1.56 0 0 0-1.148.837c-.076.149-.124.3-.153.464a3.442 3.442 0 0 0-.043.49L3 10.06v12.255c0 .164.002.328.004.492.004.163.014.328.043.489a1.562 1.562 0 0 0 .837 1.148c.149.076.3.124.464.153a3.3 3.3 0 0 0 .49.044l.223.003h21.877l.226-.003c.162-.005.326-.015.488-.044a1.65 1.65 0 0 0 .465-.153c.295-.15.534-.389.683-.683.074-.147.126-.304.153-.466.027-.161.041-.324.043-.488.002-.075.003-.149.003-.224l.001-.268V10.062c0-.075-.002-.15-.004-.225a3.243 3.243 0 0 0-.043-.489 1.567 1.567 0 0 0-1.3-1.301 3.274 3.274 0 0 0-.49-.043L26.938 8h-.266Z" fill="#000"></path>
                        <path d="M26.672 8.555h.262c.071 0 .143.002.215.004.123.003.27.009.405.034.118.022.217.053.312.103a1.004 1.004 0 0 1 .54.751c.025.134.032.28.035.405l.004.214v12.515c0 .07-.002.141-.004.212 0 .136-.012.272-.034.406a1.08 1.08 0 0 1-.102.311.996.996 0 0 1-.44.44c-.098.05-.202.084-.31.102a2.822 2.822 0 0 1-.404.035 8.19 8.19 0 0 1-.217.002H5.064c-.071 0-.143 0-.212-.002a2.832 2.832 0 0 1-.406-.035 1.087 1.087 0 0 1-.312-.102.995.995 0 0 1-.44-.44 1.09 1.09 0 0 1-.102-.312 2.744 2.744 0 0 1-.033-.405 10.392 10.392 0 0 1-.004-.213V10.066c0-.072.001-.143.004-.215.003-.124.01-.269.034-.405.018-.108.052-.213.102-.31a.998.998 0 0 1 .44-.441 1.11 1.11 0 0 1 .311-.103c.135-.02.27-.032.406-.033l.213-.004h21.607Z" fill="#fff"></path>
                        <path d="M10.098 13.599c.223-.28.373-.652.333-1.035-.325.016-.723.214-.953.494-.207.238-.39.628-.342.994.366.032.731-.183.962-.453Zm.33.524c-.531-.032-.984.302-1.237.302-.254 0-.643-.286-1.063-.278a1.567 1.567 0 0 0-1.331.81c-.571.983-.151 2.442.404 3.244.27.396.594.833 1.022.817.405-.016.564-.26 1.055-.26s.634.26 1.062.252c.444-.008.722-.396.991-.793.31-.453.437-.889.444-.913-.007-.007-.857-.333-.864-1.308-.007-.818.666-1.206.699-1.23-.382-.563-.976-.627-1.183-.642m4.626-1.106c1.155 0 1.959.796 1.959 1.955 0 1.162-.82 1.963-1.988 1.963h-1.278v2.032h-.924v-5.95h2.231Zm-1.307 3.143h1.06c.804 0 1.261-.433 1.261-1.184 0-.75-.457-1.18-1.257-1.18h-1.064v2.364Zm3.508 1.574c0-.759.581-1.224 1.612-1.282l1.187-.07v-.334c0-.482-.326-.771-.87-.771-.515 0-.837.247-.915.635h-.84c.049-.784.716-1.362 1.788-1.362 1.052 0 1.724.557 1.724 1.428v2.99h-.853v-.714h-.02c-.252.483-.802.788-1.37.788-.85 0-1.443-.528-1.443-1.308Zm2.8-.39v-.343l-1.069.065c-.53.037-.832.273-.832.644 0 .38.313.627.791.627.623 0 1.11-.428 1.11-.994Zm1.692 3.22v-.722c.066.017.215.017.289.017.413 0 .635-.174.771-.619 0-.009.078-.264.078-.268l-1.566-4.342h.965l1.098 3.53h.016l1.097-3.53h.94l-1.625 4.565c-.37 1.052-.8 1.39-1.699 1.39a3.699 3.699 0 0 1-.363-.021Z" fill="#000"></path>
                      </svg>
                    ) : (paymentStatus.paymentMethod.type === 'card' && (paymentStatus.paymentMethod.brand === 'google_pay' || paymentStatus.paymentMethod.displayName?.includes('Google Pay'))) ? (
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" className="flex-shrink-0">
                        <path fill="#F5F6F8" d="M0 0h32v32H0z"></path>
                        <path fill="#3C4043" d="M15.135 16.453v3.008h-.954v-7.428h2.53c.641 0 1.188.214 1.636.642.457.427.686.95.686 1.566 0 .63-.229 1.153-.686 1.575-.443.423-.99.632-1.636.632h-1.576v.005Zm0-3.505v2.59h1.596c.378 0 .696-.13.944-.383.254-.253.383-.561.383-.91a1.24 1.24 0 0 0-.383-.9 1.238 1.238 0 0 0-.944-.392h-1.596v-.005Zm6.393 1.262c.706 0 1.263.19 1.67.567.408.378.612.895.612 1.551v3.133h-.91v-.706h-.04c-.392.581-.92.87-1.575.87-.562 0-1.03-.165-1.407-.498a1.587 1.587 0 0 1-.567-1.242c0-.527.199-.945.597-1.253.397-.313.93-.468 1.59-.468.567 0 1.034.105 1.397.314v-.22c0-.332-.129-.61-.392-.844a1.347 1.347 0 0 0-.925-.348c-.532 0-.954.223-1.263.676l-.84-.527c.462-.671 1.148-1.004 2.053-1.004Zm-1.233 3.69c0 .248.105.457.318.62.21.165.458.25.741.25.403 0 .76-.15 1.074-.448.313-.298.472-.646.472-1.049-.298-.234-.71-.353-1.242-.353-.388 0-.711.095-.97.278-.263.194-.393.428-.393.701ZM29 14.375l-3.182 7.318h-.984l1.183-2.56-2.098-4.758h1.039l1.511 3.649h.02l1.472-3.65H29Z"></path>
                        <path fill="#4285F4" d="M11.339 15.846a5 5 0 0 0-.08-.895h-4v1.64l2.304.001a1.974 1.974 0 0 1-.856 1.321v1.065h1.372c.8-.742 1.26-1.837 1.26-3.132Z"></path>
                        <path fill="#34A853" d="M8.707 17.913c-.381.258-.873.409-1.448.409-1.111 0-2.054-.75-2.392-1.758H3.453v1.097a4.26 4.26 0 0 0 3.806 2.346c1.15 0 2.117-.379 2.82-1.03l-1.372-1.064Z"></path>
                        <path fill="#FABB05" d="M4.735 15.75c0-.284.047-.558.133-.816v-1.097H3.453A4.236 4.236 0 0 0 3 15.749c0 .688.164 1.338.453 1.913l1.415-1.098a2.568 2.568 0 0 1-.133-.815Z"></path>
                        <path fill="#E94235" d="M7.258 13.177c.628 0 1.19.216 1.634.639l1.216-1.215a4.091 4.091 0 0 0-2.85-1.11 4.26 4.26 0 0 0-3.806 2.346l1.415 1.098c.338-1.01 1.28-1.758 2.391-1.758 Z"></path>
                      </svg>
                    ) : paymentStatus.paymentMethod.type === 'bancontact' ? (
                      <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path fill="#EBF1F7" d="M0 0h32v32H0z"></path>
                        <g clipPath="url(#bi_bancontact__a)">
                          <path d="M8.164 21.448c3.918 0 5.877-2.612 7.836-5.224H3v5.224h5.164Z" fill="url(#bi_bancontact__b)"></path>
                          <path d="M23.836 11c-3.918 0-5.877 2.612-7.836 5.224h13V11h-5.164Z" fill="url(#bi_bancontact__c)"></path>
                        </g>
                        <defs>
                          <linearGradient id="bi_bancontact__b" x1="5.629" y1="19.077" x2="15.139" y2="15.544" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#005AB9"></stop>
                            <stop offset="1" stopColor="#1E3764"></stop>
                          </linearGradient>
                          <linearGradient id="bi_bancontact__c" x1="16.787" y1="16.677" x2="26.885" y2="13.232" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FBA900"></stop>
                            <stop offset="1" stopColor="#FFD800"></stop>
                          </linearGradient>
                          <clipPath id="bi_bancontact__a">
                            <path fill="#fff" transform="translate(3 11)" d="M0 0h26v10.447H0z"></path>
                          </clipPath>
                        </defs>
                      </svg>
                    ) : paymentStatus.paymentMethod.type === 'cashapp' ? (
                      <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path fill="#00D64F" d="M0 0h32v32H0z"></path>
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.892 10.264c1.782 0 3.49.693 4.607 1.643.282.24.705.24.97-.018l1.328-1.293a.646.646 0 0 0-.032-.968 10.625 10.625 0 0 0-3.56-1.92l.416-1.903C20.71 5.39 20.38 5 19.94 5h-2.567a.69.69 0 0 0-.68.528l-.376 1.693c-3.412.163-6.303 1.796-6.303 5.147 0 2.9 2.392 4.144 4.917 5.004 2.393.86 3.655 1.18 3.655 2.391 0 1.243-1.262 1.976-3.123 1.976-1.697 0-3.475-.537-4.854-1.841a.713.713 0 0 0-.974-.002l-1.427 1.35a.652.652 0 0 0 .004.96c1.113 1.036 2.522 1.786 4.13 2.206l-.391 1.763c-.092.413.234.803.676.806l2.57.019a.689.689 0 0 0 .686-.53l.371-1.695c4.085-.242 6.586-2.372 6.586-5.49 0-2.868-2.492-4.08-5.516-5.068-1.728-.606-3.224-1.02-3.224-2.263 0-1.21 1.397-1.69 2.792-1.69Z" fill="#fff"></path>
                      </svg>
                    ) : paymentStatus.paymentMethod.type === 'eps' ? (
                      <svg aria-hidden="true" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <g fill="none" fillRule="evenodd">
                          <path d="M0 0h32v32H0z" fill="#fff"></path>
                          <g fillRule="nonzero">
                            <path d="M26.834 16h-2.32a.465.465 0 0 1-.467-.464c0-.258.21-.485.468-.485h3.53v-1.747h-3.53a2.242 2.242 0 0 0-2.236 2.24 2.242 2.242 0 0 0 2.236 2.24h2.288c.258 0 .467.206.467.464s-.21.448-.467.448h-4.907c-.416.798-.821 1.481-1.643 1.823h6.581c1.212-.018 2.203-1.046 2.203-2.268 0-1.222-.991-2.233-2.203-2.251" fill="#5f6360"></path>
                            <path d="M17.943 13.304c-1.966 0-3.567 1.615-3.567 3.6v7.488h1.78V20.52h1.783c1.966 0 3.561-1.637 3.561-3.622 0-1.984-1.591-3.593-3.557-3.593zm0 5.392h-1.788v-1.799c0-1.005.798-1.822 1.788-1.822.989 0 1.794.817 1.794 1.822s-.805 1.8-1.794 1.8z" fill="#5f6360"></path>
                            <g fill="#a41760">
                              <path d="M8.741 20.519c-1.683 0-3.098-1.203-3.48-2.774 0 0-.111-.519-.111-.861 0-.342.105-.867.105-.867a3.592 3.592 0 0 1 3.478-2.734 3.603 3.603 0 0 1 3.598 3.592v.872H7.08c.31.607.937.95 1.66.95h4.72l.006-5.14c0-.766-.625-1.392-1.39-1.392H5.39c-.764 0-1.389.607-1.389 1.374v6.707c0 .766.625 1.412 1.389 1.412h6.689c.685 0 1.257-.493 1.368-1.139z"></path>
                              <path d="M8.733 14.988c-.72 0-1.346.442-1.657 1.012h3.315c-.31-.57-.937-1.012-1.658-1.012m3.03-5.005c0-1.637-1.357-2.964-3.03-2.964-1.646 0-2.985 1.284-3.029 2.883v.911c0 .107.087.212.195.212h1.115c.11 0 .205-.105.205-.212v-.83c0-.817.679-1.482 1.514-1.482.836 0 1.515.665 1.515 1.482v.83c0 .107.088.212.197.212h1.115c.11 0 .203-.105.203-.212z"></path>
                            </g>
                          </g>
                        </g>
                      </svg>
                    ) : paymentStatus.paymentMethod.type === 'ideal' ? (
                      <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path fill="#DB308B" d="M0 0h32v32H0z"></path>
                        <g clipPath="url(#bi_ideal__a)" fillRule="evenodd" clipRule="evenodd">
                          <path d="M17.876 8c2.394 0 4.39.639 5.771 1.847C25.209 11.213 26 13.283 26 16c0 5.384-2.657 8-8.124 8H7V8h10.876Z" fill="#fff"></path>
                          <path d="M17.845 8.196c2.34 0 4.29.623 5.64 1.802 1.526 1.332 2.3 3.352 2.3 6.002 0 5.252-2.598 7.804-7.94 7.804H7.215V8.196h10.63ZM18.074 7H6v18h12.074v-.003c2.636-.035 4.726-.68 6.209-1.92C26.086 21.57 27 19.189 27 16c0-1.524-.24-2.891-.715-4.063a7.404 7.404 0 0 0-1.993-2.833c-1.53-1.336-3.677-2.059-6.218-2.1V7Z" fill="#000"></path>
                          <path d="M17.678 21.24h-3.53V10.524h3.53-.143c2.945 0 6.078 1.14 6.078 5.372 0 4.473-3.133 5.343-6.078 5.343h.143v.001Z" fill="#DB4093"></path>
                          <path d="M10.852 14.557c1.085 0 1.965-.862 1.965-1.925 0-1.063-.88-1.925-1.965-1.925s-1.964.862-1.964 1.925c0 1.063.88 1.925 1.964 1.925Zm-1.767.896v5.645h3.47v-5.645h-3.47Z" fill="#000"></path>
                        </g>
                        <defs>
                          <clipPath id="bi_ideal__a">
                            <path fill="#fff" transform="translate(6 7)" d="M0 0h21v18H0z"></path>
                          </clipPath>
                        </defs>
                      </svg>
                    ) : paymentStatus.paymentMethod.type === 'kakao_pay' ? (
                      <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path fill="#FFEB00" d="M0 0h32v32H0z"></path>
                        <path fillRule="evenodd" clipRule="evenodd" d="M23 21H9a5 5 0 0 1 0-10h14a5 5 0 0 1 0 10Z" fill="#000"></path>
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.615 13.4c-1.507 0-2.73.965-2.73 2.155 0 .765.507 1.437 1.267 1.82l-.258.96a.08.08 0 0 0 .02.083.078.078 0 0 0 .056.022.08.08 0 0 0 .048-.017l1.105-.747c.16.023.325.036.492.036 1.506 0 2.729-.965 2.729-2.155S11.122 13.4 9.614 13.4Z" fill="#FFEB00"></path>
                        <path d="M14.643 17.347v1.391h-.99v-5.133h.698l.122.326c.21-.21.53-.434 1.046-.434.972 0 1.433.726 1.426 1.9 0 1.23-.713 2.017-1.732 2.017-.196 0-.346-.013-.57-.067Zm0-2.914v2.22c.055.007.19.02.32.02.707 0 .978-.494.978-1.276 0-.685-.183-1.1-.746-1.1-.183 0-.389.055-.552.136Zm4.46.619h.563v-.122c0-.407-.231-.598-.632-.598a2.47 2.47 0 0 0-1.018.246l-.271-.666c.353-.245.895-.414 1.378-.414.95 0 1.466.502 1.466 1.46v2.356h-.699l-.102-.312c-.4.292-.767.414-1.1.414-.726 0-1.134-.434-1.134-1.168 0-.781.544-1.195 1.548-1.195v-.002Zm.563 1.31v-.68h-.455c-.509 0-.767.183-.767.55 0 .279.143.414.434.414.27 0 .619-.135.788-.285Zm3.924.57c-.345.923-.76 1.596-1.364 1.97l-.61-.564c.353-.306.604-.605.82-1.005l-1.317-3.591.984-.265.842 2.913.835-2.926.971.271-1.16 3.197Z" fill="#FFEB00"></path>
                      </svg>
                    ) : paymentStatus.paymentMethod.type === 'klarna' ? (
                      <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path fill="#FFA8CD" d="M0 0h32v32H0z"></path>
                        <path fill="#0B051D" d="M23.665 6h-4.342c0 3.571-2.185 6.771-5.506 9.057l-1.305.914V6H8v20h4.512v-9.914L19.975 26h5.506l-7.18-9.486c3.264-2.371 5.392-6.057 5.364-10.514Z"></path>
                      </svg>
                    ) : paymentStatus.paymentMethod.type === 'link' ? (
                      <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path fill="#00D66F" d="M0 0h32v32H0z"></path>
                        <path fill="#011E0F" d="M15.144 6H10c1 4.18 3.923 7.753 7.58 10C13.917 18.246 11 21.82 10 26h5.144c1.275-3.867 4.805-7.227 9.142-7.914v-4.18c-4.344-.68-7.874-4.04-9.142-7.906Z"></path>
                      </svg>
                    ) : (
                      <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Payment Method
                      </p>
                      <div className="text-xs text-blue-800 dark:text-blue-300 space-y-0.5">
                        {paymentStatus.paymentMethod.displayName ? (
                          <p>{paymentStatus.paymentMethod.displayName}</p>
                        ) : paymentStatus.paymentMethod.type === 'card' ? (
                          <p>
                            {paymentStatus.paymentMethod.brand === 'apple_pay'
                              ? 'Apple Pay'
                              : paymentStatus.paymentMethod.brand === 'google_pay'
                                ? 'Google Pay'
                                : paymentStatus.paymentMethod.brand.toUpperCase()} ending in {paymentStatus.paymentMethod.last4}
                          </p>
                        ) : paymentStatus.paymentMethod.type === 'us_bank_account' ? (
                          <p>
                            {paymentStatus.paymentMethod.bankName || 'Bank Account'} ending in {paymentStatus.paymentMethod.last4}
                          </p>
                        ) : paymentStatus.paymentMethod.type === 'sepa_debit' ? (
                          <p>
                            {paymentStatus.paymentMethod.bankName || 'SEPA Debit'} ending in {paymentStatus.paymentMethod.last4}
                          </p>
                        ) : (
                          <p>{paymentStatus.paymentMethod.type}</p>
                        )}
                      </div>
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
