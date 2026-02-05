"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { motion } from "framer-motion";
import {
  KeyIcon,
  ExternalLinkIcon,
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
  Info,
  Copy,
  Mail,
  Clock,
  AlertCircle,
  RotateCcw,
  DollarSign,
  Package,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
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
import { useQueryClient } from "@tanstack/react-query";
import {
  useSteamKeys,
  useRevealKey,
  useViewKey,
  useGiftKey,
  useSteamKeyStatusCounts,
  useSyncSteamLibrary,
  useSteamLibraryStatus,
} from "@/hooks/queries/useSteamKeys";
import {
  useResendSteamKeyGiftEmail,
  useResendPurchaseGiftEmail,
} from "@/hooks/queries/useGifts";
import {
  SteamKeyAssignment,
  SteamKeyQueryParams,
  SteamKeyStatus,
  GiftKeyRequest,
  BundleExchangeInfo,
} from "@/lib/api/types/steam-key";
import { GiftFilterType } from "@/lib/api/types/purchase";
import { GiftKeyModal } from "@/customer/components/steam-keys/gift-key-modal";
import { ExchangeApi } from "@/lib/api/clients/exchange";
import { SteamKeyApi } from "@/lib/api/clients/steam-key";
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

// Component for expiring label with hover popover
function ExpiringLabel({ daysLeft }: { daysLeft: number }) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded-full hover:bg-orange-200 dark:hover:bg-orange-950/60 transition-colors cursor-help"
          onMouseEnter={() => setIsPopoverOpen(true)}
          onMouseLeave={() => setIsPopoverOpen(false)}
        >
          <Clock className="h-3 w-3 animate-pulse" />
          Expiring Soon · {daysLeft} {daysLeft === 1 ? "day" : "days"} left
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        onMouseEnter={() => setIsPopoverOpen(true)}
        onMouseLeave={() => setIsPopoverOpen(false)}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm mb-1">
                Steam Key Expiring Soon
              </h4>
              <p className="text-sm text-muted-foreground">
                This Steam key is approaching its expiration deadline. You must
                redeem and activate it before it expires.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 space-y-2 text-xs">
            <p className="font-medium text-foreground">
              What happens when a key expires?
            </p>
            <p className="text-muted-foreground">
              Once expired, the key gets added to the exchange and cannot be
              activated on Steam.
            </p>
            <div className="pt-2 border-t border-border mt-2">
              <p className="font-medium text-foreground mb-1.5">
                Actions you can take before expiration:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-1">
                <li className="flex items-start gap-2">
                  <KeyIcon className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>
                    <strong>Redeem on Steam:</strong> Reveal the key and activate it on your Steam account to keep the game permanently in your library
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <GiftIcon className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>
                    <strong>Gift:</strong> Send the key to someone else who can redeem it on their Steam account before it expires
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ExternalLinkIcon className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>
                    <strong>Add to Exchange:</strong> Manually exchange the key for credits before it expires, which you can use to get different games
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Function to convert technical status names to user-friendly ones
const getStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    AddedToExchange: "Exchanged",
    ReceivedFromExchange: "Received",
    Assigned: "Available",
    Revealed: "Redeemed",
    Expired: "Returned",
    Refunded: "Refunded",
    Revoked: "Revoked",
    GiftAccepted: "Gift Accepted",
  };

  return statusMap[status] || status;
};

function ExchangeCreditsDisplay({ credits }: { credits?: number | null }) {
  if (!credits || credits === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-end">
      <span className="text-xs text-muted-foreground">Trade-in Exchange</span>
      <span className="text-sm font-semibold text-primary">
        {credits} Credits
      </span>
    </div>
  );
}

