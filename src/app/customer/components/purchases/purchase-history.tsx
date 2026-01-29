"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/(shared)/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(shared)/components/ui/select";
import { Input } from "@/app/(shared)/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/(shared)/components/ui/table";
import { Button } from "@/app/(shared)/components/ui/button";
import {
  CalendarIcon,
  SearchIcon,
  PackageIcon,
  XIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Loader2,
  Gift,
  Send,
  TrendingUp,
  Clock,
} from "lucide-react";
import { usePurchases } from "@/hooks/queries/usePurchases";
import { PurchaseQueryParams, GiftFilterType } from "@/lib/api/types/purchase";
import { CartItemStatus } from "@/lib/api/types/cart";
import { BundleProductsPopup } from "./collection-products-popup";
import { GiftIndicator } from "../gift-indicator";
import { FilterDropdown } from "../filter-dropdown";
import { toast } from "sonner";

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

// Helper function to check if upgrade is available
function isUpgradeAvailable(purchase: any): boolean {
  // Gifts cannot be upgraded
  if (purchase.isGift) {
    return false;
  }

  if (
    !purchase.upgradeFrom ||
    !purchase.upgradeTo ||
    !purchase.bundleUpgradeStatus
  ) {
    return false;
  }

  const now = new Date();
  const upgradeFrom = new Date(purchase.upgradeFrom);
  const upgradeTo = new Date(purchase.upgradeTo);

  // Check if we're within the upgrade period
  const isWithinPeriod = now >= upgradeFrom && now <= upgradeTo;

  // Check if there are any upgrades available
  const hasUpgradesAvailable =
    purchase.bundleUpgradeStatus.remainingBaseTiers > 0 ||
    purchase.bundleUpgradeStatus.remainingCharityTiers > 0 ||
    purchase.bundleUpgradeStatus.remainingUpsellTiers > 0;

  return isWithinPeriod && hasUpgradesAvailable;
}

// Helper function to check if purchase is expiring soon (less than 30 days)
function isExpiringSoon(purchase: any): { isExpiring: boolean; daysLeft: number } {
  if (!purchase.upgradeTo) {
    return { isExpiring: false, daysLeft: 0 };
  }

  const now = new Date();
  const expiryDate = new Date(purchase.upgradeTo);
  const diffMs = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Expiring if less than 30 days and purchase is not yet expired
  return { isExpiring: daysLeft >= 0 && daysLeft < 30, daysLeft };
}

// Helper function to get status badge styling
function getStatusBadge(status?: CartItemStatus) {
  switch (status) {
    case CartItemStatus.Completed:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
          Completed
        </span>
      );
    case CartItemStatus.Refunded:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">
          Refunded
        </span>
      );
    case CartItemStatus.Failed:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
          Failed
        </span>
      );
    case CartItemStatus.Expired:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
          Expired
        </span>
      );
    case CartItemStatus.Reserved:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
          Reserved
        </span>
      );
    case CartItemStatus.AddedToCart:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400">
          In Cart
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400">
          -
        </span>
      );
  }
}

const years = ["All Years", "2025", "2024"];

