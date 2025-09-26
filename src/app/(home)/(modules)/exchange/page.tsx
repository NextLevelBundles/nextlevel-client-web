"use client";

import { Navigation } from "@/home/components/navigation";
import { Footer } from "@/home/components/sections/footer";
import { ExchangeHeader } from "./components/exchange-header";
import { useExchangeData } from "@/hooks/queries/use-exchange";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ExchangeGameCard } from "./components/exchange-game-card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ExchangePage() {
  const { data: exchangeData, isLoading, error } = useExchangeData();

  if (error) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1600px] mx-auto pt-24 pb-8 px-6 md:px-12 lg:px-20 xl:px-32 min-h-screen">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load exchange data. Please refresh the page or try again later.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="max-w-[1600px] mx-auto pt-24 pb-8 px-6 md:px-12 lg:px-20 xl:px-32 min-h-screen">
        <ExchangeHeader />

        <section className="bg-card rounded-lg border shadow-sm p-6 mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Available Games</h2>
              <span className="text-sm text-muted-foreground">
                {exchangeData?.exchangeGames?.length ?? 0} {(exchangeData?.exchangeGames?.length ?? 0) === 1 ? 'game' : 'games'} available
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : !exchangeData?.exchangeGames || exchangeData.exchangeGames.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                <div className="text-center space-y-2">
                  <h3 className="font-medium text-muted-foreground">No games available for exchange</h3>
                  <p className="text-sm text-muted-foreground/80">
                    Check back later for new games to exchange your credits for
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {exchangeData.exchangeGames.map((game) => (
                  <ExchangeGameCard
                    key={game.id}
                    game={game}
                  />
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