export default function KeysPage() {
  const { user } = useAuth();
  const currentCustomerId = user?.customerId;
  const currentUserEmail = user?.email;
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [giftFilter, setGiftFilter] = useState<GiftFilterType>("All");
  const [selectedGiftKey, setSelectedGiftKey] =
    useState<SteamKeyAssignment | null>(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  const [showSteamPrivacyHelp, setShowSteamPrivacyHelp] = useState(false);
  const [viewingKeyId, setViewingKeyId] = useState<string | null>(null);
  const [resendingKeyId, setResendingKeyId] = useState<string | null>(null);
  const [viewKeyDialog, setViewKeyDialog] = useState<{
    isOpen: boolean;
    keyValue: string | null;
    gameTitle: string;
    coverImageUrl: string | null;
  }>({
    isOpen: false,
    keyValue: null,
    gameTitle: "",
    coverImageUrl: null,
  });
  const [redeemConfirmDialog, setRedeemConfirmDialog] = useState<{
    isOpen: boolean;
    keyId: string | null;
    productTitle: string;
    isLoading: boolean;
    alreadyOwned?: boolean;
  }>({
    isOpen: false,
    keyId: null,
    productTitle: "",
    isLoading: false,
    alreadyOwned: false,
  });

  const [steamSyncWarningDialog, setSteamSyncWarningDialog] = useState<{
    isOpen: boolean;
    keyId: string | null;
    productTitle: string;
  }>({
    isOpen: false,
    keyId: null,
    productTitle: "",
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
      status: statusFilter as SteamKeyStatus,
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

  // Resend gift email mutations
  const resendSteamKeyGiftMutation = useResendSteamKeyGiftEmail();
  const resendPurchaseGiftMutation = useResendPurchaseGiftEmail();

  // Sync Steam library mutation
  const syncSteamLibraryMutation = useSyncSteamLibrary();

  // Fetch status counts
  const { data: statusCounts, isLoading: isLoadingStatusCounts } =
    useSteamKeyStatusCounts();

  // Fetch Steam library status
  const { data: steamLibraryStatus } = useSteamLibraryStatus();

  // Initialize lastSyncTime based on Steam library status
  useEffect(() => {
    if (steamLibraryStatus?.lastSyncedAt && !lastSyncTime) {
      setLastSyncTime(steamLibraryStatus.lastSyncedAt);
    }
  }, [steamLibraryStatus, lastSyncTime]);

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
          // Outgoing gifts are gifts where current user is the gifter (giftedByCustomerId matches currentCustomerId)
          return key.isGift && key.giftedByCustomerId === currentCustomerId;
        if (option.value === "ReceivedByMe")
          // Incoming gifts are gifts where current user is not the gifter (giftedByCustomerId does not match currentCustomerId)
          return key.isGift && key.giftedByCustomerId !== currentCustomerId;
        return false;
      }).length,
    }));
  }, [steamKeys, currentCustomerId]);

  // Calculate user's progress
  const revealedKeys = steamKeys.filter(
    (key) => key.status === SteamKeyStatus.Revealed,
  ).length;
  const currentLevel = PROGRESS_LEVELS.reduce(
    (acc, level) => (revealedKeys >= level.required ? level : acc),
    PROGRESS_LEVELS[0],
  );

  const nextLevel = PROGRESS_LEVELS[PROGRESS_LEVELS.indexOf(currentLevel) + 1];
  console.log(nextLevel);

  // Helper function to check if a key is newly assigned (within 7 days and status is Assigned)
  const isNewlyAssigned = (key: SteamKeyAssignment): boolean => {
    if (key.status !== SteamKeyStatus.Assigned || !key.assignedAt) return false;

    const assignedDate = dayjs(key.assignedAt);
    const sevenDaysAgo = dayjs().subtract(7, "day");

    return assignedDate.isAfter(sevenDaysAgo);
  };

  // Helper function to check if gift was returned (not accepted in time)
  const isGiftExpired = (key: SteamKeyAssignment): boolean => {
    // Gift is returned if it was not accepted (giftAccepted == false)
    return key.giftAccepted === false;
  };

  // Helper function to check if key is expiring soon (less than 30 days)
  const isExpiringSoon = (
    key: SteamKeyAssignment,
  ): { isExpiring: boolean; daysLeft: number } => {
    if (key.status !== SteamKeyStatus.Assigned || !key.expiresAt) {
      return { isExpiring: false, daysLeft: 0 };
    }

    const now = new Date();
    const expiryDate = new Date(key.expiresAt);
    const diffMs = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Expiring if less than 30 days and key is not yet expired
    return { isExpiring: daysLeft >= 0 && daysLeft < 30, daysLeft };
  };

  // Helper function to check if Steam library sync is needed
  const isSteamSyncNeeded = (): boolean => {
    console.log("Checking sync status:", steamLibraryStatus);

    // If no sync status data available, assume sync is needed
    if (!steamLibraryStatus) return true;

    // If never synced, sync is needed
    if (
      !steamLibraryStatus.lastSyncedAt ||
      steamLibraryStatus.steamLibrarySyncStatus === "NeverSynced"
    )
      return true;

    // If last sync was unsuccessful, sync is needed
    if (steamLibraryStatus.steamLibrarySyncStatus !== "SyncSucceeded")
      return true;

    // Check if last sync was more than 1 week ago
    const lastSyncDate = dayjs(steamLibraryStatus.lastSyncedAt);
    const oneWeekAgo = dayjs().subtract(1, "week");

    const isOlderThanWeek = lastSyncDate.isBefore(oneWeekAgo);
    console.log("Sync date check:", {
      lastSyncDate: lastSyncDate.format(),
      oneWeekAgo: oneWeekAgo.format(),
      isOlderThanWeek,
    });

    return isOlderThanWeek;
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

  const handleViewKey = async (
    keyId: string,
    gameTitle: string,
    coverImageUrl: string | null,
  ) => {
    setViewingKeyId(keyId);
    try {
      // Call API to get the key value
      const response = await viewKeyMutation.mutateAsync(keyId);

      if (response.steamKeyValue) {
        // Show dialog with the key
        setViewKeyDialog({
          isOpen: true,
          keyValue: response.steamKeyValue,
          gameTitle: gameTitle,
          coverImageUrl: coverImageUrl,
        });
      } else {
        toast.error("Steam key not available");
      }
    } catch (error) {
      console.error("Error viewing key:", error);
      toast.error("Failed to retrieve key. Please try again.");
    } finally {
      setViewingKeyId(null);
    }
  };

  const handleCopyKey = async (keyValue: string) => {
    try {
      await navigator.clipboard.writeText(keyValue);
      toast.success("Steam key copied to clipboard!", {
        icon: <Copy className="h-5 w-5" />,
        duration: 2000,
      });
    } catch (error) {
      console.error("Error copying key:", error);
      toast.error("Failed to copy key. Please try again.");
    }
  };

  const handleResendGiftEmail = async (key: SteamKeyAssignment) => {
    setResendingKeyId(key.id);
    try {
      if (key.isPurchaseGift) {
        // Purchase gift - use cartItemId
        await resendPurchaseGiftMutation.mutateAsync(key.id);
      } else {
        // Individual gift - use assignmentId
        await resendSteamKeyGiftMutation.mutateAsync(key.id);
      }
    } catch (error) {
      console.error("Error resending gift email:", error);
    } finally {
      setResendingKeyId(null);
    }
  };

  const handleRevealKey = (keyId: string, productTitle: string) => {
    // Find the key to check if already owned
    const key = steamKeys.find((k) => k.id === keyId);
    const alreadyOwned = key?.alreadyOwnedOnSteam || false;

    console.log("Key found:", key);
    console.log("Already owned:", alreadyOwned);

    // Check if Steam library sync is needed
    if (isSteamSyncNeeded()) {
      setSteamSyncWarningDialog({
        isOpen: true,
        keyId,
        productTitle,
      });
      return;
    }

    // Always proceed to confirmation dialog (don't skip it)
    setRedeemConfirmDialog({
      isOpen: true,
      keyId,
      productTitle,
      isLoading: false,
      alreadyOwned,
    });
  };

  const handleConfirmRedeem = async () => {
    if (!redeemConfirmDialog.keyId) return;

    setRedeemConfirmDialog((prev) => ({ ...prev, isLoading: true }));

    try {
      // Call the API to reveal the key
      const revealedKey = await revealKeyMutation.mutateAsync(
        redeemConfirmDialog.keyId,
      );

      if (revealedKey.steamKeyValue) {
        // Close the dialog
        setRedeemConfirmDialog({
          isOpen: false,
          keyId: null,
          productTitle: "",
          isLoading: false,
          alreadyOwned: false,
        });

        // Open Steam registration page with the key
        window.open(
          `https://store.steampowered.com/account/registerkey?key=${revealedKey.steamKeyValue}`,
          "_blank",
        );

        // Trigger confetti
        triggerConfetti();

        toast.success("Steam key redeemed! Redirecting to Steam...", {
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
      toast.error("Failed to redeem the key. Please try again.");
    }
  };

  // Bundle exchange limit (hardcoded for now)
  const BUNDLE_EXCHANGE_LIMIT = 3;

  // Dialog state for exchange confirmation
  const [exchangeDialog, setExchangeDialog] = useState<{
    isOpen: boolean;
    keyId: string | null;
    gameName: string | null;
    isLoading: boolean;
    isFetchingBundleInfo: boolean;
    bundleInfo: BundleExchangeInfo | null;
  }>({
    isOpen: false,
    keyId: null,
    gameName: null,
    isLoading: false,
    isFetchingBundleInfo: false,
    bundleInfo: null,
  });

  const handleSendToVault = async (assignmentId: string, gameName: string) => {
    setExchangeDialog({
      isOpen: true,
      keyId: assignmentId,
      gameName,
      isLoading: false,
      isFetchingBundleInfo: true,
      bundleInfo: null,
    });

    try {
      const steamKeyApi = new SteamKeyApi(apiClient);
      const bundleInfo = await steamKeyApi.getBundleExchangeInfo(assignmentId);
      setExchangeDialog((prev) => ({
        ...prev,
        isFetchingBundleInfo: false,
        bundleInfo,
      }));
    } catch {
      // If fetching bundle info fails, continue without it
      setExchangeDialog((prev) => ({
        ...prev,
        isFetchingBundleInfo: false,
        bundleInfo: null,
      }));
    }
  };

  const handleExchangeConfirm = async () => {
    if (!exchangeDialog.keyId) return;
    setExchangeDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      const exchangeApi = new ExchangeApi(apiClient);
      const result = await exchangeApi.exchangeSteamKeyForCredits(
        exchangeDialog.keyId,
      );
      if (result.success === true || typeof result.credits === "number") {
        toast.success(`Steam key exchanged for ${result.credits} credits!`);
        // Invalidate queries to refresh the keys data and user credits
        queryClient.invalidateQueries({ queryKey: ["steam-keys"] });
        queryClient.invalidateQueries({
          queryKey: ["steam-keys", "status-counts"],
        });
        queryClient.invalidateQueries({ queryKey: ["user-credits"] });
      } else {
        toast.error("Exchange failed. Please try again.");
      }
    } catch {
      toast.error("Exchange failed. Please try again.");
    } finally {
      setExchangeDialog({
        isOpen: false,
        keyId: null,
        gameName: null,
        isLoading: false,
        isFetchingBundleInfo: false,
        bundleInfo: null,
      });
    }
  };

  const handleGiftKey = (key: SteamKeyAssignment) => {
    setSelectedGiftKey(key);
    setIsGiftModalOpen(true);
  };

  const handleGiftSubmit = async (giftData: GiftKeyRequest) => {
    await giftKeyMutation.mutateAsync(giftData);
  };

  const handleSyncWarningRefresh = () => {
    // Close the warning dialog
    setSteamSyncWarningDialog({
      isOpen: false,
      keyId: null,
      productTitle: "",
    });

    // Trigger Steam library refresh
    handleRefreshSteamLibrary();
  };

  const handleSyncWarningProceed = () => {
    const keyId = steamSyncWarningDialog.keyId;
    const productTitle = steamSyncWarningDialog.productTitle;

    // Close the warning dialog
    setSteamSyncWarningDialog({
      isOpen: false,
      keyId: null,
      productTitle: "",
    });

    // Proceed with normal redeem flow
    if (keyId && productTitle) {
      // Find the key to check if already owned
      const key = steamKeys.find((k) => k.id === keyId);
      const alreadyOwned = key?.alreadyOwnedOnSteam || false;

      setRedeemConfirmDialog({
        isOpen: true,
        keyId,
        productTitle,
        isLoading: false,
        alreadyOwned,
      });
    }
  };

  const handleRefreshSteamLibrary = () => {
    console.log("Button clicked, mutation state:", {
      isPending: syncSteamLibraryMutation?.isPending,
      isIdle: syncSteamLibraryMutation?.isIdle,
    });

    // Clear any previous error message
    setSyncErrorMessage(null);

    syncSteamLibraryMutation?.mutate(undefined, {
      onSuccess: (result) => {
        console.log("Mutation success:", result);
        if (
          result.steamLibrarySyncStatus === "SyncSucceeded" &&
          result.lastSyncedAt
        ) {
          setLastSyncTime(result.lastSyncedAt);
          setSyncErrorMessage(null);
        } else if (result.steamLibrarySyncStatus === "SyncFailed") {
          setSyncErrorMessage("profile-private");
        } else if (result.steamLibrarySyncStatus === "SyncError") {
          setSyncErrorMessage(
            "Technical error occurred while syncing. Please try again later.",
          );
        }
      },
      onError: (error) => {
        console.error("Mutation error:", error);
        setSyncErrorMessage(
          "Failed to connect to Steam. Please try again later.",
        );
      },
    });
  };

  // Format sync time for display
  const formatSyncTime = (dateString: string) => {
    return dayjs(dateString).fromNow();
  };

  // Get tooltip text based on sync status
  const getSyncTooltipText = () => {
    if (syncSteamLibraryMutation?.isPending) {
      return "Syncing your Steam library. This may take a few moments...";
    }

    const syncStatus = steamLibraryStatus?.steamLibrarySyncStatus;
    const syncTime = lastSyncTime || steamLibraryStatus?.lastSyncedAt;

    switch (syncStatus) {
      case "SyncSucceeded":
        return syncTime
          ? `Last synced ${formatSyncTime(syncTime)}. Click to sync again.`
          : "Steam library synced successfully. Click to sync again.";

      case "SyncFailed":
        return syncErrorMessage === "profile-private"
          ? "Sync failed: Your Steam profile is not public. Please make your profile and game details public, then try again."
          : syncTime
            ? `Last sync failed ${formatSyncTime(syncTime)}. This usually happens when your Steam profile is private. Click to retry.`
            : "Sync failed. This usually happens when your Steam profile is private. Click to retry.";

      case "SyncError":
        return syncTime
          ? `Technical error occurred ${formatSyncTime(syncTime)}. This could be due to network issues or Steam API problems. Click to retry.`
          : "Technical error occurred while syncing. This could be due to network issues or Steam API problems. Click to retry.";

      case "NeverSynced":
      default:
        return "Sync your Steam library to unlock exchange options for games you already own and get better recommendations.";
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Steam Game Keys</h1>
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
            {steamKeys.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRefreshSteamLibrary}
                  disabled={syncSteamLibraryMutation?.isPending}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {syncSteamLibraryMutation?.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Sync Steam Library
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-muted-foreground/30 hover:border-muted-foreground/60 cursor-help transition-colors">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{getSyncTooltipText()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
          {/* Sync Error Message */}
          {syncErrorMessage && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {syncErrorMessage === "profile-private" ? (
                    <>
                      Your Steam profile is not public. Unable to sync your
                      Steam library.{" "}
                      <button
                        onClick={() => setShowSteamPrivacyHelp(true)}
                        className="text-red-800 dark:text-red-200 underline hover:no-underline font-medium"
                      >
                        Learn more
                      </button>
                    </>
                  ) : (
                    syncErrorMessage
                  )}
                </p>
              </div>
            </div>
          )}
          {/* Never Synced Message */}
          {steamKeys.length > 0 &&
            steamLibraryStatus?.steamLibrarySyncStatus === "NeverSynced" &&
            !syncErrorMessage && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Sync your Steam library to unlock exchange options for games
                    you already own
                  </p>
                </div>
              </div>
            )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">
                Loading your Steam game keys...
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
                  ? "Purchase a collection to get started with your personal Steam game collection!"
                  : giftFilter === "Gifted"
                    ? "When you give or receive gift keys, they'll appear here."
                    : giftFilter === "GivenByMe"
                      ? "When you gift game keys to others, they'll appear here."
                      : giftFilter === "ReceivedByMe"
                        ? "When someone gifts you game keys, they'll appear here."
                        : "Purchase a collection to get started with your Steam game collection!"}
              </p>
              {giftFilter !== "ReceivedByMe" && (
                <Link href="/collections">
                  <Button className="bg-linear-to-r from-primary to-primary/90">
                    Browse Collections
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
                            key.coverImage?.url ||
                            "https://static.digiphile.co/product-placeholder-image.jpg"
                          }
                          alt={key.title || "Product"}
                          className="w-full h-full object-contain rounded-lg shadow-md"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{key.title}</h3>
                        {isNewlyAssigned(key) && (
                          <Badge
                            variant="outline"
                            className="animate-subtle-pulse bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                          >
                            <SparklesIcon className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                        )}
                        {key.isGift && !key.isPurchaseGift && (
                          <SteamKeyGiftIndicator
                            steamKey={key}
                            currentCustomerId={currentCustomerId}
                          />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Assigned on{" "}
                          {key.assignedAt
                            ? dayjs(key.assignedAt).format(
                                "MMM D, YYYY [at] h:mm A",
                              )
                            : "Unknown"}
                          {key.status === SteamKeyStatus.Assigned &&
                            key.expiresAt && (
                              <>
                                {" "}
                                <br />
                                <span className="inline-flex items-center gap-2 flex-wrap">
                                  <span>
                                    Expires on{" "}
                                    {dayjs(key.expiresAt).format(
                                      "MMM D, YYYY [at] h:mm A",
                                    )}
                                  </span>
                                  {(() => {
                                    const { isExpiring, daysLeft } =
                                      isExpiringSoon(key);
                                    return isExpiring ? (
                                      <ExpiringLabel daysLeft={daysLeft} />
                                    ) : null;
                                  })()}
                                </span>
                              </>
                            )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Resend button for gifted keys that haven't been accepted (but NOT expired) */}
                    {key.isGift &&
                      key.giftedByCustomerId === currentCustomerId &&
                      !key.giftAcceptedAt &&
                      !key.isPurchaseGift &&
                      !isGiftExpired(key) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => handleResendGiftEmail(key)}
                                  disabled={resendingKeyId === key.id}
                                >
                                  {resendingKeyId === key.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="h-4 w-4" />
                                      {key.isPurchaseGift
                                        ? "Resend Collection Gift"
                                        : "Resend Steam Key Gift"}
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {key.isPurchaseGift
                                ? "Resend gift key notification to recipient"
                                : "Resend gift notification email to recipient"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                    {key.status === SteamKeyStatus.Revealed ? (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() =>
                                    handleViewKey(
                                      key.id,
                                      key.title,
                                      key.coverImage?.url || null,
                                    )
                                  }
                                  disabled={viewingKeyId === key.id}
                                >
                                  {viewingKeyId === key.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Loading...
                                    </>
                                  ) : (
                                    <>
                                      <ExternalLinkIcon className="h-4 w-4" />
                                      View Key
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Open Steam redemption page with this key
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    ) : key.status === SteamKeyStatus.ReceivedFromExchange ? (
                      <>
                        {/* Show Redeem on Steam button and Gift button for keys received from exchange */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            className="cursor-pointer gap-2 bg-linear-to-r from-primary to-primary/90 dark:ring-1 dark:ring-blue-400/30 dark:hover:ring-blue-500/60"
                            onClick={() => handleRevealKey(key.id, key.title)}
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                            Redeem on Steam
                          </Button>
                        </motion.div>

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
                      </>
                    ) : key.status === SteamKeyStatus.Assigned ? (
                      <>
                        {/* Only show buttons if:
                            1. Key is not a gift, OR
                            2. Key is a received gift (giftedByCustomerId !== currentCustomerId) that has been accepted, OR
                            3. Key is a gift sent by current user (gifter) that expired without being accepted (gift returned to gifter's library) */}
                        {(!key.isGift ||
                          (key.isGift &&
                            key.giftedByCustomerId !== currentCustomerId &&
                            key.giftAccepted === true) ||
                          (key.isGift &&
                            key.giftedByCustomerId === currentCustomerId &&
                            !key.giftAccepted &&
                            isGiftExpired(key))) && (
                          <>
                            {/* Redeem on Steam button - disabled only if AlreadyOwnedOnSteam is true AND exchangeCredits > 0 */}
                            <motion.div
                              whileHover={{
                                scale:
                                  key.alreadyOwnedOnSteam &&
                                  key.exchangeCredits &&
                                  key.exchangeCredits > 0
                                    ? 1
                                    : 1.05,
                              }}
                              whileTap={{
                                scale:
                                  key.alreadyOwnedOnSteam &&
                                  key.exchangeCredits &&
                                  key.exchangeCredits > 0
                                    ? 1
                                    : 0.95,
                              }}
                            >
                              <Button
                                className={`cursor-pointer gap-2 ${
                                  key.alreadyOwnedOnSteam &&
                                  key.exchangeCredits &&
                                  key.exchangeCredits > 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : "bg-linear-to-r from-primary to-primary/90 dark:ring-1 dark:ring-blue-400/30 dark:hover:ring-blue-500/60"
                                }`}
                                disabled={
                                  !!(
                                    key.alreadyOwnedOnSteam &&
                                    key.exchangeCredits &&
                                    key.exchangeCredits > 0
                                  )
                                }
                                onClick={() =>
                                  !(
                                    key.alreadyOwnedOnSteam &&
                                    key.exchangeCredits &&
                                    key.exchangeCredits > 0
                                  ) && handleRevealKey(key.id, key.title)
                                }
                              >
                                <ExternalLinkIcon className="h-4 w-4" />
                                Redeem on Steam
                              </Button>
                            </motion.div>
                          </>
                        )}

                        {/* Show Gift button for:
                            1. Non-gifts (!key.isGift), OR
                            2. Received gifts that have been accepted (key.isGift && giftedByCustomerId !== currentCustomerId && giftAccepted === true), OR
                            3. Gifts sent by current user (gifter) that expired without being accepted (gift returned to gifter's library) */}
                        {(!key.isGift ||
                          (key.isGift &&
                            key.giftedByCustomerId !== currentCustomerId &&
                            key.giftAccepted === true) ||
                          (key.isGift &&
                            key.giftedByCustomerId === currentCustomerId &&
                            !key.giftAccepted &&
                            isGiftExpired(key))) && (
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

                            {/* Add to Exchange - only for non-gifts OR expired gifts returned to gifter */}
                            {(!key.isGift ||
                              (key.isGift &&
                                key.giftedByCustomerId === currentCustomerId &&
                                !key.giftAccepted &&
                                isGiftExpired(key))) && (
                              <>
                                <div className="flex items-center gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <motion.div
                                          whileTap={{
                                            scale:
                                              key.alreadyOwnedOnSteam &&
                                              key.exchangeCredits &&
                                              key.exchangeCredits > 0
                                                ? 0.95
                                                : 1,
                                          }}
                                        >
                                          <Button
                                            variant="outline"
                                            className={`gap-2 ${
                                              !(
                                                key.alreadyOwnedOnSteam &&
                                                key.exchangeCredits &&
                                                key.exchangeCredits > 0
                                              )
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                            disabled={
                                              !(
                                                key.alreadyOwnedOnSteam &&
                                                key.exchangeCredits &&
                                                key.exchangeCredits > 0
                                              )
                                            }
                                            onClick={() =>
                                              key.alreadyOwnedOnSteam &&
                                              key.exchangeCredits &&
                                              key.exchangeCredits > 0 &&
                                              handleSendToVault(
                                                key.id,
                                                key.title,
                                              )
                                            }
                                          >
                                            <ArchiveIcon className="h-4 w-4" />
                                            Add to Exchange
                                          </Button>
                                        </motion.div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {key.alreadyOwnedOnSteam &&
                                        key.exchangeCredits &&
                                        key.exchangeCredits > 0
                                          ? "Exchange this key for credits"
                                          : !key.alreadyOwnedOnSteam
                                            ? "This game is not in your Steam library yet"
                                            : "No exchange credits available for this game"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {key.alreadyOwnedOnSteam &&
                                    key.exchangeCredits != null &&
                                    key.exchangeCredits > 0 && (
                                      <ExchangeCreditsDisplay
                                        credits={key.exchangeCredits}
                                      />
                                    )}
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
                                  <DialogContent className="sm:max-w-md bg-card">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Exchange Steam Key?
                                      </DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to exchange this
                                        Steam key for credits? This action
                                        cannot be undone.
                                      </DialogDescription>
                                    </DialogHeader>

                                    {/* Bundle Exchange Limit Info */}
                                    {exchangeDialog.isFetchingBundleInfo ? (
                                      <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        <span className="ml-2 text-sm text-muted-foreground">
                                          Loading collection info...
                                        </span>
                                      </div>
                                    ) : exchangeDialog.bundleInfo ? (
                                      <Alert
                                        className={
                                          exchangeDialog.bundleInfo
                                            .exchangedCount >=
                                          BUNDLE_EXCHANGE_LIMIT
                                            ? "border-destructive"
                                            : "border-blue-500"
                                        }
                                      >
                                        <Info
                                          className={`h-4 w-4 ${exchangeDialog.bundleInfo.exchangedCount >= BUNDLE_EXCHANGE_LIMIT ? "text-destructive" : "text-blue-500"}`}
                                        />
                                        <AlertDescription>
                                          <div className="font-medium mb-1">
                                            {
                                              exchangeDialog.bundleInfo
                                                .productTitle
                                            }
                                          </div>
                                          {exchangeDialog.gameName && (
                                            <div className="text-muted-foreground text-sm mb-2">
                                              Game: {exchangeDialog.gameName}
                                            </div>
                                          )}
                                          {exchangeDialog.bundleInfo
                                            .exchangedCount >=
                                          BUNDLE_EXCHANGE_LIMIT ? (
                                            <span className="text-destructive">
                                              You have reached the maximum limit
                                              of {BUNDLE_EXCHANGE_LIMIT} games
                                              that can be exchanged from this
                                              collection.
                                            </span>
                                          ) : (
                                            <span>
                                              You can exchange max{" "}
                                              {BUNDLE_EXCHANGE_LIMIT} games from
                                              this collection.
                                              <br />
                                              You've used{" "}
                                              <strong>
                                                {
                                                  exchangeDialog.bundleInfo
                                                    .exchangedCount
                                                }
                                                /{BUNDLE_EXCHANGE_LIMIT}
                                              </strong>
                                              .
                                              <br />
                                              After this exchange,{" "}
                                              <strong>
                                                {BUNDLE_EXCHANGE_LIMIT -
                                                  exchangeDialog.bundleInfo
                                                    .exchangedCount -
                                                  1}
                                              </strong>{" "}
                                              will remain.
                                            </span>
                                          )}
                                        </AlertDescription>
                                      </Alert>
                                    ) : null}

                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          setExchangeDialog({
                                            isOpen: false,
                                            keyId: null,
                                            gameName: null,
                                            isLoading: false,
                                            isFetchingBundleInfo: false,
                                            bundleInfo: null,
                                          })
                                        }
                                        disabled={exchangeDialog.isLoading}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={handleExchangeConfirm}
                                        disabled={
                                          exchangeDialog.isLoading ||
                                          exchangeDialog.isFetchingBundleInfo ||
                                          (exchangeDialog.bundleInfo !== null &&
                                            exchangeDialog.bundleInfo
                                              .exchangedCount >=
                                              BUNDLE_EXCHANGE_LIMIT)
                                        }
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
                        )}
                      </>
                    ) : key.status === SteamKeyStatus.Revoked ? (
                      <Badge
                        variant="destructive"
                        className="gap-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                      >
                        Revoked
                      </Badge>
                    ) : key.isGift && key.giftAccepted === null ? (
                      <Badge variant="secondary" className="gap-1">
                        <GiftIcon className="h-3 w-3" />
                        Awaiting acceptance
                      </Badge>
                    ) : (
                      <div
                        className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium pointer-events-none ${
                          key.status === SteamKeyStatus.AddedToExchange
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                            : key.status === SteamKeyStatus.GiftAccepted
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                              : key.status === SteamKeyStatus.Expired
                                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                : key.status === SteamKeyStatus.Refunded
                                  ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                                  : "bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
                        }`}
                      >
                        {getStatusDisplayName(key.status)}
                      </div>
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
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border bg-background shadow-sm">
              <ShieldAlert className="h-6 w-6 text-muted-foreground" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              Important: Refund Policy Notice
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-sm">
                <strong>Please note:</strong> Once you redeem this Steam key,
                the entire collection containing this game becomes{" "}
                <strong>non-refundable</strong>.
              </AlertDescription>
            </Alert>

            {redeemConfirmDialog.alreadyOwned && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-sm">
                  <strong>Already owned:</strong> You already own this game on
                  Steam. Redeeming this key will result in a duplicate copy that
                  you won&apos;t be able to use.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>You&apos;re about to redeem the Steam key for:</p>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="font-medium text-foreground">
                  {redeemConfirmDialog.productTitle}
                </p>
              </div>
              <p className="text-xs">By proceeding, you acknowledge that:</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>The Steam key will be permanently redeemed</li>
                <li>The collection containing this key cannot be refunded</li>
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
                  alreadyOwned: false,
                })
              }
              disabled={redeemConfirmDialog.isLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-linear-to-r from-primary to-primary/90"
              onClick={handleConfirmRedeem}
              disabled={redeemConfirmDialog.isLoading}
            >
              {redeemConfirmDialog.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redeeming key...
                </>
              ) : (
                <>
                  <KeyIcon className="h-4 w-4 mr-2" />I Understand, Redeem Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Steam Sync Warning Dialog */}
      <Dialog
        open={steamSyncWarningDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSteamSyncWarningDialog({
              isOpen: false,
              keyId: null,
              productTitle: "",
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border bg-background shadow-sm">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              Steam Library Not Refreshed
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/20">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-sm">
                <strong>Please note:</strong>{" "}
                {!steamLibraryStatus?.lastSyncedAt
                  ? "You have never synced your Steam library with our system"
                  : "Your Steam library hasn't been refreshed recently (within the last week)"}
                . We recommend refreshing it first to enable exchange options
                for already owned games.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>You&apos;re about to redeem a Steam key for:</p>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="font-medium text-foreground">
                  {steamSyncWarningDialog.productTitle}
                </p>
              </div>
              <p className="text-xs">
                {!steamLibraryStatus?.lastSyncedAt
                  ? "Syncing your Steam library for the first time helps us:"
                  : "Refreshing your Steam library helps us:"}
              </p>
              <ul className="space-y-1 text-xs list-disc list-inside ml-2">
                <li>Check if you already own this game</li>
                <li>Provide better recommendations</li>
                <li>Optimize your key assignments</li>
                {!steamLibraryStatus?.lastSyncedAt && (
                  <li>Enable exchange options for duplicate games</li>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleSyncWarningRefresh}
              className="gap-2"
              disabled={syncSteamLibraryMutation?.isPending}
            >
              {syncSteamLibraryMutation?.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Library
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={handleSyncWarningProceed}>
              Proceed Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Steam Privacy Help Dialog */}
      <Dialog
        open={showSteamPrivacyHelp}
        onOpenChange={setShowSteamPrivacyHelp}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border bg-background shadow-sm">
              <ShieldAlert className="h-6 w-6 text-muted-foreground" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              How to Make Your Steam Profile Public
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                To sync your Steam library and enable exchange options, your
                Steam profile needs to be public. Follow these steps:
              </p>

              <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Log in to Steam</li>
                <li>Click on your username in the top menu</li>
                <li>Select "Profile" from the dropdown</li>
                <li>Click "Edit Profile"</li>
                <li>Go to "Privacy Settings"</li>
                <li>
                  Set "My Profile" to{" "}
                  <strong className="text-foreground">Public</strong>
                </li>
                <li>
                  Set "Game Details" to{" "}
                  <strong className="text-foreground">Public</strong>
                </li>
                <li>Save your changes</li>
              </ol>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowSteamPrivacyHelp(false)}
            >
              Close
            </Button>
            <Button
              className="bg-linear-to-r from-primary to-primary/90"
              onClick={() => {
                window.open(
                  "https://help.steampowered.com/en/faqs/view/588C-C67D-0251-C276",
                  "_blank",
                );
              }}
            >
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              Steam Privacy Guide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Key Dialog */}
      <Dialog
        open={viewKeyDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setViewKeyDialog({
              isOpen: false,
              keyValue: null,
              gameTitle: "",
              coverImageUrl: null,
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Steam Key</DialogTitle>
            <DialogDescription>{viewKeyDialog.gameTitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Game Cover Image */}
            {viewKeyDialog.coverImageUrl && (
              <div className="flex justify-center">
                <div className="relative w-32 aspect-[2/3] overflow-hidden rounded-lg shadow-md">
                  <Image
                    src={viewKeyDialog.coverImageUrl}
                    alt={viewKeyDialog.gameTitle}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Steam Key */}
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm select-all">
                {viewKeyDialog.keyValue}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  viewKeyDialog.keyValue &&
                  handleCopyKey(viewKeyDialog.keyValue)
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Click the key to select it, or use the copy button. You can
                redeem this key on Steam.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                if (viewKeyDialog.keyValue) {
                  window.open(
                    `https://store.steampowered.com/account/registerkey?key=${viewKeyDialog.keyValue}`,
                    "_blank",
                  );
                }
              }}
            >
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              Redeem on Steam
            </Button>
            <Button
              onClick={() =>
                setViewKeyDialog({
                  isOpen: false,
                  keyValue: null,
                  gameTitle: "",
                  coverImageUrl: null,
                })
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
