"use client";

import { Gamepad2, Lock, Unlock, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/tailwind";
import { Tier, Product, BundleType } from "@/app/(shared)/types/bundle";
import { Card } from "@/shared/components/ui/card";
import Image from "next/image";

interface UpsellTierSectionProps {
  tier: Tier;
  products: Product[];
  isUnlocked: boolean;
  totalAmount: number;
  onUnlock: () => void;
  onCancel: () => void;
  bundleType: BundleType;
  highestBaseTierPrice: number;
}

export function UpsellTierSection({
  tier,
  products,
  isUnlocked,
  onUnlock,
  onCancel,
  bundleType,
}: UpsellTierSectionProps) {
  const tierProducts = products.filter((p) => p.bundleTierId === tier.id);
  const isBookBundle = bundleType === BundleType.EBook;

  if (tierProducts.length === 0) return null;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isUnlocked
        ? "bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800"
        : "bg-card border-border"
    )}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-full",
              isUnlocked
                ? "bg-purple-100 dark:bg-purple-900/30"
                : "bg-muted"
            )}>
              <Gamepad2 className={cn(
                "h-5 w-5",
                isUnlocked
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-muted-foreground"
              )} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Extra Items</h3>
              <p className="text-sm text-muted-foreground">
                100% to developers • {tierProducts.length} {isBookBundle ? "books" : "games"}
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

        <p className="text-sm text-muted-foreground mb-4">
          Support the creators directly with premium {isBookBundle ? "books" : "games"}
        </p>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
          {tierProducts.slice(0, 4).map((product, idx) => (
            <div
              key={product.id}
              className={cn(
                "relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer transition-all",
                isUnlocked
                  ? "ring-1 ring-purple-200 dark:ring-purple-800"
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
                  <Gamepad2 className="h-8 w-8 text-muted-foreground/50" />
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
              className="w-48 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
              size="default"
            >
              <Gamepad2 className="mr-2 h-4 w-4" />
              Add Extra Items
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                💜 Supporting developers
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
