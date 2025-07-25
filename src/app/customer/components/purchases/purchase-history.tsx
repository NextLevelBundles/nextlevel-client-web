"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
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
} from "lucide-react";
import { usePurchases } from "@/hooks/queries/usePurchases";
import { PurchaseQueryParams, GiftFilterType } from "@/lib/api/types/purchase";
import { BundleProductsPopup } from "./bundle-products-popup";
import { GiftIndicator } from "../gift-indicator";
import { FilterDropdown } from "../filter-dropdown";

const years = ["All Years", "2025", "2024"];

// Gift ownership filter options
const ownershipOptions = [
  { value: "All", label: "All Purchases" },
  { value: "Owned", label: "My Purchases" },
  { value: "GivenByMe", label: "Gifted" },
  { value: "ReceivedByMe", label: "Received as gift" },
];

export function PurchaseHistory() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [sortBy, setSortBy] = useState<PurchaseQueryParams["sortBy"]>("Date");
  const [sortDirection, setSortDirection] =
    useState<PurchaseQueryParams["sortDirection"]>("Descending");
  const [giftFilter, setGiftFilter] = useState<GiftFilterType>("All");

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
      prev === "Ascending" ? "Descending" : "Ascending"
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
                  placeholder="Search bundles by name..."
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
                  ? "Ready to start your gaming journey? Check out our curated bundles and build your game library."
                  : giftFilter === "Gifted"
                    ? "When you give or receive gifts, they will appear here."
                    : giftFilter === "GivenByMe"
                      ? "Share the joy of gaming! Browse our bundles and send them as gifts to your friends."
                      : giftFilter === "ReceivedByMe"
                        ? "When someone sends you a bundle as a gift, it will appear here."
                        : "Ready to start your gaming journey? Check out our curated bundles and support amazing causes while building your game library."}
              </p>
              {giftFilter !== "ReceivedByMe" && (
                <Link href="/bundles">
                  <Button className="bg-linear-to-r from-primary to-primary/90">
                    Browse Bundles
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
                We couldn&apos;t find any bundles matching your search criteria.
                Try adjusting your filters or search term.
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
                        Bundle Name
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
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                      onClick={() => handleHeaderClick("CharityAmount")}
                    >
                      <div className="flex items-center gap-2">
                        Charity
                        {getSortIcon("CharityAmount")}
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase, index) => (
                    <motion.tr
                      key={purchase.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="transition-colors hover:bg-muted/5"
                    >
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div>
                            {purchase.snapshotTitle || "Unknown Bundle"}
                          </div>
                          <GiftIndicator
                            isGift={purchase.isGift}
                            giftedByCustomerName={purchase.giftedByCustomerName}
                            giftMessage={purchase.giftMessage}
                            giftedAt={purchase.giftedAt}
                            giftRecipientEmail={purchase.giftRecipientEmail}
                            giftRecipientName={purchase.giftRecipientName}
                            giftAccepted={purchase.giftAccepted}
                            giftAcceptedAt={purchase.giftAcceptedAt}
                            variant="compact"
                            cartItemId={purchase.id}
                            recipientEmail={
                              // For incoming gifts, use current user's email
                              purchase.giftedByCustomerName 
                                ? session?.user?.email || undefined
                                : purchase.giftRecipientEmail
                            }
                            onGiftAccepted={() => {
                              // Refresh the purchases list
                              window.location.reload();
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {purchase.completedAt
                          ? new Date(purchase.completedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {purchase.snapshotProducts.length}{" "}
                        {purchase.snapshotProducts.length === 1
                          ? "item"
                          : "items"}
                      </TableCell>
                      <TableCell>${purchase.price.toFixed(2)}</TableCell>
                      <TableCell>
                        ${purchase.charityAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <BundleProductsPopup purchase={purchase} />
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
