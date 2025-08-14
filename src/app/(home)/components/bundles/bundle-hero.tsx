"use client";

import { Card } from "@/shared/components/ui/card";
import { Timer, BookOpen, Gamepad2, Package } from "lucide-react";
import Image from "next/image";
import { Bundle, BundleType } from "@/app/(shared)/types/bundle";
import { useCountdownTimer } from "@/app/(shared)/hooks/useCountdownTimer";

interface BundleHeroProps {
  bundle: Bundle;
}

export function BundleHero({ bundle }: BundleHeroProps) {
  const timeLeft = useCountdownTimer(bundle?.endsAt);

  return (
    <div className="relative h-[40vh] overflow-hidden">
      <div className="absolute inset-0">
        <div className="relative h-full">
          <Image
            fill={true}
            sizes="100vw"
            quality={80}
            src={bundle.imageMedia?.url || ""}
            alt={bundle.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 dark:from-background dark:via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-black/80 dark:from-background dark:via-background/50 to-transparent" />
      </div>
      <div className="absolute inset-0 flex items-center ">
        <div className="container px-4">
          <div className="max-w-4xl">
            <div className="flex gap-3 mb-4">
              {/* Bundle Type Badge - Prominent */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${
                  bundle.bundleType === BundleType.EBook
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                } backdrop-blur-md`}
              >
                {bundle.bundleType === BundleType.EBook ? (
                  <><BookOpen className="h-5 w-5" /> Book Bundle</>
                ) : (
                  <><Gamepad2 className="h-5 w-5" /> Game Bundle</>
                )}
              </div>
              
              {/* Status badges */}
              {(bundle.isEarlyAccess || bundle.isFeatured || bundle.isLimitedKeys) && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                    bundle.isEarlyAccess
                      ? "bg-primary/20 text-primary ring-1 ring-primary/50"
                      : bundle.isFeatured
                        ? "bg-secondary/20 text-secondary ring-1 ring-secondary/50"
                        : "bg-muted/20 text-muted-foreground ring-1 ring-white/20"
                  } backdrop-blur-xs`}
                >
                  {bundle.isEarlyAccess && "Early Access"}
                  {bundle.isFeatured && "Featured"}
                  {bundle.isLimitedKeys && "Limited Keys"}
                </div>
              )}
            </div>
            <h1 className="font-orbitron text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {bundle.title}
            </h1>
            <div className="flex flex-wrap gap-4">
              <Card className="bg-white/10 backdrop-blur-xs border-white/20">
                <div className="p-4">
                  <div className="flex items-center gap-2 text-white/70">
                    <Timer className="h-5 w-5" />
                    <span>Ends in</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {timeLeft}
                  </div>
                </div>
              </Card>
              <Card className={`backdrop-blur-xs border-white/20 ${
                bundle.bundleType === BundleType.EBook 
                  ? "bg-amber-500/10" 
                  : "bg-blue-500/10"
              }`}>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-white/70">
                    <Package className="h-5 w-5" />
                    <span>Contains</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {bundle.products?.length || 0} {bundle.bundleType === BundleType.EBook ? "Books" : "Games"}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
