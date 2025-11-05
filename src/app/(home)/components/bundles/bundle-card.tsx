"use client";

import { useRef, useState, useEffect } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Timer, ArrowRight, BookOpen, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { BundleListItem, BundleType } from "@/app/(shared)/types/bundle";
import { useCountdownTimer } from "@/app/(shared)/hooks/useCountdownTimer";
import { BundleImageDeck } from "./bundle-image-deck";

interface BundleCardProps {
  bundle: BundleListItem;
  index: number;
}

export function BundleCard({ bundle, index }: BundleCardProps) {
  const { timeLeft } = useCountdownTimer(bundle.endsAt);

  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Link href={`/bundles/${bundle.id}`} className="flex h-full flex-col">
      <div
        ref={cardRef}
        tabIndex={0}
        role="article"
        aria-label={`${bundle.title} bundle`}
        className={`group relative h-full overflow-visible rounded-3xl bg-white/80 dark:bg-card/70 backdrop-blur-xs transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_8px_30px_rgba(57,130,245,0.2)] dark:hover:shadow-[0_8px_30px_rgba(57,130,245,0.3)] border border-white/20 dark:border-border hover:border-primary/50 cursor-pointer ring-1 ring-black/5 dark:ring-white/20 before:absolute before:inset-[1px] before:rounded-3xl before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none ${
          isVisible ? "animate-fade-up opacity-100" : "opacity-0"
        }`}
        style={{ animationDelay: isVisible ? `${index * 150}ms` : "0ms" }}
      >
        <Card className="border-0 bg-transparent h-full">
          <div className="relative">
            <div className="relative aspect-4/3 rounded-2xl overflow-visible">
              <BundleImageDeck
                images={bundle.imageMedia}
                title={bundle.title}
                containerClassName="rounded-2xl"
                className="transition-all duration-300"
              />
            </div>

            {/* Status badges on image */}
            <div className="absolute right-3 top-3 flex gap-2 z-20">
              {bundle.isFeatured && (
                <div className="text-xs font-semibold rounded-full px-2.5 py-0.5 backdrop-blur-md transition-transform group-hover:scale-105 bg-green-500/60 text-white shadow-md border border-white/10">
                  Featured
                </div>
              )}
              {bundle.isEarlyAccess && (
                <div className="text-xs font-semibold rounded-full px-2.5 py-0.5 backdrop-blur-md transition-transform group-hover:scale-105 bg-purple-500/60 text-white shadow-md border border-white/10">
                  Early Access
                </div>
              )}
              {bundle.isLimitedKeys && (
                <div className="text-xs font-semibold rounded-full px-2.5 py-0.5 backdrop-blur-md transition-transform group-hover:scale-105 bg-red-500/60 text-white shadow-md border border-white/10">
                  Limited Keys
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col p-6">
            {/* Bundle Type Badge */}
            <div className="mb-3">
              <div
                className={`inline-flex items-center gap-2 text-xs font-bold rounded-full px-3 py-1.5 transition-all group-hover:scale-105 ${
                  (bundle as any).type === "EBook" ||
                  bundle.type === BundleType.EBook
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20"
                }`}
              >
                {(bundle as any).type === "EBook" ||
                bundle.type === BundleType.EBook ? (
                  <>
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Book Bundle</span>
                  </>
                ) : (
                  <>
                    <Gamepad2 className="h-3.5 w-3.5" />
                    <span>Game Bundle</span>
                  </>
                )}
              </div>
            </div>

            <h3 className="font-rajdhani mb-3 text-xl font-bold text-[#1c1c1e] dark:text-foreground transition-colors group-hover:text-primary">
              {bundle.title}
            </h3>

            <div className="mb-4 flex items-center gap-2 text-sm text-[#64748b] dark:text-muted-foreground group-hover:text-[#4b5563] dark:group-hover:text-muted-foreground/80 transition-colors">
              <Timer className="h-4 w-4" />
              <span>{timeLeft}</span>
            </div>

            <div className="mt-auto flex items-end justify-between">
              <div className="group-hover:translate-y-[-1px] transition-transform">
                <p className="text-xs text-[#64748b] dark:text-muted-foreground group-hover:text-[#4b5563] transition-colors">
                  Starting at
                </p>

                {/* bg-secondary/10 dark:bg-secondary/20 */}
                <div className="mt-1 inline-flex items-center rounded-lg  px-3 py-1">
                  <p className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ${bundle.minPrice}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="cursor-pointer relative z-10 transition-all hover:bg-primary hover:text-white border-primary/50 hover:border-primary hover:shadow-[0_0_20px_rgba(57,130,245,0.5)] hover:brightness-110 duration-300 group-hover:translate-y-[-1px]"
                aria-label={`View ${bundle.title} bundle details`}
              >
                <span className="flex items-center gap-2">
                  View Bundle
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Link>
  );
}
