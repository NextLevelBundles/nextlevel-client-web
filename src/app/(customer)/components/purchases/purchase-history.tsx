"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/customer/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/customer/components/ui/select";
import { Input } from "@/customer/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/customer/components/ui/table";
import { Button } from "@/customer/components/ui/button";
import { Badge } from "@/customer/components/ui/badge";
import {
  CalendarIcon,
  TagIcon,
  SearchIcon,
  PackageIcon,
  XIcon,
  ExternalLinkIcon,
} from "lucide-react";

// Mock data - replace with actual data fetching
const purchaseHistory = [
  {
    id: 1,
    bundleName: "Indie Gems Bundle",
    purchaseDate: "2024-03-20",
    bundleSize: "5 Item Bundle",
    amountPaid: 25.0,
    keyStatus: "3 of 5 Keys Claimed",
    unclaimedKeys: 3,
  },
  {
    id: 2,
    bundleName: "Strategy Masters Collection",
    purchaseDate: "2024-03-15",
    bundleSize: "3 Item Bundle",
    amountPaid: 12.0,
    keyStatus: "3 of 3 Keys Claimed",
    unclaimedKeys: 0,
  },
  {
    id: 3,
    bundleName: "RPG Essentials Pack",
    purchaseDate: "2024-03-10",
    bundleSize: "Entire 8 Item Bundle",
    amountPaid: 30.0,
    keyStatus: "6 of 8 Keys Claimed",
    unclaimedKeys: 2,
  },
  {
    id: 4,
    bundleName: "Retro Gaming Bundle",
    purchaseDate: "2024-02-28",
    bundleSize: "3 Item Bundle",
    amountPaid: 15.0,
    keyStatus: "Refunded",
    unclaimedKeys: 0,
  },
];

const years = ["All Years", "2024", "2023", "2022"];
const keyStatuses = ["All Status", "All Claimed", "Some Unclaimed", "Refunded"];

export function PurchaseHistory() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedYear("All Years");
    setSelectedStatus("All Status");
  };

  const filteredPurchases = purchaseHistory.filter((purchase) => {
    const matchesSearch = purchase.bundleName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesYear =
      selectedYear === "All Years" ||
      purchase.purchaseDate.includes(selectedYear);
    const matchesStatus =
      selectedStatus === "All Status" || purchase.keyStatus === selectedStatus;

    return matchesSearch && matchesYear && matchesStatus;
  });

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case "3 of 3 Keys Claimed":
        return "default";
      case "3 of 5 Keys Claimed":
      case "6 of 8 Keys Claimed":
        return "secondary";
      case "Refunded":
        return "destructive";
      default:
        return "outline";
    }
  }

  return (
    <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
      <CardHeader>
        <CardTitle>Purchase History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bundles by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px] gap-2">
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
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px] gap-2">
              <TagIcon className="h-4 w-4" />
              <SelectValue placeholder="Key Status" />
            </SelectTrigger>
            <SelectContent className="bg-card">
              {keyStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {purchaseHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
          >
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <PackageIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No purchases yet</h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              Ready to start your gaming journey? Check out our curated bundles
              and support amazing causes while building your game library.
            </p>
            <Link href="/bundles">
              <Button className="bg-linear-to-r from-primary to-primary/90">
                Browse Bundles
              </Button>
            </Link>
          </motion.div>
        ) : filteredPurchases.length === 0 ? (
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
              We couldn&amp;t find any bundles matching your search criteria.
              Try adjusting your filters or search term.
            </p>
            <Button variant="outline" onClick={resetFilters} className="gap-2">
              <XIcon className="h-4 w-4" />
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <div className="rounded-lg border bg-card/30">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bundle Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Bundle Size</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase, index) => (
                  <motion.tr
                    key={purchase.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="transition-colors hover:bg-muted/5"
                  >
                    <TableCell className="font-medium">
                      {purchase.bundleName}
                    </TableCell>
                    <TableCell>
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{purchase.bundleSize}</TableCell>
                    <TableCell>${purchase.amountPaid.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(purchase.keyStatus)}
                      >
                        <motion.span layout>{purchase.keyStatus}</motion.span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          router.push(`/my-bundles/${purchase.id}`)
                        }
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                        View Bundle
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
