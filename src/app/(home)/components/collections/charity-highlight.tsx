"use client";

import { Card } from "@/shared/components/ui/card";
import { Heart, ExternalLink, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Charity } from "@/app/(shared)/types/bundle";

interface CharityHighlightProps {
  charities: Charity[];
  charityAmount: number;
  totalRaisedForCharity?: number;
  charityGoal?: number | null;
}

export function CharityHighlight({
  charities,
  charityAmount,
  totalRaisedForCharity,
  charityGoal,
}: CharityHighlightProps) {
  if (charities.length === 0) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const progressPercentage =
    charityGoal && totalRaisedForCharity
      ? Math.min((totalRaisedForCharity / charityGoal) * 100, 100)
      : 0;

  const isGoalReached =
    charityGoal && totalRaisedForCharity
      ? totalRaisedForCharity >= charityGoal
      : false;

  return (
    <Card className="p-6 bg-white/80 dark:bg-card/70 backdrop-blur-xs">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold">
            Supporting Charities
          </h2>
        </div>
        {totalRaisedForCharity !== undefined && totalRaisedForCharity > 0 && (
          <div className="text-right">
            {charityGoal ? (
              <>
                {isGoalReached ? (
                  <>
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                        Goal Reached!
                      </div>
                    </div>
                    <div className="text-2xl font-bold font-mono bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="relative h-1.5 w-32 bg-green-200 dark:bg-green-900/30 rounded-full overflow-hidden mt-1 ml-auto">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      of {formatCurrency(charityGoal)} Goal
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold font-mono bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="relative h-1.5 w-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1 ml-auto">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      of {formatCurrency(charityGoal)} Goal
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Total Raised
                </div>
                <div className="text-2xl font-bold font-mono bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  {formatCurrency(totalRaisedForCharity)}
                </div>
              </>
            )}
          </div>
        )}
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
              <h3 className="text-lg font-bold mb-2">
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
