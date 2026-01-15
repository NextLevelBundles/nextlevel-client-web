import { Bundle } from "@/app/(shared)/types/bundle";

/**
 * Get the upgrade period dates for a bundle using the fallback chain:
 * upgradeFrom/upgradeTo -> sellFrom/sellTo -> startsAt/endsAt
 *
 * This matches the backend logic:
 * var upgradeStart = bundle.UpgradeFrom ?? bundle.SellFrom ?? bundle.StartsAt;
 * var upgradeEnd = bundle.UpgradeTo ?? bundle.SellTo ?? bundle.EndsAt;
 */
export function getUpgradePeriod(bundle: Bundle | null | undefined): {
  startDate: Date;
  endDate: Date;
} | null {
  if (!bundle) return null;

  const upgradeStartDate = bundle.upgradeFrom
    ? new Date(bundle.upgradeFrom)
    : bundle.sellFrom
    ? new Date(bundle.sellFrom)
    : new Date(bundle.startsAt);

  const upgradeEndDate = bundle.upgradeTo
    ? new Date(bundle.upgradeTo)
    : bundle.sellTo
    ? new Date(bundle.sellTo)
    : new Date(bundle.endsAt);

  return {
    startDate: upgradeStartDate,
    endDate: upgradeEndDate,
  };
}

/**
 * Check if the upgrade period is currently active for a bundle
 */
export function isUpgradePeriodActive(bundle: Bundle | null | undefined): boolean {
  const period = getUpgradePeriod(bundle);
  if (!period) return false;

  const now = new Date();
  return now >= period.startDate && now <= period.endDate;
}
