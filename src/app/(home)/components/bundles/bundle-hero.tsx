"use client";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Timer, Users } from "lucide-react";
import { Bundle } from "@/home/data/bundles";
import Image from "next/image";

interface BundleHeroProps {
  bundle: Bundle;
  timeLeft: string;
  onViewContentsClick: () => void;
}

export function BundleHero({
  bundle,
  timeLeft,
  onViewContentsClick,
}: BundleHeroProps) {
  return (
    <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
      <div className="absolute inset-0">
        <div className="relative">
          <Image
            fill={true}
            sizes="100vw"
            quality={80}
            src={bundle.image}
            alt={bundle.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 dark:from-background dark:via-background/50 to-transparent" />
      </div>
      <div className="absolute inset-0 flex items-center">
        <div className="container px-4">
          <div className="max-w-4xl">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                bundle.tag === "Most Popular"
                  ? "bg-primary/20 text-primary ring-1 ring-primary/50"
                  : bundle.tag === "New Release"
                    ? "bg-secondary/20 text-secondary ring-1 ring-secondary/50"
                    : "bg-muted/20 text-muted-foreground ring-1 ring-white/20"
              } backdrop-blur-xs mb-4`}
            >
              {bundle.tag}
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
              <Card className="bg-white/10 backdrop-blur-xs border-white/20">
                <div className="p-4">
                  <div className="flex items-center gap-2 text-white/70">
                    <Users className="h-5 w-5" />
                    <span>Keys Left</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {bundle.keysLeft}
                  </div>
                </div>
              </Card>
            </div>
            <Button
              className="mt-8 bg-primary/90 hover:bg-primary text-white backdrop-blur-xs"
              size="lg"
              onClick={() => {
                const element = document.getElementById("bundle-games");
                if (element) {
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                  onViewContentsClick();
                }
              }}
            >
              View Bundle Contents
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
