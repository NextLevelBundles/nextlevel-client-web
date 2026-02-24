"use client";

import { Card } from "@/shared/components/ui/card";
import { Timer, BookOpen, Gamepad2, Package, Sparkles } from "lucide-react";
import { Bundle, BundleType, TierType } from "@/app/(shared)/types/bundle";
import { useCountdownTimer } from "@/app/(shared)/hooks/useCountdownTimer";
import { BundleStaticDeck } from "./collection-static-deck";
import { useMemo } from "react";

interface BundleHeroProps {
  bundle: Bundle;
}

export function BundleHero({ bundle }: BundleHeroProps) {
  const startDate = useMemo(() => new Date(bundle.startsAt), [bundle.startsAt]);
  const endDate = useMemo(() => new Date(bundle.endsAt), [bundle.endsAt]);

  // Calculate sale period dates with fallbacks
  // sellFrom/sellTo are always set, but if they match startsAt/endsAt respectively,
  // there is no separate exclusive access period — treat it as a standard bundle.
  // An exclusive access period only exists when sellFrom < startsAt (sale begins
  // before the bundle officially starts) or sellTo differs from endsAt.
  const saleStartDate = useMemo(
    () => (bundle.sellFrom ? new Date(bundle.sellFrom) : startDate),
    [bundle.sellFrom, startDate]
  );
  const saleEndDate = useMemo(
    () => (bundle.sellTo ? new Date(bundle.sellTo) : endDate),
    [bundle.sellTo, endDate]
  );

  const hasExclusiveAccess =
    saleStartDate.getTime() !== startDate.getTime() ||
    saleEndDate.getTime() !== endDate.getTime();

  const now = new Date();
  const bundleHasStarted = now >= startDate;
  const bundleHasEnded = now > endDate;
  const saleHasStarted = now >= saleStartDate;
  const saleHasEnded = now > saleEndDate;

  // Determine which date to countdown to and what label to show
  let countdownTarget: string;
  let timerLabel: string;

  if (bundleHasEnded) {
    countdownTarget = bundle.endsAt;
    timerLabel = "Collection Ended";
  } else if (!bundleHasStarted) {
    if (hasExclusiveAccess) {
      if (saleHasStarted && !saleHasEnded) {
        countdownTarget = bundle.startsAt;
        timerLabel = "Pre-sale Ends in";
      } else if (!saleHasStarted) {
        countdownTarget = bundle.sellFrom || bundle.startsAt;
        timerLabel = "Pre-sale Starts in";
      } else {
        countdownTarget = bundle.startsAt;
        timerLabel = "Starts in";
      }
    } else {
      countdownTarget = bundle.startsAt;
      timerLabel = "Starts in";
    }
  } else {
    countdownTarget = bundle.endsAt;
    timerLabel = "Ends in";
  }

  const { timeLeft, hasEnded } = useCountdownTimer(countdownTarget);

  // Count only products from base tiers
  const baseTierIds =
    bundle.tiers
      ?.filter((tier) => tier.type === TierType.Base)
      .map((tier) => tier.id) || [];

  const baseProductCount =
    bundle.products?.filter(
      (product) =>
        product.bundleTierId && baseTierIds.includes(product.bundleTierId)
    ).length || 0;

  return (
    <div className="container max-w-[1560px] relative h-[44vh] min-h-[420px] w-full overflow-hidden rounded-3xl">
      {/* Background with static deck - full width */}
      <div className="absolute inset-0">
        <BundleStaticDeck
          images={bundle.imageMedia}
          title={bundle.title}
          containerClassName="w-full h-full"
        />
        {/* Single dark overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      {/* Bundle type ribbon - top right */}
      {bundle.bundleTypeTag && (
        <div className="absolute right-0 top-5 z-10">
          <div
            className="flex items-center gap-1.5 py-2 pl-5 pr-5 bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-lg shadow-black/20"
            style={{ clipPath: "polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)" }}
          >
            <Sparkles className="h-3.5 w-3.5 drop-shadow-sm" />
            <span className="text-xs font-bold uppercase tracking-wider drop-shadow-sm">{bundle.bundleTypeTag.name}</span>
          </div>
          {/* Ribbon fold shadow */}
          <div className="absolute right-0 -bottom-1.5 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-800/40 to-amber-800/50" style={{ clipPath: "polygon(12px 0, 100% 0, 100% 100%, 14px 100%)" }} />
        </div>
      )}

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
                  Book Collection
                </>
              ) : (
                <>
                  <Gamepad2 className="h-5 w-5" />
                  Steam Game Collection
                </>
              )}
            </div>
          </div>

          {/* Bundle Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
            {bundle.title}
          </h1>

          {/* Info Cards Row */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {/* Timer Card */}
            <Card className="bg-black/50 backdrop-blur-md border-white/20 shadow-2xl">
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 text-white/80 text-sm uppercase tracking-wide mb-1">
                  <Timer className="h-4 w-4" />
                  <span>{timerLabel}</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white">
                  {timeLeft}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
