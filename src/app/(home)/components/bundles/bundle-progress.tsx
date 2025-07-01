import { Card } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Sparkles, Gift, PartyPopper } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/utils/tailwind";
import { Bundle, Product, Tier } from "@/app/(shared)/types/bundle";
import { Fragment } from "react";

interface BundleProgressProps {
  bundle: Bundle;
  selectedTier: Tier;
  totalAmount: number;
  unlockedProducts: Product[];
  className?: string;
  setTotalAmount: (amount: number) => void;
}

export function BundleProgress({
  bundle,
  unlockedProducts,
  totalAmount,
  className,
  setTotalAmount,
}: BundleProgressProps) {
  const tiers = bundle.tiers || [];
  const allProducts = bundle.products;

  const progress = (unlockedProducts.length / allProducts.length) * 100;
  const isComplete = progress === 100;

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    // Find the appropriate tier based on click position
    const targetTierIndex =
      tiers.findIndex((tier) => {
        const tierGames = tiers
          .slice(0, tiers.findIndex((x) => x.id == tier.id) + 1)
          .flatMap((t) =>
            allProducts.filter((product) => product.bundleTierId == t.id)
          );
        return (tierGames.length / allProducts.length) * 100 >= percentage;
      }) + 1;

    const targetTier =
      targetTierIndex > -1 && targetTierIndex <= tiers.length
        ? tiers[targetTierIndex - 1]
        : null;

    if (targetTier != null) setTotalAmount(targetTier.price);
  };

  const calculateTierValue = (tierId: string) => {
    return allProducts
      .filter((x) => x.bundleTierId == tierId)
      .reduce((sum, game) => sum + game.price, 0);
  };

  return (
    <Card
      className={cn(
        "p-6 bg-white/80 dark:bg-card/70 backdrop-blur-xs transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-rajdhani text-lg font-bold">Bundle Progress</h3>
        <div className="flex items-center gap-2">
          {isComplete ? (
            <div className="flex items-center gap-2 text-sm font-medium text-primary animate-pulse dark:text-primary/90">
              <PartyPopper className="h-4 w-4" />
              All {allProducts.length} games unlocked 🎉
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              <span className="text-primary font-semibold">
                {unlockedProducts.length}
              </span>{" "}
              of {allProducts.length} games unlocked
            </span>
          )}
        </div>
      </div>

      <div className="relative cursor-pointer" onClick={handleProgressClick}>
        <Progress
          value={progress}
          className={cn(
            "h-3 rounded-full transition-all duration-500 relative overflow-hidden",
            isComplete && "animate-shimmer"
          )}
        />

        {isComplete && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
            <div className="relative">
              <Sparkles
                className="h-5 w-5 text-secondary absolute -top-2 -left-2 animate-sparkle"
                style={{ animationDelay: "0s" }}
              />
              <Sparkles
                className="h-4 w-4 text-primary absolute -top-1 left-1 animate-sparkle"
                style={{ animationDelay: "0.5s" }}
              />
              <Sparkles
                className="h-3 w-3 text-secondary absolute top-0 -left-1 animate-sparkle"
                style={{ animationDelay: "1s" }}
              />
            </div>
          </div>
        )}

        {/* Tier Indicators */}
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none">
          {tiers.map((tier, index) => {
            const tierGames = tiers
              .slice(0, index + 1)
              .flatMap((t) =>
                allProducts.filter((product) => product.bundleTierId == t.id)
              );
            const position = (tierGames.length / allProducts.length) * 100;
            const tierValue = calculateTierValue(tier.id);

            return (
              <Fragment key={tier.id}>
                <TooltipProvider key={tier.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 h-5 w-0.5 bg-border transition-colors duration-300",
                          totalAmount >= tier.price
                            ? "bg-primary"
                            : "bg-primary/50"
                        )}
                        style={{ left: `${position}%` }}
                      >
                        <div
                          className={cn(
                            "absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-600 dark:text-muted-foreground transition-colors duration-300",
                            totalAmount >= tier.price && "text-primary"
                          )}
                        >
                          ${tier.price}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      <span>
                        Unlocks{" "}
                        {
                          allProducts.filter((x) => x.bundleTierId == tier.id)
                            .length
                        }{" "}
                        games worth ${tierValue.toFixed(2)}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Fragment>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
