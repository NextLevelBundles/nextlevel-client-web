"use client";

import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Apple,
  AppWindow as Windows,
  Link as Linux,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/utils/tailwind";
import Image from "next/image";
import { Bundle, Product } from "@/app/(shared)/types/bundle";

interface GameDetailDrawerProps {
  bundle: Bundle;
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToGame: (targetGame: Product) => void;
  unlockedProducts?: Product[];
}

export function GameDetailDrawer({
  bundle,
  product,
  isOpen,
  onClose,
  onNavigateToGame,
  unlockedProducts = [],
}: GameDetailDrawerProps) {
  const [showRequirements, setShowRequirements] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!product) return null;

  const currentIndex = unlockedProducts.findIndex((g) => g.id === product.id);
  const nextGame =
    unlockedProducts[(currentIndex + 1) % unlockedProducts.length];
  const prevGame =
    unlockedProducts[
      (currentIndex - 1 + unlockedProducts.length) % unlockedProducts.length
    ];

  const navigateToGame = (targetGame: Product) => {
    setIsPlaying(false);
    setShowRequirements(true);
    onNavigateToGame(targetGame);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className="h-[100vh] !max-w-[680px] p-0 w-screen mx-auto border border-gray-200 dark:border-border bg-white dark:bg-neutral-900 shadow-xl dark:shadow-2xl transition-all duration-300"
      >
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="relative aspect-16/9 overflow-hidden">
            {product.steamGameMetadata.trailerUrl ? (
              <div className="relative w-full h-full">
                {isPlaying ? (
                  <iframe
                    src={`${product.steamGameMetadata.trailerUrl}?autoplay=1&mute=1`}
                    allow="autoplay; encrypted-media"
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                  />
                ) : (
                  <div
                    className="relative w-full h-full group cursor-pointer"
                    onClick={() => setIsPlaying(true)}
                  >
                    <Image
                      fill={true}
                      sizes="750px"
                      quality={80}
                      src={product.headerImage}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-90 group-hover:brightness-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/50 p-4 backdrop-blur-xs transition-transform duration-300 group-hover:scale-110">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Image
                fill={true}
                sizes="750px"
                quality={80}
                src={product.headerImage}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-4">
              <h2 className="font-rajdhani text-3xl font-bold text-white drop-shadow-md">
                {product.title}
              </h2>
              <div className="flex gap-2">
                {product.steamGameMetadata.platforms.includes("windows") && (
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs rounded-full px-3 py-1.5">
                    <Windows className="h-4 w-4 text-white" />
                    <span className="text-sm text-white font-medium">
                      Windows
                    </span>
                  </div>
                )}
                {product.steamGameMetadata.platforms.includes("mac") && (
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs rounded-full px-3 py-1.5">
                    <Apple className="h-4 w-4 text-white" />
                    <span className="text-sm text-white font-medium">
                      macOS
                    </span>
                  </div>
                )}
                {product.steamGameMetadata.platforms.includes("linux") && (
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs rounded-full px-3 py-1.5">
                    <Linux className="h-4 w-4 text-white" />
                    <span className="text-sm text-white font-medium">
                      Linux
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6 max-w-2xl mx-auto">
            <div className="flex flex-wrap gap-3 animate-fade-up">
              {/* {product.deckVerified && (
                <div className="bg-green-500/20 text-green-500 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium ring-1 ring-green-500/30 hover:bg-green-500/30 transition-colors">
                  <Star className="h-4 w-4" />
                  Steam Deck Verified
                </div>
              )} */}
              {product.steamGameMetadata.protonDbTier && (
                <div
                  className={cn(
                    "px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium transition-colors",
                    {
                      "bg-purple-500/20 text-purple-500 ring-1 ring-purple-500/30 hover:bg-purple-500/30":
                        product.steamGameMetadata.protonDbTier === "platinum",
                      "bg-yellow-500/20 text-yellow-500 ring-1 ring-yellow-500/30 hover:bg-yellow-500/30":
                        product.steamGameMetadata.protonDbTier === "gold",
                      "bg-gray-500/20 text-gray-500 ring-1 ring-gray-500/30 hover:bg-gray-500/30":
                        product.steamGameMetadata.protonDbTier === "silver",
                      "bg-orange-500/20 text-orange-500 ring-1 ring-orange-500/30 hover:bg-orange-500/30":
                        product.steamGameMetadata.protonDbTier === "bronze",
                    }
                  )}
                >
                  ProtonDB {product.steamGameMetadata.protonDbTier}
                </div>
              )}
              <div className="bg-primary/20 text-primary px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium ring-1 ring-primary/30 hover:bg-primary/30 transition-colors">
                ${product.price} Value
              </div>
              <div className="bg-secondary/20 text-secondary px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium ring-1 ring-secondary/30 hover:bg-secondary/30 transition-colors">
                Unlocks at $
                {
                  bundle.tiers.find((tier) => tier.id == product.bundleTierId)
                    ?.price
                }
              </div>
            </div>

            <p
              className="text-muted-foreground text-sm leading-relaxed animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              {product.description}
            </p>

            <div
              className="space-y-4 animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              <Button
                variant="ghost"
                onClick={() => setShowRequirements(!showRequirements)}
                className="w-full justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                System Requirements
                {showRequirements ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {showRequirements && (
                <div className="space-y-4 text-sm text-muted-foreground bg-muted/30 p-6 rounded-xl border border-border/50">
                  <div>
                    <h4 className="font-medium mb-2">Minimum Requirements:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>OS: Windows 10</li>
                      <li>Processor: Intel Core i5 or equivalent</li>
                      <li>Memory: 8 GB RAM</li>
                      <li>Graphics: NVIDIA GTX 1060 or equivalent</li>
                      <li>Storage: 20 GB available space</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div
              className="flex justify-end animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              <Button
                variant="outline"
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 border-white/20 dark:border-border hover:border-primary/50"
                onClick={() =>
                  window.open(
                    `https://store.steampowered.com/search/?term=${encodeURIComponent(product.steamGameMetadata.steamAppId)}`,
                    "_blank"
                  )
                }
              >
                View on Steam
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-0 px-4 py-3 inset-x-0 flex items-center justify-between bg-white dark:bg-neutral-900 gap-1.5">
          {unlockedProducts.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer h-12 w-12 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white/90 dark:hover:bg-black/60 text-gray-700 dark:text-white shadow-xs hover:shadow-md pointer-events-auto transition-all duration-300 hover:scale-110"
              onClick={() => navigateToGame(prevGame)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          <div className="flex-1 flex items-center justify-center gap-1.5">
            {unlockedProducts.map((g, index) => (
              <div
                key={g.title}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "w-6 bg-white"
                    : "w-2.5 bg-white/30 hover:bg-white/70 cursor-pointer"
                )}
                onClick={() => navigateToGame(g)}
              />
            ))}
          </div>

          {unlockedProducts.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer h-12 w-12 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white/90 dark:hover:bg-black/60 text-gray-700 dark:text-white shadow-xs hover:shadow-md pointer-events-auto transition-all duration-300 hover:scale-110"
              onClick={() => navigateToGame(nextGame)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
