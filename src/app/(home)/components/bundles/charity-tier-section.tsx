"use client";

import { Heart, Lock, Unlock, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/tailwind";
import { Tier, Product, BundleType } from "@/app/(shared)/types/bundle";
import { Card } from "@/shared/components/ui/card";
import Image from "next/image";

interface CharityTierSectionProps {
  tier: Tier;
  products: Product[];
  isUnlocked: boolean;
  totalAmount: number;
  onUnlock: () => void;
  onCancel: () => void;
  bundleType: BundleType;
}

export function CharityTierSection({
  tier,
  products,
  isUnlocked,
  onUnlock,
  onCancel,
  bundleType,
}: CharityTierSectionProps) {
  const tierProducts = products.filter((p) => p.bundleTierId === tier.id);
  const isBookBundle = bundleType === BundleType.EBook;

  if (tierProducts.length === 0) return null;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        isUnlocked
          ? "bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-800"
          : "bg-card border-border"
      )}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-full",
                isUnlocked ? "bg-rose-100 dark:bg-rose-900/30" : "bg-muted"
              )}
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  isUnlocked
                    ? "text-rose-600 dark:text-rose-400 fill-rose-600 dark:fill-rose-400"
                    : "text-muted-foreground"
                )}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {tier.name || "Charity Tier"}
              </h3>
              <p className="text-sm text-muted-foreground">
                100% of this tier goes to charity • {tierProducts.length}{" "}
                {isBookBundle
                  ? tierProducts.length === 1 ? "book" : "books"
                  : tierProducts.length === 1 ? "game" : "games"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${tier.price}</div>
            {isUnlocked ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Unlock className="h-3 w-3" />
                <span className="text-xs font-medium">Included</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span className="text-xs font-medium">Not included</span>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid - matching base tier grid sizing */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-4">
          {tierProducts.slice(0, 4).map((product, idx) => (
            <div
              key={product.id}
              className={cn(
                "relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer transition-all",
                isUnlocked
                  ? "ring-1 ring-rose-200 dark:ring-rose-800"
                  : "ring-1 ring-border opacity-60"
              )}
            >
              {product.coverImage?.url ? (
                <Image
                  src={product.coverImage.url}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 25vw, 150px"
                />
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <Heart className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs font-medium text-white truncate">
                    {product.title}
                  </p>
                  <p className="text-[10px] text-white/80">
                    ${product.price} value
                  </p>
                </div>
              </div>
              {idx === 3 && tierProducts.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <Plus className="h-6 w-6 text-white mb-1" />
                  <span className="text-xs font-medium text-white">
                    +{tierProducts.length - 4} more
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Button */}
        {!isUnlocked ? (
          <div className="flex justify-center">
            <Button
              onClick={onUnlock}
              className="w-48 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
              size="default"
            >
              <Heart className="mr-2 h-4 w-4 fill-current" />
              Add Charity Tier
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/20">
              <span className="text-xs font-medium text-rose-700 dark:text-rose-300">
                ❤️ Supporting charity
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
