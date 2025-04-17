"use client";

import { Lock } from "lucide-react";
import { Game, Tier } from "@/home/data/tiers";
import { cn } from "@/shared/utils/tailwind";
import Image from "next/image";

interface LockedTierCardProps {
  tier: Tier;
  previewGame: Game;
  onSelect: (tierIndex: number) => void;
  tierIndex: number;
  totalGamesToUnlock: number;
}

function calculateTotalValue(games: Game[]): number {
  return games.reduce((sum, game) => sum + game.originalPrice, 0);
}

export function LockedTierCard({
  tier,
  previewGame,
  onSelect,
  tierIndex,
  totalGamesToUnlock,
}: LockedTierCardProps) {
  const totalValue = calculateTotalValue(tier.games);

  return (
    <div
      onClick={() => onSelect(tierIndex)}
      className="group relative overflow-hidden rounded-lg border border-border/40 dark:border-border bg-[#f9f9f9]/80 dark:bg-card/70 shadow-xs hover:shadow-lg dark:hover:shadow-secondary/30 transition-all duration-300 hover:border-secondary/50 hover:translate-y-[-2px] hover:bg-white/95 dark:hover:bg-card/90 cursor-pointer will-change-transform"
    >
      <div className="absolute inset-0 bg-white/75 dark:bg-background/80 backdrop-blur-xs transition-opacity duration-700 opacity-100 group-hover:opacity-90" />

      <div className="aspect-16/9 overflow-hidden relative">
        <div className="absolute inset-0 grid grid-cols-2 gap-1">
          {tier.games.slice(0, 4).map((game, index) => (
            <div
              key={game.name}
              className={cn(
                "relative overflow-hidden",
                index === 0 && "col-span-2 row-span-2",
                "transition-transform duration-500 group-hover:scale-105"
              )}
            >
              <Image
                fill={true}
                src={game.image}
                alt={game.name}
                className="h-full w-full object-cover blur-[2px] brightness-[0.4] dark:brightness-50 transition-all duration-500 group-hover:blur-0 group-hover:brightness-[0.6] dark:group-hover:brightness-75 will-change-transform"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-linear-to-t from-black/90 via-black/70 to-black/50 backdrop-blur-[2px] p-6 text-center transition-all duration-500">
        <div className="absolute top-3 right-3 flex gap-2">
          {/* {hasDeckVerified && (
            <div className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <CheckCircle2 className="h-3 w-3" />
              <span>Steam Verified</span>
            </div>
          )} */}
          {/* {hasNewRelease && (
            <div className="bg-secondary/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <Sparkles className="h-3 w-3" />
              <span>New Release</span>
            </div>
          )} */}
        </div>

        <Lock
          className="h-10 w-10 text-white/90 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 will-change-transform animate-fade-up"
          style={{ animationDelay: "100ms" }}
        />

        <div className="space-y-3 transform transition-all duration-500 group-hover:translate-y-[-4px]">
          <div
            className="space-y-1 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <p className="text-xl text-white/90 font-semibold flex items-center justify-center gap-2">
              +{totalGamesToUnlock} Games at ${tier.minPrice}
            </p>
            <p className="text-white/90 text-sm font-semibold bg-linear-to-r from-primary/90 to-secondary/90 bg-clip-text">
              Worth ${totalValue.toFixed(2)} in value
            </p>
          </div>
        </div>

        <p
          className="text-sm text-white/70 mt-2 animate-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          Including {previewGame.name}
        </p>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-primary/50 via-secondary/50 to-primary/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </div>
  );
}
