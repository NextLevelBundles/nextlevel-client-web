"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";
import { GameCard } from "./game-card";
import { Tier } from "@/home/data/tiers";

interface TierGameViewerProps {
  tiers: Tier[];
  selectedTier: number;
  onTierChange: (tier: number) => void;
}

export function TierGameViewer({
  tiers,
  selectedTier,
  onTierChange,
}: TierGameViewerProps) {
  const [activeTab, setActiveTab] = useState(`tier-${selectedTier}`);

  return (
    <Card className="p-6 bg-white/80 dark:bg-card/70 backdrop-blur-xs">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          onTierChange(parseInt(value.split("-")[1]));
        }}
        className="space-y-6"
      >
        <TabsList className="w-full grid grid-cols-3 gap-4">
          {tiers.map((tier, index) => (
            <TabsTrigger
              key={tier.name}
              value={`tier-${index + 1}`}
              className="w-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <div className="text-left">
                <div className="font-rajdhani font-semibold">{tier.name}</div>
                <div className="text-xs opacity-80">
                  {tier.games.length} games
                </div>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {tiers.map((tier, index) => (
          <TabsContent key={tier.name} value={`tier-${index + 1}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tier.games.map((game) => (
                <GameCard
                  key={game.name}
                  {...game}
                  isLocked={index + 1 > selectedTier}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
