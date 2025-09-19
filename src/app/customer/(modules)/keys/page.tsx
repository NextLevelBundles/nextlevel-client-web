"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyIcon,
  ExternalLinkIcon,
  CopyIcon,
  GiftIcon,
  SearchIcon,
  XIcon,
  SparklesIcon,
  ArchiveIcon,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  X,
  Check,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import confetti from "canvas-confetti";
import {
  useSteamKeys,
  useRevealKey,
  useViewKey,
  useGiftKey,
  useSteamKeyStatusCounts,
  useSyncSteamLibrary,
} from "@/hooks/queries/useSteamKeys";
import {
  SteamKeyAssignment,
  SteamKeyQueryParams,
  GiftKeyRequest,
} from "@/lib/api/types/steam-key";
import { GiftFilterType } from "@/lib/api/types/purchase";
import { GiftKeyModal } from "@/customer/components/steam-keys/gift-key-modal";
import { ExchangeApi } from "@/lib/api/clients/exchange";
import { apiClient } from "@/lib/api/client-api";
import { FilterDropdown } from "@/customer/components/filter-dropdown";
import { SteamKeyGiftIndicator } from "@/customer/components/steam-keys/steam-key-gift-indicator";
import { useAuth } from "@/app/(shared)/providers/auth-provider";

// Progress levels and their requirements
const PROGRESS_LEVELS = [
  { level: 1, title: "Novice Collector", required: 0, icon: "🎮" },
  { level: 2, title: "Game Enthusiast", required: 5, icon: "🎯" },
  { level: 3, title: "Key Master", required: 10, icon: "🗝️" },
  { level: 4, title: "Steam Legend", required: 25, icon: "👑" },
];

// Gift ownership filter options
const ownershipOptions = [
  { value: "All", label: "All Keys" },
  { value: "Owned", label: "My Keys" },
  // { value: "Gifted", label: "All Gifts" },
  { value: "GivenByMe", label: "Gifted" },
  { value: "ReceivedByMe", label: "Received as gift" },
];

const copyMessages = [
  "🔑 You got it!",
  "📋 Locked and loaded.",
  "🚀 Ready to redeem!",
  "🗝️ Another one in your collection!",
];

