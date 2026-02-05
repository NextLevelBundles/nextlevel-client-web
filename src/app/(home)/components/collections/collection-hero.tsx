"use client";

import { Card } from "@/shared/components/ui/card";
import { Timer, BookOpen, Gamepad2, Package } from "lucide-react";
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
  const saleStartDate = useMemo(
    () => (bundle.sellFrom ? new Date(bundle.sellFrom) : startDate),
    [bundle.sellFrom, startDate]
  );
  const saleEndDate = useMemo(
    () => (bundle.sellTo ? new Date(bundle.sellTo) : endDate),
    [bundle.sellTo, endDate]
  );

  const now = new Date();
  const bundleHasStarted = now >= startDate;
  const bundleHasEnded = now > endDate;
  const saleHasStarted = now >= saleStartDate;
  const saleHasEnded = now > saleEndDate;

  // Determine which date to countdown to and what label to show
  let countdownTarget: string;
  let timerLabel: string;

  if (bundleHasEnded) {
    // Bundle has ended
    countdownTarget = bundle.endsAt;
    timerLabel = "Collection Ended";
  } else if (!bundleHasStarted) {
    // Bundle hasn't started yet
    if (bundle.sellFrom || bundle.sellTo) {
      // Sale period is defined
      if (saleHasStarted && !saleHasEnded) {
        // Sale has started but bundle hasn't - exclusive access is active
        // Countdown to when bundle starts (when exclusive access ends)
        countdownTarget = bundle.startsAt;
        timerLabel = "Exclusive Access Ends in";
      } else if (!saleHasStarted) {
        // Sale hasn't started yet - countdown to sale start
        countdownTarget = bundle.sellFrom || bundle.startsAt;
        timerLabel = "Exclusive Access Starts in";
      } else {
        // Sale has ended but bundle hasn't started - countdown to bundle start
        countdownTarget = bundle.startsAt;
        timerLabel = "Starts in";
      }
    } else {
      // No sale period defined - countdown to bundle start
      countdownTarget = bundle.startsAt;
      timerLabel = "Starts in";
    }
  } else {
    // Bundle has started - countdown to bundle end
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
      {/* Feature badges - top right */}
      <div className="absolute right-6 top-6 flex gap-2 z-10">
        {bundle.bundleTypeTag && (
          <div className="text-xs font-semibold rounded-full px-3 py-1 backdrop-blur-md bg-blue-500/60 text-white shadow-md border border-white/10">
            {bundle.bundleTypeTag.name}
          </div>
        )}
        {bundle.isFeatured && (
          <div className="text-xs font-semibold rounded-full px-3 py-1 backdrop-blur-md bg-green-500/60 text-white shadow-md border border-white/10">
            Featured
          </div>
        )}
        {bundle.isEarlyAccess && (
          <div className="text-xs font-semibold rounded-full px-3 py-1 backdrop-blur-md bg-purple-500/60 text-white shadow-md border border-white/10">
            Early Access
          </div>
        )}
        {bundle.isLimitedKeys && (
          <div className="text-xs font-semibold rounded-full px-3 py-1 backdrop-blur-md bg-red-500/60 text-white shadow-md border border-white/10">
            Limited Keys
          </div>
        )}
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

            {/* Products Count Card */}
            {/* <Card className="bg-black/50 backdrop-blur-md border-white/20 shadow-2xl">
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 text-white/80 text-sm uppercase tracking-wide mb-1">
                  <Package className="h-4 w-4" />
                  <span>Contains</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white">
                  {baseProductCount}{" "}
                  <span className="text-lg font-normal text-white/90">
                    {bundle.type === BundleType.EBook ? "Books" : "Steam Games"}
                  </span>
                </div>
              </div>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
}
