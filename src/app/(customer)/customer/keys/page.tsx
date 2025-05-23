"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { GameLevelProgress } from "@/customer/components/game-level/progress";
import {
  KeyIcon,
  ExternalLinkIcon,
  CopyIcon,
  GiftIcon,
  SearchIcon,
  StarIcon,
  SparklesIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import confetti from "canvas-confetti";

// Progress levels and their requirements
const PROGRESS_LEVELS = [
  { level: 1, title: "Novice Collector", required: 0, icon: "🎮" },
  { level: 2, title: "Game Enthusiast", required: 5, icon: "🎯" },
  { level: 3, title: "Key Master", required: 10, icon: "🗝️" },
  { level: 4, title: "Steam Legend", required: 25, icon: "👑" },
];

type KeyStatus = "All" | "Revealed" | "Unrevealed" | "Gifted" | "Refunded";

const statusOptions: KeyStatus[] = ["All", "Revealed", "Unrevealed", "Gifted"];

const copyMessages = [
  "🔑 You got it!",
  "📋 Locked and loaded.",
  "🚀 Ready to redeem!",
  "🗝️ Another one in your collection!",
];

// Mock data - replace with API call
const gameKeys = [
  {
    id: 1,
    name: "Stardew Valley",
    key: "XXXX-YYYY-ZZZZ",
    platform: "Steam",
    revealed: true,
    bundleName: "Indie Gems Bundle",
    purchaseDate: "2024-03-20",
    bundleId: 1,
    status: "Revealed" as KeyStatus,
  },
  {
    id: 2,
    name: "Hollow Knight",
    key: null,
    platform: "Steam",
    revealed: false,
    bundleName: "Strategy Masters Collection",
    purchaseDate: "2024-03-15",
    bundleId: 2,
    status: "Unrevealed" as KeyStatus,
  },
  {
    id: 3,
    name: "Terraria",
    key: "ABCD-EFGH-IJKL",
    platform: "Steam",
    revealed: true,
    bundleName: "Indie Gems Bundle",
    purchaseDate: "2024-03-20",
    bundleId: 1,
    status: "Revealed" as KeyStatus,
  },
  {
    id: 4,
    name: "Hades",
    key: null,
    platform: "Steam",
    revealed: false,
    bundleName: "Roguelike Collection",
    purchaseDate: "2024-03-18",
    bundleId: 3,
    status: "Unrevealed" as KeyStatus,
  },
  {
    id: 5,
    name: "Dead Cells",
    key: "MNOP-QRST-UVWX",
    platform: "Steam",
    revealed: true,
    bundleName: "Roguelike Collection",
    purchaseDate: "2024-03-18",
    bundleId: 3,
    status: "Revealed" as KeyStatus,
  },
  {
    id: 6,
    name: "Celeste",
    key: "PQRS-TUVW-XYZ1",
    platform: "Steam",
    revealed: true,
    bundleName: "Platformer Classics",
    purchaseDate: "2024-03-10",
    bundleId: 4,
    status: "Gifted" as KeyStatus,
  },
  {
    id: 7,
    name: "Undertale",
    key: null,
    platform: "Steam",
    revealed: false,
    bundleName: "Indie Story Bundle",
    purchaseDate: "2024-03-05",
    bundleId: 5,
    status: "Unrevealed" as KeyStatus,
  },
  {
    id: 8,
    name: "Cuphead",
    key: "2345-6789-ABCD",
    platform: "Steam",
    revealed: true,
    bundleName: "Challenging Games Pack",
    purchaseDate: "2024-02-28",
    bundleId: 6,
    status: "Refunded" as KeyStatus,
  },
];

export default function KeysPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<KeyStatus>("All");
  const [flippingStates, setFlippingStates] = useState<{
    [key: number]: { isFlipping: boolean; showKey: boolean };
  }>({});

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4F46E5", "#EC4899", "#10B981", "#F59E0B", "#6366F1"],
    });
  };

  // Calculate user's progress
  const revealedKeys = gameKeys.filter((game) => game.revealed).length;
  const currentLevel = PROGRESS_LEVELS.reduce(
    (acc, level) => (revealedKeys >= level.required ? level : acc),
    PROGRESS_LEVELS[0]
  );

  const nextLevel = PROGRESS_LEVELS[PROGRESS_LEVELS.indexOf(currentLevel) + 1];

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
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
  };

  const handleRevealKey = async (gameId: number) => {
    setFlippingStates((prev) => ({
      ...prev,
      [gameId]: { isFlipping: true, showKey: false },
    }));

    // Wait for half of the flip animation before showing the key
    await new Promise((resolve) => setTimeout(resolve, 400));

    setFlippingStates((prev) => ({
      ...prev,
      [gameId]: { isFlipping: true, showKey: true },
    }));

    // Trigger confetti
    triggerConfetti();

    // Show success toast
    toast("🎉 New game key unlocked!", {
      description: "Your collection grows stronger!",
      icon: (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <StarIcon className="h-5 w-5 text-yellow-400" />
        </motion.div>
      ),
      style: {
        background: "linear-gradient(to right, #8B5CF6, #6366F1)",
        color: "white",
      },
      duration: 3000,
    });

    // Wait for 2 seconds before flipping back
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setFlippingStates((prev) => ({
      ...prev,
      [gameId]: { isFlipping: false, showKey: false },
    }));
  };

  const filteredKeys = gameKeys.filter((game) => {
    const matchesSearch = game.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Revealed" && game.revealed) ||
      (statusFilter === "Unrevealed" && !game.revealed) ||
      game.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleActivateOnSteam = (key: string) => {
    // Steam activation URL
    window.open(`steam://open/activateproduct?key=${key}`);
  };

  const handleGiftKey = (gameId: number) => {
    // TODO: Implement gifting functionality
    console.log(gameId);
    toast.info("Gifting feature coming soon!");
  };

  const getStatusCount = (status: KeyStatus) => {
    if (status === "All") return gameKeys.length;
    return gameKeys.filter(
      (game) =>
        (status === "Revealed" && game.revealed) ||
        (status === "Unrevealed" && !game.revealed) ||
        game.status === status
    ).length;
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Game Keys</h1>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <GameLevelProgress
              currentLevel={currentLevel}
              nextLevel={nextLevel}
              revealedKeys={revealedKeys}
              totalKeys={gameKeys.length}
            />
          </div>
        </div>
      </div>

      <Card className="bg-card border shadow-xs">
        <CardHeader className="pb-2">
          <h2 className="text-sm text-muted-foreground font-medium">Filters</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by game title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`transition-all duration-200 ${
                  statusFilter === status
                    ? "bg-primary/10 dark:bg-primary/20 text-primary font-semibold"
                    : ""
                }`}
              >
                {status} ({getStatusCount(status)})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-card to-card/95 dark:from-[#1a1d2e] dark:to-[#1a1d2e]/95 shadow-md">
        <CardHeader>
          <CardTitle>Available Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {gameKeys.length === 0 || filteredKeys.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <KeyIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {gameKeys.length === 0
                  ? "No game keys yet"
                  : "No matches found"}
              </h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                Purchase a bundle to get started with your game collection!
              </p>
              <Button className="bg-linear-to-r from-primary to-primary/90">
                Browse Bundles
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredKeys.map((game) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className={`relative flex flex-col gap-4 rounded-lg border bg-card/30 p-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-200 hover:bg-card/50 hover:shadow-lg dark:hover:bg-[#1d2233]/60 dark:hover:shadow-blue-500/5 ${
                    flippingStates[game.id]?.isFlipping
                      ? "animate-flip-reveal"
                      : ""
                  }`}
                >
                  <AnimatePresence>
                    {flippingStates[game.id]?.isFlipping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute inset-0 flex items-center justify-center rounded-lg ${
                          flippingStates[game.id]?.showKey
                            ? "bg-primary/20"
                            : "bg-primary/10"
                        } backdrop-blur-xs flip-content`}
                      >
                        {flippingStates[game.id]?.showKey ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="text-2xl font-bold text-primary">
                              XXXX-YYYY-ZZZZ
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
                      <h3 className="font-semibold">{game.name}</h3>
                      {!game.revealed && (
                        <Badge
                          variant="secondary"
                          className="animate-subtle-pulse"
                        >
                          New!
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      From{" "}
                      <Link
                        href={`/my-bundles/${game.bundleId}`}
                        className="hover:text-primary"
                      >
                        {game.bundleName}
                      </Link>{" "}
                      • Purchased on{" "}
                      {new Date(game.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {game.revealed ? (
                      <>
                        <code className="rounded bg-muted/10 px-2 py-1 font-mono text-muted-foreground">
                          {game.key}
                        </code>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 transition-all duration-200"
                                  onClick={() => handleCopyKey(game.key!)}
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
                                    handleActivateOnSteam(game.key!)
                                  }
                                >
                                  <ExternalLinkIcon className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>Activate on Steam</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 transition-all duration-200"
                                  onClick={() => handleGiftKey(game.id)}
                                >
                                  <GiftIcon className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>Gift this game</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className="gap-2 bg-linear-to-r from-primary to-primary/90 dark:ring-1 dark:ring-blue-400/30 dark:hover:ring-blue-500/60"
                          onClick={() => handleRevealKey(game.id)}
                        >
                          <KeyIcon className="h-4 w-4" />
                          Reveal Key
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
