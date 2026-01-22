"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  ChevronRightIcon,
  PackageIcon,
  Gift,
  EyeIcon,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import Link from "next/link";
import { useRecentPurchases } from "@/hooks/queries/usePurchases";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { BundleProductsPopup } from "@/customer/components/purchases/collection-products-popup";
import { CartItem } from "@/lib/api/types/cart";
import { isUpgradeAvailable, getTimeRemaining } from "@/shared/utils/cart";

function RecentPurchaseRow({ purchase, index }: { purchase: CartItem; index: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const upgradeAvailable = isUpgradeAvailable(purchase);

  return (
    <>
      <motion.div
        key={purchase.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        className="group flex items-center justify-between rounded-lg border p-4 transition-all duration-200 hover:bg-muted/5 dark:hover:bg-[#1d2233]/60 dark:hover:shadow-xs"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="font-medium">
              {purchase.snapshotTitle || "Unknown Collection"}
            </p>
            {purchase.isGift && (
              <Badge variant="secondary" className="gap-1">
                <Gift className="h-3 w-3" />
                Gift
              </Badge>
            )}
            {upgradeAvailable && purchase.upgradeTo && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-secondary animate-pulse" />
                <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                  Upgrade Available · {getTimeRemaining(purchase.upgradeTo)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {purchase.completedAt
                ? new Date(purchase.completedAt).toLocaleDateString()
                : "Processing"}
            </span>
            <span>•</span>
            <span>${purchase.totalAmount.toFixed(2)}</span>
            <span>•</span>
            <span>{purchase.snapshotProducts.length} items</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <EyeIcon className="h-4 w-4" />
          View
        </Button>
      </motion.div>
      <BundleProductsPopup
        purchase={purchase}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export function RecentBundles() {
  const { data: recentPurchases = [], isLoading, isError } = useRecentPurchases();

  if (isLoading) {
    return (
      <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
        <CardHeader>
          <div>
            <CardTitle>Recent Purchases</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your last 5 purchases from the past 30 days
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
        <CardHeader>
          <div>
            <CardTitle>Recent Purchases</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your last 5 purchases from the past 30 days
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            Failed to load recent purchases
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Purchases</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Your last 5 purchases from the past 30 days
          </p>
        </div>
        {recentPurchases.length > 0 && (
          <Link href="/customer/purchases">
            <Button variant="ghost" size="sm" className="text-xs">
              View All
              <ChevronRightIcon className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        )}
      </CardHeader>
      {recentPurchases.length === 0 ? (
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
          >
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <PackageIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No purchases yet</h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              Start your gaming journey by exploring our curated collections. Every
              purchase supports amazing causes!
            </p>
            <Link href="/collections">
              <Button className="bg-linear-to-r from-primary to-primary/90">
                Browse Collections
              </Button>
            </Link>
          </motion.div>
        </CardContent>
      ) : (
        <CardContent className="max-h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {recentPurchases.map((purchase, index) => (
              <RecentPurchaseRow key={purchase.id} purchase={purchase} index={index} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
