"use client";

import { Lock } from "lucide-react";
import { cn } from "@/shared/utils/tailwind";
import Image from "next/image";
import { Bundle, Product, Tier, BundleType } from "@/app/(shared)/types/bundle";

interface LockedTierCardProps {
  tier: Tier;
  bundle: Bundle;
  onSelect: (tierIndex: number) => void;
  tierIndex: number;
  totalGamesToUnlock: number;
}

function calculateTotalValue(procuts: Product[]): number {
  return procuts.reduce((sum, product) => sum + product.price, 0);
}

export function LockedTierCard({
  bundle,
  tier,
  onSelect,
  tierIndex,
  totalGamesToUnlock,
}: LockedTierCardProps) {
  const tierProducts = bundle.products.filter(
    (game) => game.bundleTierId === tier.id
  );
  const totalValue = calculateTotalValue(tierProducts);
  const firstProduct = tierProducts[0];

  return (
    <div
      onClick={() => onSelect(tierIndex)}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-border shadow-xs hover:shadow-lg transition-all duration-300 hover:border-primary/50 hover:scale-[1.01] hover:bg-white/95 cursor-pointer"
    >
      {/* Background image - matches aspect ratio of regular product cards */}
      <div className="relative aspect-[2/3] h-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        {firstProduct && (
          <Image
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={80}
            src={firstProduct.coverImage?.url || "/placeholder.jpg"}
            alt={firstProduct.title}
            className="object-cover blur-[1px] brightness-75 dark:brightness-[0.6] transition-all duration-500 group-hover:blur-0 group-hover:brightness-90 dark:group-hover:brightness-75"
          />
        )}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-black/60 via-black/40 to-black/30 backdrop-blur-[1px] p-6 text-center transition-all duration-500">
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
              +{totalGamesToUnlock}{" "}
              {bundle.type === BundleType.EBook ? "Books" : "Games"} at $
              {tier.price.toFixed(2)}
            </p>
            <p className="text-white/90 text-sm font-semibold bg-gradient-to-r from-primary/90 to-secondary/90 bg-clip-text">
              Worth ${totalValue.toFixed(2)}
            </p>
          </div>
        </div>
        {/* 
        <p
          className="text-sm text-white/70 mt-2 animate-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          Including {previewProduct?.title} and more!
        </p> */}

        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </div>
  );
}
