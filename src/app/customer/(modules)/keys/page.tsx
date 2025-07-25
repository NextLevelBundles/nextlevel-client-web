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
  Mail,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import confetti from "canvas-confetti";
import {
  useSteamKeys,
  useRevealKey,
  useViewKey,
  useGiftKey,
  useSteamKeyStatusCounts,
} from "@/hooks/queries/useSteamKeys";
import {
  SteamKey,
  SteamKeyQueryParams,
  GiftKeyRequest,
} from "@/lib/api/types/steam-key";
import { GiftFilterType } from "@/lib/api/types/purchase";
import { GiftKeyModal } from "@/customer/components/steam-keys/gift-key-modal";
import { FilterDropdown } from "@/customer/components/filter-dropdown";

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

export default function KeysPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [giftFilter, setGiftFilter] = useState<GiftFilterType>("All");
  const [selectedGiftKey, setSelectedGiftKey] = useState<SteamKey | null>(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [flippingStates, setFlippingStates] = useState<{
    [key: string]: {
      isFlipping: boolean;
      showKey: boolean;
      revealedKeyValue?: string;
    };
  }>({});

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
      status: statusFilter as
        | "Assigned"
        | "Revealed"
        | "Expired"
        | "Refunded",
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
        if (option.value === "Owned")
          return !key.isGift;
        if (option.value === "GivenByMe") 
          // Outgoing gifts are gifts with giftAccepted === false
          return key.isGift && key.giftAccepted === false;
        if (option.value === "ReceivedByMe") 
          // Incoming gifts are gifts with giftAccepted === true or null
          return key.isGift && (key.giftAccepted === true || key.giftAccepted === null);
        return false;
      }).length,
    }));
  }, [steamKeys]);

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
  const isNewlyAssigned = (key: SteamKey): boolean => {
    if (key.status !== "Assigned" || !key.assignedAt) return false;

    const assignedDate = dayjs(key.assignedAt);
    const thirtyDaysAgo = dayjs().subtract(30, "day");

    return assignedDate.isAfter(thirtyDaysAgo);
  };

  // Helper function to get the key value
  const getKeyValue = (key: SteamKey): string | null => {
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

  const handleRevealKey = async (keyId: string) => {
    setFlippingStates((prev) => ({
      ...prev,
      [keyId]: { isFlipping: true, showKey: false },
    }));

    try {
      // Wait for half of the flip animation before showing the key
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Call the API to reveal the key
      const revealedKey = await revealKeyMutation.mutateAsync(keyId);

      setFlippingStates((prev) => ({
        ...prev,
        [keyId]: {
          isFlipping: true,
          showKey: true,
          revealedKeyValue: revealedKey.steamKeyValue,
        },
      }));

      // Trigger confetti
      triggerConfetti();

      // Wait for 2 seconds before flipping back
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setFlippingStates((prev) => ({
        ...prev,
        [keyId]: {
          isFlipping: false,
          showKey: false,
          revealedKeyValue: undefined,
        },
      }));
    } catch {
      // Reset flipping state on error
      setFlippingStates((prev) => ({
        ...prev,
        [keyId]: {
          isFlipping: false,
          showKey: false,
          revealedKeyValue: undefined,
        },
      }));
    }
  };

  const handleActivateOnSteam = (key: string) => {
    // Steam activation URL
    window.open(`steam://open/activateproduct?key=${key}`);
  };

  const handleGiftKey = (key: SteamKey) => {
    setSelectedGiftKey(key);
    setIsGiftModalOpen(true);
  };

  const handleGiftSubmit = async (
    assignmentId: string,
    giftData: GiftKeyRequest
  ) => {
    await giftKeyMutation.mutateAsync({ assignmentId, giftData });
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
          <CardTitle>
            Available Keys
            {steamKeys.length > 0 && (
              <span className="text-sm text-muted-foreground">
                &nbsp; ({steamKeys.length} found)
              </span>
            )}
          </CardTitle>
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
                  className={`relative flex flex-col gap-4 rounded-lg border bg-card/30 p-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-200 hover:bg-card/50 hover:shadow-lg dark:hover:bg-[#1d2233]/60 dark:hover:shadow-blue-500/5 ${
                    flippingStates[key.id]?.isFlipping
                      ? "animate-flip-reveal"
                      : ""
                  }`}
                >
                  <AnimatePresence>
                    {flippingStates[key.id]?.isFlipping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute inset-0 flex items-center justify-center rounded-lg ${
                          flippingStates[key.id]?.showKey
                            ? "bg-primary/20"
                            : "bg-primary/10"
                        } backdrop-blur-xs flip-content`}
                      >
                        {flippingStates[key.id]?.showKey ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="text-2xl font-bold text-primary">
                              {flippingStates[key.id]?.revealedKeyValue ||
                                "XXXX-YYYY-ZZZZ"}
                            </div>
                            <div className="text-sm text-primary/80">
                              Your new game key!
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                            <KeyIcon className="h-6 w-6 animate-bounce" />
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              Revealing your key...
                            </motion.span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-2">
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
                      {key.isGift && key.giftAccepted === null && (
                        <Badge className="gap-1 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/40">
                          <GiftIcon className="h-3 w-3" />
                          Gift Pending
                        </Badge>
                      )}
                      {key.isGift && key.giftAccepted === true && (
                        <Badge className="gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/40">
                          <GiftIcon className="h-3 w-3" />
                          Gift Accepted
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Assigned on{" "}
                        {key.assignedAt
                          ? new Date(key.assignedAt).toLocaleDateString()
                          : "Unknown"}
                        {key.expiresAt && (
                          <>
                            {" "}• Expires on{" "}
                            {new Date(key.expiresAt).toLocaleDateString()}
                          </>
                        )}
                      </p>
                      {key.isGift && key.giftAccepted === true && (
                        <p className="text-sm text-muted-foreground">
                          Gift accepted{key.giftAcceptedAt && (
                            <> on {new Date(key.giftAcceptedAt).toLocaleDateString()}</>
                          )}
                        </p>
                      )}
                      {key.isGift && key.giftAccepted === null && (
                        <p className="text-sm text-muted-foreground">
                          Awaiting recipient to accept gift
                        </p>
                      )}
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

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="icon"
                                  className="h-8 w-8 transition-all duration-200 bg-linear-to-r from-primary to-primary/90"
                                  onClick={() =>
                                    handleActivateOnSteam(getKeyValue(key)!)
                                  }
                                >
                                  <ExternalLinkIcon className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>Activate on Steam</TooltipContent>
                          </Tooltip>

                          {!key.isGift && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div whileTap={{ scale: 0.95 }}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 transition-all duration-200"
                                    onClick={() => handleGiftKey(key)}
                                  >
                                    <GiftIcon className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>Gift this game</TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                      </>
                    ) : key.status === "Assigned" ? (
                      // Check if this is an outgoing gift (gifted to someone else)
                      key.isGift && key.giftAccepted === false ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => {
                                    toast.info("Resend invite", {
                                      description: "Feature coming soon - email will be resent to recipient"
                                    });
                                  }}
                                >
                                  <Mail className="h-4 w-4" />
                                  Resend Invite
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Resend gift invitation email
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              className="cursor-pointer gap-2 bg-linear-to-r from-primary to-primary/90 dark:ring-1 dark:ring-blue-400/30 dark:hover:ring-blue-500/60"
                              onClick={() => handleRevealKey(key.id)}
                            >
                              <KeyIcon className="h-4 w-4" />
                              Reveal Key
                            </Button>
                          </motion.div>
                          {!key.isGift && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileTap={{ scale: 0.95 }}>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 transition-all duration-200"
                                      onClick={() => handleGiftKey(key)}
                                    >
                                      <GiftIcon className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Gift this game without revealing
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </>
                      )
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
    </div>
  );
}
