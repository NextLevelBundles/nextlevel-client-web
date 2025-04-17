"use client";

import { useRef, useState, useEffect } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Timer, Users, ArrowRight } from "lucide-react";
import { Bundle } from "@/home/data/bundles";
import Image from "next/image";

interface BundleCardProps {
  bundle: Bundle;
  index: number;
}

export function BundleCard({ bundle, index }: BundleCardProps) {
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
    <div
      ref={cardRef}
      tabIndex={0}
      role="article"
      aria-label={`${bundle.title} bundle`}
      className={`group relative h-full overflow-hidden rounded-2xl bg-white/80 dark:bg-card/70 backdrop-blur-xs transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_8px_30px_rgba(57,130,245,0.2)] dark:hover:shadow-[0_8px_30px_rgba(57,130,245,0.3)] border border-white/20 dark:border-border hover:border-primary/50 cursor-pointer ring-1 ring-black/5 dark:ring-white/20 before:absolute before:inset-[1px] before:rounded-2xl before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none ${bundle.neonClass} ${
        isVisible ? "animate-fade-up opacity-100" : "opacity-0"
      }`}
      style={{ animationDelay: isVisible ? `${index * 150}ms` : "0ms" }}
      onClick={() => (window.location.href = `/bundles/${bundle.id}`)}
    >
      <Card className="border-0 bg-transparent h-full">
        <div className="flex h-full flex-col">
          <div className="relative">
            <div className="relative aspect-4/3 overflow-hidden">
              <Image
                fill={true}
                sizes="550px"
                quality={80}
                src={bundle.image}
                alt={bundle.title}
                className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 dark:group-hover:brightness-125 will-change-transform saturate-[1.02] group-hover:saturate-[1.1]"
              />
              <div className="absolute inset-0 dark:from-background/95 dark:via-background/50 dark:to-transparent transition-opacity group-hover:opacity-75" />
            </div>
            <div
              className={`absolute right-3 top-3 text-xs font-semibold rounded-full px-2 py-0.5 backdrop-blur-xs transition-transform group-hover:scale-105 ${
                bundle.tag === "Most Popular"
                  ? "bg-primary/20 text-primary ring-1 ring-primary/50 group-hover:bg-primary/30"
                  : bundle.tag === "New Release"
                    ? "bg-secondary/20 text-secondary ring-1 ring-secondary/50 group-hover:bg-secondary/30"
                    : bundle.tag === "Last Chance"
                      ? "bg-red-500/20 text-red-500 ring-1 ring-red-500/50 group-hover:bg-red-500/30"
                      : bundle.tag === "Best Value"
                        ? "bg-green-500/20 text-green-500 ring-1 ring-green-500/50 group-hover:bg-green-500/30"
                        : bundle.tag === "Staff Pick"
                          ? "bg-purple-500/20 text-purple-500 ring-1 ring-purple-500/50 group-hover:bg-purple-500/30"
                          : "bg-muted/30 text-muted-foreground ring-1 ring-white/30"
              }`}
            >
              {bundle.tag}
            </div>
          </div>

          <div className="flex flex-1 flex-col p-7">
            <h3 className="font-rajdhani mb-2 text-xl font-bold text-[#1c1c1e] dark:text-foreground transition-colors group-hover:text-primary">
              {bundle.title}
            </h3>

            <div className="mb-4 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-2 text-sm text-[#64748b] dark:text-muted-foreground group-hover:text-[#4b5563] dark:group-hover:text-muted-foreground/80 transition-colors">
                <Timer className="h-4 w-4" />
                <span>{bundle.timeLeft}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#64748b] dark:text-muted-foreground group-hover:text-[#4b5563] dark:group-hover:text-muted-foreground/80 transition-colors">
                <Users className="h-4 w-4" />
                <span>{bundle.keysLeft} keys left</span>
              </div>
            </div>

            <div className="mt-auto flex items-end justify-between">
              <div className="group-hover:translate-y-[-1px] transition-transform">
                <p className="text-xs text-[#64748b] dark:text-muted-foreground group-hover:text-[#4b5563] transition-colors">
                  Starting at
                </p>
                <div className="mt-1 inline-flex items-center rounded-lg bg-secondary/10 dark:bg-secondary/20 px-3 py-1">
                  <p className="text-2xl font-bold text-secondary group-hover:scale-[1.02] transition-transform">
                    ${bundle.minPrice}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="relative z-10 transition-all hover:bg-primary hover:text-white border-primary/50 hover:border-primary hover:shadow-[0_0_20px_rgba(57,130,245,0.5)] hover:brightness-110 duration-300 group-hover:translate-y-[-1px]"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/bundles/${bundle.id}`;
                }}
                aria-label={`View ${bundle.title} bundle details`}
              >
                <span className="flex items-center gap-2">
                  View Bundle
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-primary/50 via-secondary/50 to-primary/50 opacity-0 transition-all duration-300 group-hover:opacity-100" />
      </Card>
    </div>
  );
}
