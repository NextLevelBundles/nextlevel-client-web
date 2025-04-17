"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Apple,
  AppWindow as Windows,
  Link as Linux,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import { Game } from "@/home/data/tiers";
import { cn } from "@/shared/utils/tailwind";
import Image from "next/image";

interface GameCardProps extends Game {
  isLocked?: boolean;
}

export function GameCard({
  name,
  description,
  image,
  deckVerified,
  platforms,
  isLocked,
}: GameCardProps) {
  const [showRequirements, setShowRequirements] = useState(false);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-white/80 dark:bg-card/70 backdrop-blur-xs border border-white/20 dark:border-border hover:border-primary/50 transition-all duration-300 h-full",
        isLocked && "opacity-50 grayscale"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="relative aspect-16/9 overflow-hidden">
          <Image
            fill={true}
            sizes="400px"
            quality={80}
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 right-2 flex gap-2">
            {deckVerified && (
              <div className="bg-green-500/80 text-white text-xs px-1.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                <Star className="h-3 w-3" />
              </div>
            )}
            <div className="flex gap-1 bg-background/80 backdrop-blur-xs rounded-full px-1.5 py-0.5">
              {platforms.includes("windows") && <Windows className="h-3 w-3" />}
              {platforms.includes("mac") && <Apple className="h-3 w-3" />}
              {platforms.includes("linux") && <Linux className="h-3 w-3" />}
            </div>
          </div>
          {isLocked && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
              <div className="text-sm font-medium text-muted-foreground">
                Unlock at higher tier
              </div>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between">
            <h3 className="font-rajdhani text-lg font-bold">{name}</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-auto pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRequirements(!showRequirements)}
              className="text-xs w-full justify-between"
            >
              System Requirements
              {showRequirements ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
            {showRequirements && (
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Minimum:</p>
                <ul className="ml-4 list-disc">
                  <li>OS: Windows 10</li>
                  <li>Processor: Intel Core i5</li>
                  <li>Memory: 8 GB RAM</li>
                  <li>Graphics: NVIDIA GTX 1060</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
