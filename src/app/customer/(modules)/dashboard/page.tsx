"use client";

import {
  PackageIcon,
  KeyIcon,
  HeartIcon,
  DollarSignIcon,
  XCircleIcon,
  AlertCircleIcon,
  CalendarIcon,
  PiggyBankIcon,
} from "lucide-react";
import { QuickActions } from "@/customer/components/dashboard/quick-actions";
import { RecentBundles } from "@/customer/components/dashboard/recent-bundles";
import { StatsCard } from "@/customer/components/dashboard/stats-card";
import { SteamStatus } from "@/customer/components/dashboard/steam-status";
import { useDashboardData } from "@/hooks/queries/useDashboard";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Home() {
  const { data: dashboardData, isLoading, isError, error } = useDashboardData();

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date to show member since
  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-80" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>

        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Hey there, welcome back! 👋</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
        >
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <PackageIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            Error loading dashboard
          </h3>
          <p className="mb-6 max-w-md text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Something went wrong loading your dashboard"}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hey there, welcome back! 👋</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Member Since"
          value={
            dashboardData?.memberSince
              ? formatMemberSince(dashboardData.memberSince)
              : "N/A"
          }
          icon={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Keys Assigned"
          value={dashboardData?.totalKeysAssigned.toString() || "0"}
          icon={<PackageIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Keys Revealed"
          value={dashboardData?.totalKeysRevealed.toString() || "0"}
          icon={<KeyIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Keys Refunded"
          value={dashboardData?.totalKeysRefunded.toString() || "0"}
          icon={<XCircleIcon className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Keys Expired"
          value={dashboardData?.totalKeysExpired.toString() || "0"}
          icon={<AlertCircleIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Spent"
          value={formatCurrency(dashboardData?.totalSpent || 0)}
          icon={<DollarSignIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Donated to Charity"
          value={formatCurrency(dashboardData?.totalDonatedToCharity || 0)}
          icon={<HeartIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Saved"
          value={formatCurrency(dashboardData?.totalSaved || 0)}
          icon={<PiggyBankIcon className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SteamStatus />
        <QuickActions />
      </div>

      <RecentBundles />
    </div>
  );
}
