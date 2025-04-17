"use client";

import { useState, useEffect } from "react";
import { Card } from "@/shared/components/ui/card";
import { Game, Tier } from "@/home/data/tiers";
import { cn } from "@/shared/utils/tailwind";
import { LockedTierCard } from "./locked-tier-card";
import { GameDetailDrawer } from "./game-detail-drawer";
import Image from "next/image";

interface GameGridProps {
  id?: string;
  allGames: Game[];
  unlockedGames: Game[];
  selectedTier: number;
  tiers: Tier[];
  onTierChange: (tier: number) => void;
  isHighlighted?: boolean;
}

export function GameGrid({
  id,
  selectedTier,
  tiers,
  onTierChange,
  isHighlighted,
}: GameGridProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    const handleGameNavigation = (event: CustomEvent<Game>) => {
      setSelectedGame(event.detail);
    };

    window.addEventListener(
      "navigateToGame",
      handleGameNavigation as EventListener
    );
    return () => {
      window.removeEventListener(
        "navigateToGame",
        handleGameNavigation as EventListener
      );
    };
  }, []);

  // Get games up to the selected tier
  const displayedGames = tiers
    .slice(0, selectedTier)
    .flatMap((tier) => tier.games);

  // Get locked tiers
  const lockedTiers = tiers.slice(selectedTier);

  // Calculate cumulative games for each locked tier
  const lockedTiersWithCumulativeGames = lockedTiers.map((tier, index) => {
    const gamesInCurrentAndPreviousLockedTiers = lockedTiers
      .slice(0, index + 1)
      .reduce((acc, t) => acc + t.games.length, 0);
    return {
      ...tier,
      totalGamesToUnlock: gamesInCurrentAndPreviousLockedTiers,
    };
  });

  return (
    <Card
      id={id}
      className={cn(
        "p-6 bg-gray-50/95 dark:bg-card/70 backdrop-blur-xs border border-gray-100 dark:border-border shadow-xs transition-all duration-500",
        isHighlighted &&
          "ring-2 ring-primary/50 shadow-lg shadow-primary/20 dark:shadow-primary/30"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedGames.map((game) => (
          <div
            key={game.name}
            onClick={() => setSelectedGame(game)}
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-border shadow-xs hover:shadow-lg transition-all duration-300 hover:border-primary/50 hover:scale-[1.01] hover:bg-white/95"
          >
            <div className="relative aspect-16/9 overflow-hidden">
              <Image
                fill={true}
                src={game.image}
                alt={game.name}
                className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-[1.02] saturate-[1.02] group-hover:saturate-[1.05]"
              />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-rajdhani text-lg font-bold line-clamp-1 text-gray-900 dark:text-foreground">
                  {game.name}
                </h3>
                <span className="text-sm font-medium bg-blue-50 text-blue-700 dark:bg-primary/20 dark:text-primary px-2 py-0.5 rounded-full">
                  ${game.originalPrice}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {game.deckVerified && (
                  <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-500 ring-1 ring-green-500/10">
                    Deck Verified
                  </span>
                )}
                {game.protonDbRating && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs",
                      {
                        "bg-purple-50 text-purple-700 ring-1 ring-purple-500/10 dark:bg-purple-500/20 dark:text-purple-500":
                          game.protonDbRating === "platinum",
                        "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-500/10 dark:bg-yellow-500/20 dark:text-yellow-500":
                          game.protonDbRating === "gold",
                        "bg-gray-50 text-gray-700 ring-1 ring-gray-500/10 dark:bg-gray-500/20 dark:text-gray-500":
                          game.protonDbRating === "silver",
                        "bg-orange-50 text-orange-700 ring-1 ring-orange-500/10 dark:bg-orange-500/20 dark:text-orange-500":
                          game.protonDbRating === "bronze",
                      }
                    )}
                  >
                    ProtonDB {game.protonDbRating}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {lockedTiersWithCumulativeGames.map((tier, index) => (
          <LockedTierCard
            key={tier.name}
            tier={tier}
            previewGame={tier.games[0]}
            onSelect={() => onTierChange(index + selectedTier + 1)}
            tierIndex={index}
            totalGamesToUnlock={tier.totalGamesToUnlock}
          ></LockedTierCard>
        ))}

        <GameDetailDrawer
          game={selectedGame}
          isOpen={selectedGame !== null}
          onClose={() => setSelectedGame(null)}
          allGames={displayedGames}
        />
      </div>
    </Card>
  );
}
