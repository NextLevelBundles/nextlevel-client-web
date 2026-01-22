"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/app/(shared)/components/ui/badge";
import { Button } from "@/app/(shared)/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/(shared)/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/(shared)/components/ui/tabs";
import { ScrollArea } from "@/app/(shared)/components/ui/scroll-area";
import { CartItem, CartItemStatus } from "@/lib/api/types/cart";
import { Bundle, TierType } from "@/app/(shared)/types/bundle";
import { isBookBundle } from "@/app/(shared)/utils/cart";
import { isUpgradePeriodActive } from "@/app/(shared)/utils/bundle";
import {
  ExternalLink,
  Heart,
  BookOpen,
  Gamepad2,
  FileText,
  ArrowUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UpgradePurchaseDialog } from "@/customer/components/purchases/upgrade-purchase-dialog";
import { UpgradeInfoDialog } from "@/customer/components/purchases/upgrade-info-dialog";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";

// Helper function to format time remaining
function getTimeRemaining(upgradeTo: string): string {
  const now = new Date();
  const endDate = new Date(upgradeTo);
  const diffMs = endDate.getTime() - now.getTime();

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 1) {
    return `${diffDays} days left`;
  } else if (diffDays === 1) {
    return "1 day left";
  } else if (diffHours > 1) {
    return `${diffHours} hours left`;
  } else if (diffHours === 1) {
    return "1 hour left";
  } else if (diffMinutes > 1) {
    return `${diffMinutes} minutes left`;
  } else {
    return "Less than 1 minute left";
  }
}

interface CartItemModalProps {
  item: CartItem | null;
  isOpen: boolean;
  onClose: () => void;
  bundle?: Bundle;
  autoOpenUpgrade?: boolean;
}

