"use client";

import { Navigation } from "@/home/components/navigation";
import { Footer } from "@/home/components/sections/footer";
import { useExchangeData } from "@/hooks/queries/use-exchange";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertTriangle, TrendingUp, Trophy, Flame, Coins } from "lucide-react";
import { ExchangeGameCard } from "./components/exchange-game-card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import Link from "next/link";
import { useUserCredits } from "@/hooks/queries/use-user-credits";
import { useAuth } from "@/shared/providers/auth-provider";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export default function ExchangePage() {
  const { user } = useAuth();
  const { data: exchangeData, isLoading, error } = useExchangeData();
  const { data: creditsData } = useUserCredits();
  const isAuthenticated = !!user;
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (error) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-16">
          <div className="container mx-auto px-4 py-12">
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load exchange data. Please refresh the page or try
                again later.
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-16">
        {/* Combined Hero and Stats Section */}
        <section className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4">
            {/* Hero Content */}
            <div className="py-6 md:py-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
                    The Exchange
                  </h1>
                  <p className="text-base md:text-lg lg:text-xl font-medium text-gray-700 dark:text-white/90 mt-2">
                    Trade in What You Own, Discover What You Don't
                  </p>
                  <p className="text-gray-600 dark:text-white/80 text-xs md:text-sm lg:text-base mt-2">
                    Already own a game on Steam from our collections? Trade it in
                    for credits to get another game from the Exchange. (Steam
                    verification required)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <div className="bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-lg px-3 md:px-4 py-2 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-gray-600 dark:text-white/80 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-white/80 text-xs md:text-sm whitespace-nowrap">
                      Available Credits:
                    </span>
                    <span className="text-gray-900 dark:text-white font-semibold text-sm md:text-base">
                      {creditsData ?? 0}
                    </span>
                  </div>
                  {isAuthenticated && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="bg-white dark:bg-transparent text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 border-gray-300 dark:border-white/20"
                    >
                      <Link href="/customer/exchange-history">History</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="py-6 border-t border-gray-300 dark:border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      Step 1
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Verify Your Games
                  </h3>
                  <p className="text-gray-600 dark:text-white/60 text-sm">
                    Up to 3 games per collection are eligible for exchange
                    (excluding DLC)
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      Step 2
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Browse Available Games
                  </h3>
                  <p className="text-gray-600 dark:text-white/60 text-sm">
                    Discover something from a previous collection or save your
                    credits for later.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      Step 3
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Instant Delivery
                  </h3>
                  <p className="text-gray-600 dark:text-white/60 text-sm">
                    Redeem your credits for new titles that are instantly added
                    to your game library.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Games Grid Section */}
        <section className="py-8 md:py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Browse the Exchange</h2>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">
                  Discover your next favorite game
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Most Credits First</SelectItem>
                    <SelectItem value="asc">Least Credits First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full" style={{ aspectRatio: "3/4" }} />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : !exchangeData?.exchangeGames ||
              exchangeData.exchangeGames.length === 0 ? (
              <Card className="p-16 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No games available</h3>
                  <p className="text-muted-foreground">
                    Check back later for new games to exchange your credits for.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...exchangeData.exchangeGames]
                  .sort((a, b) =>
                    sortOrder === "desc"
                      ? b.outputCredits - a.outputCredits
                      : a.outputCredits - b.outputCredits
                  )
                  .map((game) => (
                    <ExchangeGameCard key={game.id} game={game} />
                  ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
