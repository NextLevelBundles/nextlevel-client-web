"use client";

import { CartItem } from "@/lib/api/types/cart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/utils/tailwind";

interface CartItemRevenueModalProps {
  item: CartItem;
  isOpen: boolean;
  onClose: () => void;
}

export function CartItemRevenueModal({
  item,
  isOpen,
  onClose,
}: CartItemRevenueModalProps) {
  // Calculate revenue distribution using bundle-specific splits
  let publisherAmount = 0;
  let platformAmount = 0;
  let charityAmount = 0;
  let developerSupportAmount = 0;

  // Base tier distribution using bundle-specific splits
  publisherAmount = item.baseAmount * (item.snapshotPublisherSplit / 100);
  platformAmount = item.baseAmount * (item.snapshotPlatformSplit / 100);
  charityAmount = item.baseAmount * (item.snapshotCharitySplit / 100);

  // Charity tier - 100% to charity
  charityAmount += item.charityAmount;

  // Tip - 100% to publishers or charity depending on bundle settings
  // Note: We don't have excessDistributionType in CartItem, so we'll add tip to publishers
  publisherAmount += item.tipAmount;

  // Upsell tiers - 100% to developers
  developerSupportAmount = item.upsellAmount;

  const totalAmount = item.totalAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Revenue Distribution</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {item.snapshotTitle}
            </h4>
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>

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
                <span className="text-sm font-medium">Partners</span>
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
          {item.tipAmount > 0 && (
            <div className="mt-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Your ${item.tipAmount.toFixed(2)} tip goes 100% to Partners
              </p>
            </div>
          )}

          {/* Breakdown details */}
          <div className="mt-6 pt-4 border-t space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Base Tier</span>
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
                <span>Tip</span>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