export function CartItemModal({
  item,
  isOpen,
  onClose,
  bundle,
  autoOpenUpgrade = false,
}: CartItemModalProps) {
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(autoOpenUpgrade);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  if (!item) return null;

  // Calculate revenue distribution using bundle-specific splits
  let publisherAmount = item.baseAmount * (item.snapshotPublisherSplit / 100);
  let platformAmount = item.baseAmount * (item.snapshotPlatformSplit / 100);
  let charityAmount = item.baseAmount * (item.snapshotCharitySplit / 100);
  charityAmount += item.charityAmount;

  // Tip distribution based on excess distribution type
  if (item.tipAmount > 0) {
    if (item.snapshotExcessDistributionType === "Publishers") {
      publisherAmount += item.tipAmount;
    } else {
      charityAmount += item.tipAmount;
    }
  }

  const developerSupportAmount = item.upsellAmount;
  const totalAmount = item.totalAmount;

  // Check upgrade eligibility
  const upgradeEligibility = useMemo(() => {
    // Only for completed purchases
    if (item.status !== CartItemStatus.Completed) {
      return { canUpgrade: false, reason: "Purchase not completed" };
    }

    // Must have bundle data
    if (!bundle) {
      return { canUpgrade: null, reason: "Loading..." }; // null = loading
    }

    // Check if this is a gifted purchase
    const isGiftedPurchase = item.isGift === true;

    // FIRST: Check if user has maxed out all tiers
    // (This should be prioritized over upgrade period check)
    const baseTiers = bundle.tiers
      .filter((t) => t.type === TierType.Base)
      .sort((a, b) => a.price - b.price);
    const charityTiers = bundle.tiers.filter(
      (t) => t.type === TierType.Charity
    );
    const upsellTiers = bundle.tiers.filter((t) => t.type === TierType.Upsell);

    const purchasedBaseTierPrice = item.snapshotTierPrice || 0;
    const highestBaseTierPrice =
      baseTiers.length > 0 ? baseTiers[baseTiers.length - 1].price : 0;
    const hasHighestBaseTier = purchasedBaseTierPrice >= highestBaseTierPrice;

    const hasCharityTier = (item.charityAmount || 0) > 0;
    const allCharityTiersPurchased =
      charityTiers.length === 0 || hasCharityTier;

    // Check if all upsell tiers are purchased
    const purchasedProductIds = new Set(
      item.snapshotProducts.map((p) => p.productId)
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
        reason: "You own the complete collection with all available tiers",
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
  }, [item, bundle]);

  const handleUpgradeClick = () => {
    if (upgradeEligibility.isGiftedPurchase) {
      setIsInfoDialogOpen(true);
    } else {
      setIsUpgradeDialogOpen(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Image
              width={150}
              height={150}
              src={item.snapshotImageUrl ?? ""}
              alt={item.snapshotTitle ?? "Cart item image"}
              className="w-8 h-8 rounded object-cover"
            />
            <div className="flex items-center gap-2 flex-1">
              <span>{item.snapshotTitle}</span>
              <Badge
                variant="outline"
                className={
                  isBookBundle(item)
                    ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-300"
                }
              >
                {isBookBundle(item) ? (
                  <>
                    <BookOpen className="h-3 w-3 mr-1" /> Book Collection
                  </>
                ) : (
                  <>
                    <Gamepad2 className="h-3 w-3 mr-1" /> Steam Game Collection
                  </>
                )}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Upgrade Available Banner */}
        {item.status === CartItemStatus.Completed &&
          upgradeEligibility.canUpgrade &&
          !upgradeEligibility.isGiftedPurchase &&
          item.upgradeTo && (
            <Alert className="mt-4 border-secondary/50 bg-secondary/5">
              <ArrowUp className="h-4 w-4 text-secondary" />
              <AlertDescription className="text-sm">
                <span className="font-semibold text-secondary">
                  Upgrade available
                </span>{" "}
                · {getTimeRemaining(item.upgradeTo)} to upgrade this purchase
              </AlertDescription>
            </Alert>
          )}

        <Tabs defaultValue="details" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="gap-2 cursor-pointer">
              <BookOpen className="h-4 w-4" />
              What's Included
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2 cursor-pointer">
              <Heart className="h-4 w-4" />
              Payment Breakdown
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-4">
            <div>
              <h4 className="font-semibold mb-3">
                {item.snapshotProducts.length}{" "}
                {isBookBundle(item)
                  ? item.snapshotProducts.length === 1
                    ? "Book"
                    : "Books"
                  : item.snapshotProducts.length === 1
                    ? "Steam Game"
                    : "Steam Games"}{" "}
                Included
              </h4>
              <ScrollArea className="h-[500px] pr-4">
                <div className="grid gap-3">
                  {item.snapshotProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <Image
                        width={150}
                        height={150}
                        src={product.coverImageUrl}
                        alt={product.title}
                        className="w-12 object-contain rounded aspect-[2/3]"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{product.title}</h5>
                        {product.bookInfo ? (
                          <div className="space-y-1 mt-1">
                            {product.bookInfo.metadata?.author && (
                              <div className="text-xs text-muted-foreground">
                                by {product.bookInfo.metadata.author}
                              </div>
                            )}
                            {product.bookInfo.metadata?.availableFormats &&
                              product.bookInfo.metadata.availableFormats
                                .length > 0 && (
                                <div className="flex gap-1">
                                  {product.bookInfo.metadata.availableFormats.map(
                                    (format) => (
                                      <span
                                        key={format}
                                        className="inline-flex items-center gap-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded"
                                      >
                                        <FileText className="h-3 w-3" />
                                        {format}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        ) : null}
                      </div>
                      {!product.bookInfo && product.steamGameInfo && (
                        <Link
                          href={`https://store.steampowered.com/app/${product.steamGameInfo?.steamAppId ?? ""}`}
                          target="_blank"
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Revenue Summary Tab */}
          <TabsContent value="revenue" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {/* Distribution Bar */}
                <div className="relative h-8 rounded-lg overflow-hidden flex bg-gray-200 dark:bg-gray-700">
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
                          ? `${Math.max(0, (charityAmount / totalAmount) * 100)}%`
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
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-400 dark:bg-yellow-600" />
                      <span className="text-sm font-medium">Publishers</span>
                    </div>
                    <span className="text-sm font-bold">
                      ${publisherAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-400 dark:bg-blue-600" />
                      <span className="text-sm font-medium">Platform</span>
                    </div>
                    <span className="text-sm font-bold">
                      ${platformAmount.toFixed(2)}
                    </span>
                  </div>

                  {charityAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-rose-400 dark:bg-rose-600" />
                        <span className="text-sm font-medium">Charity</span>
                      </div>
                      <span className="text-sm font-bold">
                        ${charityAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {developerSupportAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-400 dark:bg-purple-600" />
                        <span className="text-sm font-medium">Extras</span>
                      </div>
                      <span className="text-sm font-bold">
                        ${developerSupportAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tip Information - Prominent Section */}
                {item.tipAmount > 0 &&
                  item.snapshotExcessDistributionType === "Publishers" && (
                    <div className="mt-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Your ${item.tipAmount.toFixed(2)} tip goes 100% to
                        Publishers
                      </p>
                    </div>
                  )}

                {item.tipAmount > 0 &&
                  item.snapshotExcessDistributionType === "Charity" && (
                    <div className="mt-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Your ${item.tipAmount.toFixed(2)} extra donation for
                        goes 100% to Charity
                      </p>
                    </div>
                  )}

                {/* Breakdown details */}
                <div className="mt-6 pt-4 border-t space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Collection Tier</span>
                    <span>${item.baseAmount.toFixed(2)}</span>
                  </div>
                  {item.charityAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Charity Tier</span>
                      <span>${item.charityAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {item.tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span>
                        Tip for{" "}
                        {item.snapshotExcessDistributionType === "Publishers"
                          ? "Publishers"
                          : "Charity"}
                      </span>
                      <span>${item.tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {item.upsellAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Extra Items</span>
                      <span>${item.upsellAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Total Amount - Prominent at bottom */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Total Amount</h4>
                    <p className="text-2xl font-bold">
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Upgrade Section */}
        {item.status === CartItemStatus.Completed && (
          <div className="mt-4 pt-4 border-t">
            {upgradeEligibility.canUpgrade === null ? (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading upgrade options...</span>
              </div>
            ) : upgradeEligibility.canUpgrade === false ? (
              <Alert
                variant="default"
                className={
                  upgradeEligibility.reason?.includes("complete collection")
                    ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                    : ""
                }
              >
                {upgradeEligibility.reason?.includes("complete collection") ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription
                  className={`text-sm ${
                    upgradeEligibility.reason?.includes("complete collection")
                      ? "text-green-700 dark:text-green-300 font-medium"
                      : ""
                  }`}
                >
                  {upgradeEligibility.reason}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Button
                  className={`w-full gap-2 ${upgradeEligibility.isGiftedPurchase ? "opacity-50" : ""}`}
                  variant="outline"
                  onClick={handleUpgradeClick}
                >
                  <ArrowUp className="h-4 w-4" />
                  Upgrade This Purchase
                  {item.upgradeTo && !upgradeEligibility.isGiftedPurchase && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({getTimeRemaining(item.upgradeTo)})
                    </span>
                  )}
                </Button>
                {upgradeEligibility.isGiftedPurchase && (
                  <p className="text-xs text-center text-muted-foreground">
                    Click to learn why upgrades aren't available for gifts
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>

      {/* Upgrade dialogs */}
      {bundle && upgradeEligibility.canUpgrade && (
        <>
          <UpgradeInfoDialog
            isOpen={isInfoDialogOpen}
            onClose={() => setIsInfoDialogOpen(false)}
          />
          {!upgradeEligibility.isGiftedPurchase && (
            <UpgradePurchaseDialog
              isOpen={isUpgradeDialogOpen}
              onClose={() => setIsUpgradeDialogOpen(false)}
              cartItem={item}
              bundle={bundle}
            />
          )}
        </>
      )}
    </Dialog>
  );
}
