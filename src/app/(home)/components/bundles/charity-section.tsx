"use client";

import { Card } from "@/shared/components/ui/card";
import { Heart, Info } from "lucide-react";
import { Charity } from "@/home/data/charities";
import Image from "next/image";

interface CharitySectionProps {
  charities: Charity[];
}

export function CharitySection({ charities }: CharitySectionProps) {
  return (
    <Card className="p-6 bg-white/80 dark:bg-card/70 backdrop-blur-xs">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-6 w-6 text-red-500" />
        <h2 className="font-rajdhani text-2xl font-bold">
          Supporting Charities
        </h2>
      </div>
      <p className="text-muted-foreground mb-6">
        100% of your purchase supports these amazing causes
      </p>
      <div className="flex flex-wrap gap-6">
        {charities.map((charity) => (
          <div
            key={charity.name}
            className="group relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-primary/50 transition-all duration-300"
          >
            <Image
              fill={true}
              sizes="100px"
              quality={80}
              src={charity.logo}
              alt={charity.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Info className="h-5 w-5 text-white" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