// Purchase Row Component
function PurchaseRow({
  purchase,
  index,
  shouldAutoOpen,
}: {
  purchase: any;
  index: number;
  shouldAutoOpen: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(shouldAutoOpen);
  const upgradeAvailable = isUpgradeAvailable(purchase);
  const { isExpiring, daysLeft } = isExpiringSoon(purchase);

  // Only show expiring soon label for gift purchases where gift hasn't been accepted yet
  const shouldShowExpiringLabel = isExpiring &&
    purchase.isGift === true &&
    purchase.giftAccepted !== true;

  return (
    <>
      <motion.tr
        key={purchase.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="transition-all cursor-pointer group hover:bg-primary/10 dark:hover:bg-slate-700/40"
        onClick={() => setIsModalOpen(true)}
      >
        <TableCell className="font-medium cursor-pointer">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span>{purchase.snapshotTitle || "Unknown Collection"}</span>
              {upgradeAvailable && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-secondary animate-pulse" />
                  <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                    Upgrade Available · {getTimeRemaining(purchase.upgradeTo)}
                  </span>
                </div>
              )}
              {shouldShowExpiringLabel && !upgradeAvailable && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400 animate-pulse" />
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded-full">
                    Expiring Soon · {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                  </span>
                </div>
              )}
            </div>
            <GiftIndicator cartItem={purchase} />
          </div>
        </TableCell>
        <TableCell className="cursor-pointer">
          {purchase.completedAt
            ? new Date(purchase.completedAt).toLocaleDateString()
            : "-"}
        </TableCell>
        <TableCell className="cursor-pointer">
          {getStatusBadge(purchase.status)}
        </TableCell>
        <TableCell className="cursor-pointer">
          {purchase.snapshotProducts.length}{" "}
          {purchase.snapshotProducts.length === 1 ? "item" : "items"}
        </TableCell>
        <TableCell className="cursor-pointer">
          <span>${purchase.totalAmount.toFixed(2)}</span>
        </TableCell>
      </motion.tr>
      <BundleProductsPopup
        purchase={purchase}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        autoOpenUpgrade={shouldAutoOpen}
      />
    </>
  );
}

// Gift ownership filter options
const ownershipOptions = [
  { value: "All", label: "All Purchases" },
  { value: "Owned", label: "My Purchases" },
  { value: "GivenByMe", label: "Gifted" },
];

export function PurchaseHistory() {
  const { user } = useAuth();
  const currentCustomerId = user?.id;
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [sortBy, setSortBy] = useState<PurchaseQueryParams["sortBy"]>("Date");
  const [sortDirection, setSortDirection] =
    useState<PurchaseQueryParams["sortDirection"]>("Descending");
  const [giftFilter, setGiftFilter] = useState<GiftFilterType>("All");

  // Check for upgrade parameter in URL
  const shouldAutoOpenUpgrade = searchParams.get("upgrade") === "true";
  const targetCartItemId = searchParams.get("cartItemId");
  const paymentStatus = searchParams.get("payment");
  const hasShownToastRef = useRef(false);

  // Show toast notification based on payment status (only once)
  useEffect(() => {
    if (!hasShownToastRef.current && paymentStatus) {
      if (paymentStatus === "success") {
        toast.success(
          "Payment method added successfully! You can now complete your upgrade.",
        );
      } else if (paymentStatus === "cancelled") {
        toast.info(
          "Payment setup was cancelled. You can try again when ready.",
        );
      }
      hasShownToastRef.current = true;
    }
  }, [paymentStatus]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build query params
  const queryParams: PurchaseQueryParams = {
    sortBy,
    sortDirection,
    giftFilter,
    ...(selectedYear !== "All Years" && {
      year: selectedYear as "2025" | "2024",
    }),
    ...(debouncedSearchQuery && { searchQuery: debouncedSearchQuery }),
  };

  const {
    data: purchases = [],
    isLoading,
    isError,
    error,
  } = usePurchases(queryParams);

  const resetFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSelectedYear("All Years");
    setSortBy("Date");
    setSortDirection("Descending");
    setGiftFilter("All");
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection((prev) =>
      prev === "Ascending" ? "Descending" : "Ascending",
    );
  };

  // Handle header click for sorting
  const handleHeaderClick = (column: PurchaseQueryParams["sortBy"]) => {
    if (sortBy === column) {
      // If clicking the same column, toggle direction
      toggleSortDirection();
    } else {
      // If clicking a different column, set new column and default to descending
      setSortBy(column);
      setSortDirection("Descending");
    }
  };

  // Get sort icon for a column
  const getSortIcon = (column: PurchaseQueryParams["sortBy"]) => {
    if (sortBy !== column) {
      return <ArrowUpDownIcon className="h-4 w-4 text-muted-foreground/50" />;
    }
    return sortDirection === "Ascending" ? (
      <ArrowUpIcon className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-primary" />
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[400px] flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Loading purchase history...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[400px] flex-col items-center justify-center">
            <PackageIcon className="h-8 w-8 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">
              Error loading purchases
            </h3>
            <p className="mb-6 max-w-md text-center text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Failed to load purchase history. Please try again."}
            </p>
            <Button onClick={() => window.location.reload()} className="gap-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Filters Card */}
      <Card className="bg-card border shadow-xs mb-6">
        <CardHeader className="pb-2">
          <h2 className="text-sm text-muted-foreground font-medium">Filters</h2>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Search Filter */}
            <div className="sm:col-span-3 lg:col-span-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Search
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search collections by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>

            {/* Year Filter */}
            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Year
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ownership Filter */}
            <FilterDropdown
              label="Ownership"
              options={ownershipOptions}
              value={giftFilter}
              onChange={(value) => setGiftFilter(value as GiftFilterType)}
              placeholder="All Purchases"
              searchPlaceholder="Search ownership..."
              showCounts={false}
              className="sm:col-span-1"
            />
          </div>

          {/* Clear Filters Button */}
          {(searchQuery ||
            selectedYear !== "All Years" ||
            giftFilter !== "All") && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="gap-2"
              >
                <XIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 &&
          !debouncedSearchQuery &&
          selectedYear === "All Years" ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                {giftFilter === "ReceivedByMe" ? (
                  <Gift className="h-8 w-8 text-primary" />
                ) : giftFilter === "GivenByMe" ? (
                  <Send className="h-8 w-8 text-primary" />
                ) : giftFilter === "Gifted" ? (
                  <Gift className="h-8 w-8 text-primary" />
                ) : (
                  <PackageIcon className="h-8 w-8 text-primary" />
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {giftFilter === "Owned"
                  ? "No personal purchases yet"
                  : giftFilter === "Gifted"
                    ? "No gift purchases yet"
                    : giftFilter === "GivenByMe"
                      ? "No gifts sent yet"
                      : giftFilter === "ReceivedByMe"
                        ? "No gifts received yet"
                        : "No purchases yet"}
              </h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                {giftFilter === "Owned"
                  ? "Ready to start your gaming journey? Check out our curated collections and build your game library."
                  : giftFilter === "Gifted"
                    ? "When you give or receive gifts, they will appear here."
                    : giftFilter === "GivenByMe"
                      ? "Share the joy of gaming! Browse our collections and send them as gifts to your friends."
                      : giftFilter === "ReceivedByMe"
                        ? "When someone sends you a collection as a gift, it will appear here."
                        : "Ready to start your gaming journey? Check out our curated collections and support amazing causes while building your game library."}
              </p>
              {giftFilter !== "ReceivedByMe" && (
                <Link href="/collections">
                  <Button className="bg-linear-to-r from-primary to-primary/90">
                    Browse Collections
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : purchases.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
            >
              <div className="mb-4 rounded-full bg-secondary/10 p-3">
                <SearchIcon className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No results found</h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                We couldn&apos;t find any collections matching your search
                criteria. Try adjusting your filters or search term.
              </p>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="gap-2"
              >
                <XIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <div className="rounded-lg border bg-card/30">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                      onClick={() => handleHeaderClick("Title")}
                    >
                      <div className="flex items-center gap-2">
                        Collection Name
                        {getSortIcon("Title")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                      onClick={() => handleHeaderClick("Date")}
                    >
                      <div className="flex items-center gap-2">
                        Date
                        {getSortIcon("Date")}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">Status</div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                      onClick={() => handleHeaderClick("Quantity")}
                    >
                      <div className="flex items-center gap-2">
                        Items
                        {getSortIcon("Quantity")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                      onClick={() => handleHeaderClick("Price")}
                    >
                      <div className="flex items-center gap-2">
                        Amount
                        {getSortIcon("Price")}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase, index) => {
                    // Auto-open the specific purchase if upgrade param is present and cartItemId matches
                    const shouldAutoOpen =
                      shouldAutoOpenUpgrade && targetCartItemId === purchase.id;
                    return (
                      <PurchaseRow
                        key={purchase.id}
                        purchase={purchase}
                        index={index}
                        shouldAutoOpen={shouldAutoOpen}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
