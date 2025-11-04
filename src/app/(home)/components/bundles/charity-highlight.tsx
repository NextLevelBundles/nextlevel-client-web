"use client";

import { Card } from "@/shared/components/ui/card";
import { Heart, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Charity } from "@/app/(shared)/types/bundle";

interface CharityHighlightProps {
  charities: Charity[];
  charityAmount: number;
}

export function CharityHighlight({
  charities,
  charityAmount,
}: CharityHighlightProps) {
  if (charities.length === 0) return null;

  return (
    <Card className="p-6 bg-white/80 dark:bg-card/70 backdrop-blur-xs">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-red-500" />
          <h2 className="font-rajdhani text-2xl font-bold">
            Supporting Charities
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {charities.map((charity) => (
          <div key={charity.id} className="flex gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/20 flex-shrink-0">
              <Image
                fill={true}
                sizes="100px"
                quality={80}
                src={charity.logoMedia.url}
                alt={charity.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-rajdhani text-lg font-bold mb-2">
                {charity.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {charity.description}
              </p>
              {charity.website && (
                <a
                  href={charity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <span>Learn more</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
