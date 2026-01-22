import { CartItem } from "@/lib/api/types/cart";

/**
 * Determines if a cart item is a book bundle by checking if any
 * of its snapshot products have bookInfo
 */
export function isBookBundle(item: CartItem): boolean {
  return item.snapshotProducts?.some(product => product.bookInfo != null) ?? false;
}

/**
 * Determines if a cart item is a game bundle by checking if none
 * of its snapshot products have bookInfo
 */
export function isGameBundle(item: CartItem): boolean {
  return !isBookBundle(item);
}

/**
 * Helper function to format time remaining for upgrades
 */
export function getTimeRemaining(upgradeTo: string): string {
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

/**
 * Helper function to check if upgrade is available for a cart item
 */
export function isUpgradeAvailable(item: CartItem): boolean {
  // Gifts cannot be upgraded
  if (item.isGift) {
    return false;
  }

  if (!item.upgradeFrom || !item.upgradeTo || !item.bundleUpgradeStatus) {
    return false;
  }

  const now = new Date();
  const upgradeFrom = new Date(item.upgradeFrom);
  const upgradeTo = new Date(item.upgradeTo);

  // Check if we're within the upgrade period
  const isWithinPeriod = now >= upgradeFrom && now <= upgradeTo;

  // Check if there are any upgrades available
  const hasUpgradesAvailable =
    item.bundleUpgradeStatus.remainingBaseTiers > 0 ||
    item.bundleUpgradeStatus.remainingCharityTiers > 0 ||
    item.bundleUpgradeStatus.remainingUpsellTiers > 0;

  return isWithinPeriod && hasUpgradesAvailable;
}