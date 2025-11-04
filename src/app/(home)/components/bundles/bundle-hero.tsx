"use client";

import { Card } from "@/shared/components/ui/card";
import { Timer, BookOpen, Gamepad2, Package } from "lucide-react";
import { Bundle, BundleType, TierType } from "@/app/(shared)/types/bundle";
import { useCountdownTimer } from "@/app/(shared)/hooks/useCountdownTimer";
import { BundleStaticDeck } from "./bundle-static-deck";

interface BundleHeroProps {
  bundle: Bundle;
}

export function BundleHero({ bundle }: BundleHeroProps) {
  const { timeLeft, hasEnded } = useCountdownTimer(bundle?.endsAt);

  // Count only products from base tiers
  const baseTierIds = bundle.tiers
    ?.filter((tier) => tier.type === TierType.Base)
    .map((tier) => tier.id) || [];

  const baseProductCount = bundle.products?.filter(
    (product) => product.bundleTierId && baseTierIds.includes(product.bundleTierId)
  ).length || 0;

  return (
    <div className="container max-w-[1560px] relative h-[50vh] min-h-[500px] w-full overflow-hidden rounded-3xl">
      {/* Background with static deck - full width */}
      <div className="absolute inset-0">
        <BundleStaticDeck
          images={bundle.imageMedia}
          title={bundle.title}
          containerClassName="w-full h-full"
        />
        {/* Single dark overlay */}
        <div className="absolute inset-0 bg-black/55" />
      </div>
      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-6 px-4 max-w-4xl">
          {/* Bundle Type Badge */}
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-wide ${
                bundle.type === BundleType.EBook
                  ? "bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white shadow-2xl shadow-amber-500/50"
                  : "bg-gradient-to-r from-blue-500/90 to-indigo-500/90 text-white shadow-2xl shadow-blue-500/50"
              } backdrop-blur-sm border border-white/20`}
            >
              {bundle.type === BundleType.EBook ? (
                <>
                  <BookOpen className="h-5 w-5" />
                  Book Bundle
                </>
              ) : (
                <>
                  <Gamepad2 className="h-5 w-5" />
                  Game Bundle
                </>
              )}
            </div>
          </div>

          {/* Bundle Title */}
          <h1 className="font-orbitron text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
            {bundle.title}
          </h1>

          {/* Info Cards Row */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {/* Timer Card */}
            <Card className="bg-black/50 backdrop-blur-md border-white/20 shadow-2xl">
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 text-white/80 text-sm uppercase tracking-wide mb-1">
                  <Timer className="h-4 w-4" />
                  <span>{hasEnded ? "Bundle Ended" : "Ends in"}</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white">
                  {timeLeft}
                </div>
              </div>
            </Card>

            {/* Products Count Card */}
            <Card className="bg-black/50 backdrop-blur-md border-white/20 shadow-2xl">
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 text-white/80 text-sm uppercase tracking-wide mb-1">
                  <Package className="h-4 w-4" />
                  <span>Contains</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white">
                  {baseProductCount}{" "}
                  <span className="text-lg font-normal text-white/90">
                    {bundle.type === BundleType.EBook ? "Books" : "Games"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Limited Keys Badge if applicable */}
            {bundle.isLimitedKeys && (
              <Card className="bg-red-500/20 backdrop-blur-md border-red-500/30 shadow-2xl">
                <div className="px-6 py-4">
                  <div className="text-sm uppercase tracking-wide text-red-300 mb-1">
                    Limited
                  </div>
                  <div className="text-2xl font-mono font-bold text-red-400">
                    Keys Left
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