function ExchangeCreditsDisplay({ credits }: { credits?: number | null }) {
  if (!credits) {
    return (
      <div className="flex flex-col items-end">
        <span className="text-xs text-muted-foreground">Trade-in Exchange</span>
        <span className="text-sm font-semibold text-muted-foreground">-</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <span className="text-xs text-muted-foreground">Trade-in Exchange</span>
      <span className="text-sm font-semibold text-primary">{credits} Credits</span>
    </div>
  );
}

export default function KeysPage() {
  const { user } = useAuth();
  const currentCustomerId = user?.id;
  const currentUserEmail = user?.email;
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [giftFilter, setGiftFilter] = useState<GiftFilterType>("All");
  const [selectedGiftKey, setSelectedGiftKey] =
    useState<SteamKeyAssignment | null>(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [redeemConfirmDialog, setRedeemConfirmDialog] = useState<{
    isOpen: boolean;
    keyId: string | null;
    productTitle: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    keyId: null,
    productTitle: "",
    isLoading: false,
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build query params
  const queryParams: SteamKeyQueryParams = {
    ...(debouncedSearchQuery && { searchQuery: debouncedSearchQuery }),
    ...(statusFilter !== "All" && {
      status: statusFilter as "Assigned" | "Revealed" | "Expired" | "Refunded",
    }),
    giftFilter,
  };

  // Fetch steam keys
  const {
    data: steamKeys = [],
    isLoading,
    isError,
    error,
  } = useSteamKeys(queryParams);

  // Reveal key mutation
  const revealKeyMutation = useRevealKey();

  // View key mutation
  const viewKeyMutation = useViewKey();

  // Gift key mutation
  const giftKeyMutation = useGiftKey();

  // Sync Steam library mutation
  const syncSteamLibraryMutation = useSyncSteamLibrary();

  // Fetch status counts
  const { data: statusCounts, isLoading: isLoadingStatusCounts } =
    useSteamKeyStatusCounts();

  // Transform status counts to filter options
  const statusOptions = React.useMemo(() => {
    if (!statusCounts) return [];
    return statusCounts.map((sc) => ({
      value: sc.status || "All",
      label: sc.label,
      count: sc.count,
    }));
  }, [statusCounts]);

  // Calculate ownership counts
  const ownershipOptionsWithCounts = React.useMemo(() => {
    return ownershipOptions.map((option) => ({
      ...option,
      count: steamKeys.filter((key) => {
        if (option.value === "All") return true;
        if (option.value === "Owned") return !key.isGift;
        if (option.value === "GivenByMe")
          // Outgoing gifts are gifts where current user is the customer who sent it
          return key.isGift && key.customerId === currentCustomerId;
        if (option.value === "ReceivedByMe")
          // Incoming gifts are gifts where current user is not the customer who sent it
          return key.isGift && key.customerId !== currentCustomerId;
        return false;
      }).length,
    }));
  }, [steamKeys, currentCustomerId]);

  // Calculate user's progress
  const revealedKeys = steamKeys.filter(
    (key) => key.status === "Revealed"
  ).length;
  const currentLevel = PROGRESS_LEVELS.reduce(
    (acc, level) => (revealedKeys >= level.required ? level : acc),
    PROGRESS_LEVELS[0]
  );

  const nextLevel = PROGRESS_LEVELS[PROGRESS_LEVELS.indexOf(currentLevel) + 1];
  console.log(nextLevel);

  // Helper function to check if a key is newly assigned (within 30 days)
  const isNewlyAssigned = (key: SteamKeyAssignment): boolean => {
    if (key.status !== "Assigned" || !key.assignedAt) return false;

    const assignedDate = dayjs(key.assignedAt);
    const thirtyDaysAgo = dayjs().subtract(30, "day");

    return assignedDate.isAfter(thirtyDaysAgo);
  };

  // Helper function to get the key value
  const getKeyValue = (key: SteamKeyAssignment): string | null => {
    return key.steamKeyValue || null;
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4F46E5", "#EC4899", "#10B981", "#F59E0B", "#6366F1"],
    });
  };

  const handleCopyKey = async (keyId: string) => {
    try {
      // Call API to get the key value
      const response = await viewKeyMutation.mutateAsync(keyId);

      if (response.steamKeyValue) {
        navigator.clipboard.writeText(response.steamKeyValue);
        const message =
          copyMessages[Math.floor(Math.random() * copyMessages.length)];

        // Create a small confetti burst for copy action
        confetti({
          particleCount: 20,
          spread: 30,
          origin: { y: 0.8 },
          colors: ["#4F46E5", "#10B981"],
          gravity: 0.5,
          scalar: 0.5,
          ticks: 50,
        });

        toast.success(message, {
          icon: (
            <motion.div
              initial={{ rotate: -20 }}
              animate={{ rotate: 20 }}
              transition={{ duration: 0.3, repeat: 3, repeatType: "reverse" }}
            >
              <SparklesIcon className="h-5 w-5 text-yellow-400" />
            </motion.div>
          ),
          duration: 2000,
        });
      } else {
        toast.error("Steam key not available");
      }
    } catch (error) {
      console.error("Error viewing key:", error);
    }
  };

  const handleRevealKey = (keyId: string, productTitle: string) => {
    setRedeemConfirmDialog({
      isOpen: true,
      keyId,
      productTitle,
      isLoading: false,
    });
  };

  const handleConfirmRedeem = async () => {
    if (!redeemConfirmDialog.keyId) return;

    setRedeemConfirmDialog((prev) => ({ ...prev, isLoading: true }));

    try {
      // Call the API to reveal the key
      const revealedKey = await revealKeyMutation.mutateAsync(
        redeemConfirmDialog.keyId
      );

      if (revealedKey.steamKeyValue) {
        // Close the dialog
        setRedeemConfirmDialog({
          isOpen: false,
          keyId: null,
          productTitle: "",
          isLoading: false,
        });

        // Open Steam registration page with the key
        window.open(
          `https://store.steampowered.com/account/registerkey?key=${revealedKey.steamKeyValue}`,
          "_blank"
        );

        // Trigger confetti
        triggerConfetti();

        toast.success("Steam key revealed! Redirecting to Steam...", {
          icon: (
            <motion.div
              initial={{ rotate: -20 }}
              animate={{ rotate: 20 }}
              transition={{ duration: 0.3, repeat: 3, repeatType: "reverse" }}
            >
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </motion.div>
          ),
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error revealing key:", error);
      setRedeemConfirmDialog((prev) => ({ ...prev, isLoading: false }));
      toast.error("Failed to reveal the key. Please try again.");
    }
  };

  // Dialog state for exchange confirmation
  const [exchangeDialog, setExchangeDialog] = useState<{
    isOpen: boolean;
    keyId: string | null;
    isLoading: boolean;
  }>({ isOpen: false, keyId: null, isLoading: false });

  const handleSendToVault = (assignmentId: string) => {
    setExchangeDialog({ isOpen: true, keyId: assignmentId, isLoading: false });
  }

  const handleExchangeConfirm = async () => {
    if (!exchangeDialog.keyId) return;
    setExchangeDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      const exchangeApi = new ExchangeApi(apiClient);
      const result = await exchangeApi.exchangeSteamKeyForCredits(
        exchangeDialog.keyId
      );
      if (result.success === true || typeof result.credits === "number") {
        toast.success(`Steam key exchanged for ${result.credits} credits!`);
      } else {
        toast.error("Exchange failed. Please try again.");
      }
    } catch {
      toast.error("Exchange failed. Please try again.");
    } finally {
      setExchangeDialog({ isOpen: false, keyId: null, isLoading: false });
    }
  };

  const handleActivateOnSteam = (key: string) => {
    // Open Steam registration page with the key
    window.open(
      `https://store.steampowered.com/account/registerkey?key=${key}`,
      "_blank"
    );
  };

  const handleGiftKey = (key: SteamKeyAssignment) => {
    setSelectedGiftKey(key);
    setIsGiftModalOpen(true);
  };

  const handleGiftSubmit = async (giftData: GiftKeyRequest) => {
    await giftKeyMutation.mutateAsync(giftData);
  };

  const handleRefreshSteamLibrary = () => {
    console.log("Button clicked, mutation state:", {
      isPending: syncSteamLibraryMutation?.isPending,
      isIdle: syncSteamLibraryMutation?.isIdle
    });
    
    syncSteamLibraryMutation?.mutate(undefined, {
      onSuccess: (result) => {
        console.log("Mutation success:", result);
        if (result.isSuccess && result.lastSyncedAt) {
          setLastSyncTime(result.lastSyncedAt);
        }
      },
      onError: (error) => {
        console.error("Mutation error:", error);
      }
    });
  };

  // Format sync time for display
  const formatSyncTime = (dateString: string) => {
    return dayjs(dateString).format("M/D h:mma") + " CT";
  };

  // Get button text based on state
  const getButtonText = () => {
    console.log("Button state check:", {
      isPending: syncSteamLibraryMutation?.isPending,
      isError: syncSteamLibraryMutation?.isError,
      isSuccess: syncSteamLibraryMutation?.isSuccess,
      lastSyncTime
    });
    
    if (syncSteamLibraryMutation?.isPending) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Refreshing...
        </>
      );
    }
    
    if (syncSteamLibraryMutation?.isError) {
      return (
        <>
          <X className="h-4 w-4" />
          Refresh failed - Try Again
        </>
      );
    }
    
    if (lastSyncTime && syncSteamLibraryMutation?.isSuccess) {
      return (
        <>
          <Check className="h-4 w-4" />
          Steam Library Refreshed {formatSyncTime(lastSyncTime)}
        </>
      );
    }
    
    return (
      <>
        <RefreshCw className="h-4 w-4" />
        Refresh Steam Library
      </>
    );
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Game Keys</h1>
        {/* <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <GameLevelProgress
              currentLevel={currentLevel}
              nextLevel={nextLevel}
              revealedKeys={revealedKeys}
              totalKeys={steamKeys.length}
            />
          </div>
        </div> */}
      </div>

      <Card className="bg-card border shadow-xs">
        <CardHeader className="pb-2">
          <h2 className="text-sm text-muted-foreground font-medium">Filters</h2>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {/* Search Filter */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3 lg:col-span-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Search
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by game title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>

            {/* Status Filter */}
            <FilterDropdown
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Statuses"
              searchPlaceholder="Search status..."
              isLoading={isLoadingStatusCounts}
              className="sm:col-span-1"
            />

            {/* Ownership Filter */}
            <FilterDropdown
              label="Ownership"
              options={ownershipOptionsWithCounts}
              value={giftFilter}
              onChange={(value) => setGiftFilter(value as GiftFilterType)}
              placeholder="All Keys"
              searchPlaceholder="Search ownership..."
              showCounts={false}
              className="sm:col-span-1"
            />
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || statusFilter !== "All" || giftFilter !== "All") && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setGiftFilter("All");
                }}
                className="gap-2"
              >
                <XIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-card to-card/95 dark:from-[#1a1d2e] dark:to-[#1a1d2e]/95 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Available Keys
              {steamKeys.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  &nbsp; ({steamKeys.length} found)
                </span>
              )}
            </CardTitle>
            <button
              onClick={handleRefreshSteamLibrary}
              disabled={syncSteamLibraryMutation?.isPending}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors ${
                syncSteamLibraryMutation?.isPending
                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  : syncSteamLibraryMutation?.isError
                  ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                  : lastSyncTime && syncSteamLibraryMutation?.isSuccess
                  ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {getButtonText()}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">
                Loading your game keys...
              </p>
            </div>
          ) : isError ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
            >
              <div className="mb-4 rounded-full bg-red-100 p-3">
                <KeyIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Error loading keys</h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "Something went wrong"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-linear-to-r from-primary to-primary/90"
              >
                Try Again
              </Button>
            </motion.div>
          ) : steamKeys.length === 0 &&
            !debouncedSearchQuery &&
            statusFilter === "All" ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                {giftFilter === "ReceivedByMe" ? (
                  <GiftIcon className="h-8 w-8 text-primary" />
                ) : giftFilter === "GivenByMe" ? (
                  <ExternalLinkIcon className="h-8 w-8 text-primary" />
                ) : giftFilter === "Gifted" ? (
                  <GiftIcon className="h-8 w-8 text-primary" />
                ) : (
                  <KeyIcon className="h-8 w-8 text-primary" />
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {giftFilter === "Owned"
                  ? "No personal keys yet"
                  : giftFilter === "Gifted"
                    ? "No gift keys yet"
                    : giftFilter === "GivenByMe"
                      ? "No keys gifted yet"
                      : giftFilter === "ReceivedByMe"
                        ? "No gift keys received yet"
                        : "No game keys yet"}
              </h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                {giftFilter === "Owned"
                  ? "Purchase a bundle to get started with your personal game collection!"
                  : giftFilter === "Gifted"
                    ? "When you give or receive gift keys, they'll appear here."
                    : giftFilter === "GivenByMe"
                      ? "When you gift game keys to others, they'll appear here."
                      : giftFilter === "ReceivedByMe"
                        ? "When someone gifts you game keys, they'll appear here."
                        : "Purchase a bundle to get started with your game collection!"}
              </p>
              {giftFilter !== "ReceivedByMe" && (
                <Link href="/bundles">
                  <Button className="bg-linear-to-r from-primary to-primary/90">
                    Browse Bundles
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : steamKeys.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
            >
              <div className="mb-4 rounded-full bg-secondary/10 p-3">
                <SearchIcon className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No results found</h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                We couldn&apos;t find any keys matching your search criteria.
                Try adjusting your filters or search term.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
                  setStatusFilter("All");
                  setGiftFilter("All");
                }}
                className="gap-2"
              >
                <XIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {steamKeys.map((key) => (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="relative flex flex-col gap-4 rounded-lg border bg-card/30 p-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-200 hover:bg-card/50 hover:shadow-lg dark:hover:bg-[#1d2233]/60 dark:hover:shadow-blue-500/5"
                >
                  <div className="flex gap-4 flex-1">
                    {/* Product Cover Image - 2:3 aspect ratio */}
                    <div className="flex-shrink-0">
                      <div className="h-20 aspect-[2/3]">
                        <img
                          src={
                            key.productCoverImage?.url ||
                            "https://static.digiphile.co/product-placeholder-image.jpg"
                          }
                          alt={key.productTitle || "Product"}
                          className="w-full h-full object-cover rounded-lg shadow-md"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{key.productTitle}</h3>
                        {isNewlyAssigned(key) && (
                          <Badge
                            variant="outline"
                            className="animate-subtle-pulse bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                          >
                            <SparklesIcon className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                        )}
                        {key.isGift && (
                          <SteamKeyGiftIndicator
                            steamKey={key}
                            currentCustomerId={currentCustomerId}
                            currentUserEmail={currentUserEmail || undefined}
                            onGiftAccepted={() => {
                              window.location.reload();
                            }}
                          />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Assigned on{" "}
                          {key.assignedAt
                            ? new Date(key.assignedAt).toLocaleDateString()
                            : "Unknown"}
                          {key.status === "Assigned" && key.expiresAt && (
                            <>
                              {" "}
                              • Expires on{" "}
                              {new Date(key.expiresAt).toLocaleDateString()}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {key.status === "Revealed" ? (
                      <>
                        <code className="rounded bg-muted/10 px-2 py-1 font-mono text-muted-foreground">
                          {getKeyValue(key)}
                        </code>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 transition-all duration-200"
                                  onClick={() => handleCopyKey(key.id)}
                                >
                                  <CopyIcon className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>Copy key</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    ) : key.status === "Assigned" ? (
                      <>
                        {/* Only show buttons if:
                            1. Key is not a gift, OR
                            2. Key is a received gift that has been accepted */}
                        {(!key.isGift ||
                          (key.isGift &&
                            key.customerId !== currentCustomerId &&
                            key.giftAccepted === true)) && (
                          <>
                            {/* Redeem on Steam button - enabled only if isExisting is false */}
                            <motion.div
                              whileHover={{ scale: key.isExisting ? 1 : 1.05 }}
                              whileTap={{ scale: key.isExisting ? 1 : 0.95 }}
                            >
                              <Button
                                className={`cursor-pointer gap-2 ${
                                  key.isExisting 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'bg-linear-to-r from-primary to-primary/90 dark:ring-1 dark:ring-blue-400/30 dark:hover:ring-blue-500/60'
                                }`}
                                disabled={key.isExisting}
                                onClick={() =>
                                  !key.isExisting && handleRevealKey(key.id, key.productTitle)
                                }
                              >
                                <ExternalLinkIcon className="h-4 w-4" />
                                {key.isExisting ? "CONGRATS! You already own this title" : "Redeem on Steam"}
                              </Button>
                            </motion.div>
                          </>
                        )}
                        {!key.isGift && (
                          <>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileTap={{ scale: 0.95 }}>
                                    <Button
                                      variant="outline"
                                      className="gap-2"
                                      onClick={() => handleGiftKey(key)}
                                    >
                                      <GiftIcon className="h-4 w-4" />
                                      Gift
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Gift this game to someone
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <motion.div whileTap={{ scale: key.isExisting ? 0.95 : 1 }}>
                                      <Button
                                        variant="outline"
                                        className={`gap-2 ${
                                          !key.isExisting 
                                            ? 'opacity-50 cursor-not-allowed' 
                                            : ''
                                        }`}
                                        disabled={!key.isExisting}
                                        onClick={() =>
                                          key.isExisting && handleSendToVault(key.id)
                                        }
                                      >
                                        <ArchiveIcon className="h-4 w-4" />
                                        {!key.isExisting ? "CONGRATS! You can now redeem this title" : "Add to Exchange"}
                                      </Button>
                                    </motion.div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {key.isExisting 
                                      ? "Exchange this key for credits"
                                      : "This game is not in your Steam library yet"
                                    }
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <ExchangeCreditsDisplay credits={key.exchangeCredits} />
                            </div>
                            {/* Exchange Confirmation Dialog */}
                            <Dialog
                              open={exchangeDialog.isOpen}
                              onOpenChange={(open) =>
                                setExchangeDialog((prev) => ({
                                  ...prev,
                                  isOpen: open,
                                }))
                              }
                            >
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Exchange Steam Key?</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to exchange this Steam
                                    key for credits? This action cannot be
                                    undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      setExchangeDialog({
                                        isOpen: false,
                                        keyId: null,
                                        isLoading: false,
                                      })
                                    }
                                    disabled={exchangeDialog.isLoading}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleExchangeConfirm}
                                    disabled={exchangeDialog.isLoading}
                                  >
                                    {exchangeDialog.isLoading ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      "Continue"
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </>
                    ) : key.isGift && key.giftAccepted === null ? (
                      <Badge variant="secondary" className="gap-1">
                        <GiftIcon className="h-3 w-3" />
                        Awaiting acceptance
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        {key.status}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGiftKey && (
        <GiftKeyModal
          steamKey={selectedGiftKey}
          isOpen={isGiftModalOpen}
          onClose={() => {
            setIsGiftModalOpen(false);
            setSelectedGiftKey(null);
          }}
          onGift={handleGiftSubmit}
        />
      )}

      {/* Redeem Confirmation Dialog */}
      <Dialog
        open={redeemConfirmDialog.isOpen}
        onOpenChange={(open) => {
          if (!redeemConfirmDialog.isLoading) {
            setRedeemConfirmDialog((prev) => ({ ...prev, isOpen: open }));
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {!redeemConfirmDialog.isLoading ? (
            <>
              <DialogHeader className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <ShieldAlert className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <DialogTitle className="text-center text-xl font-semibold">
                  Important: Refund Policy Notice
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-sm">
                    <strong>Please note:</strong> Once you reveal and redeem
                    this Steam key, the entire bundle containing this game
                    becomes <strong>non-refundable</strong>.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>You're about to reveal the Steam key for:</p>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="font-medium text-foreground">
                      {redeemConfirmDialog.productTitle}
                    </p>
                  </div>
                  <p className="text-xs">
                    By proceeding, you acknowledge that:
                  </p>
                  <ul className="space-y-1 text-xs list-disc list-inside">
                    <li>The Steam key will be permanently revealed</li>
                    <li>The bundle containing this key cannot be refunded</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setRedeemConfirmDialog({
                      isOpen: false,
                      keyId: null,
                      productTitle: "",
                      isLoading: false,
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  className="bg-linear-to-r from-primary to-primary/90"
                  onClick={handleConfirmRedeem}
                >
                  <KeyIcon className="h-4 w-4 mr-2" />I Understand, Reveal Key
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <KeyIcon className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-lg font-medium">
                  Revealing your Steam key...
                </p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we process your request
                </p>
              </div>
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.span
                  className="h-2 w-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="h-2 w-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                  className="h-2 w-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </motion.div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
