"use client";

import { useState } from "react";
import { Gamepad2, Lock, Unlock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/tailwind";
import { Tier, Product, BundleType, Bundle, BonusItem } from "@/app/(shared)/types/bundle";
import { Card } from "@/shared/components/ui/card";
import Image from "next/image";
import { ProductDetailModal } from "./product-detail-modal";
import { ArtworkDetailModal } from "./artwork-detail-modal";

type UpsellGridItem =
  | { kind: "product"; data: Product }
  | { kind: "bonus"; data: BonusItem };

interface UpsellTierSectionProps {
  tier: Tier;
  products: Product[];
  isUnlocked: boolean;
  totalAmount: number;
  onUnlock: () => void;
  onCancel: () => void;
  bundleType: BundleType;
  highestBaseTierPrice: number;
  isAvailable?: boolean;
  keysCount?: number;
  hasAvailableBaseTiers?: boolean;
  bundle?: Bundle;
  allBundleProducts?: Product[];
  allUnlockedProducts?: Product[];
  isCompact?: boolean;
}

interface UpsellTierLayoutProps {
  tier: Tier;
  tierProducts: Product[];
  allUpsellItems: UpsellGridItem[];
  isUnlocked: boolean;
  isAvailable: boolean;
  hasAvailableBaseTiers: boolean;
  keysCount?: number;
  isBookBundle: boolean;
  onUnlock: () => void;
  onCancel: () => void;
  onProductClick: (product: Product) => void;
  onBonusItemClick: (item: BonusItem) => void;
}

function GridItemCard({
  item,
  isUnlocked,
  onProductClick,
  onBonusItemClick,
  compact,
}: {
  item: UpsellGridItem;
  isUnlocked: boolean;
  onProductClick: (product: Product) => void;
  onBonusItemClick: (item: BonusItem) => void;
  compact?: boolean;
}) {
  if (item.kind === "product") {
    const product = item.data;
    return (
      <div
        onClick={() => onProductClick(product)}
        className={cn(
          "relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer transition-all",
          compact ? "w-48" : "w-full",
          isUnlocked
            ? "ring-1 ring-purple-200 dark:ring-purple-800"
            : "ring-1 ring-border opacity-60",
        )}
      >
        {product.coverImage?.url ? (
          <Image
            src={product.coverImage.url}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes={compact ? "192px" : "(max-width: 768px) 25vw, 150px"}
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
      </div>
    );
  }

  const bonus = item.data;
  return (
    <div
      onClick={() => onBonusItemClick(bonus)}
      className={cn(
        "relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer transition-all",
        compact ? "w-48" : "w-full",
        isUnlocked
          ? "ring-1 ring-purple-200 dark:ring-purple-800"
          : "ring-1 ring-border opacity-60",
      )}
    >
      {bonus.thumbnailUrl ? (
        <Image
          src={bonus.thumbnailUrl}
          alt={bonus.title}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          sizes={compact ? "192px" : "(max-width: 768px) 25vw, 150px"}
        />
      ) : (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <Gamepad2 className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent">
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-xs font-medium text-white truncate">
            {bonus.title}
          </p>
        </div>
      </div>
    </div>
  );
}

function ItemCountLabel({
  tierProducts,
  bonusItemCount,
  isBookBundle,
}: {
  tierProducts: Product[];
  bonusItemCount: number;
  isBookBundle: boolean;
}) {
  const productCount = tierProducts.length;
  const productLabel = isBookBundle
    ? productCount === 1
      ? "book"
      : "books"
    : productCount === 1
      ? "Steam key"
      : "Steam keys";

  return (
    <>
      {productCount > 0 && (
        <>
          {productCount} {productLabel}
        </>
      )}
      {bonusItemCount > 0 && (
        <>
          {productCount > 0 && " + "}
          {bonusItemCount} bonus {bonusItemCount === 1 ? "item" : "items"}
        </>
      )}
    </>
  );
}

// Regular (non-compact) layout
function RegularLayout({
  tier,
  tierProducts,
  allUpsellItems,
  isUnlocked,
  isAvailable,
  hasAvailableBaseTiers,
  keysCount,
  isBookBundle,
  onUnlock,
  onCancel,
  onProductClick,
  onBonusItemClick,
}: UpsellTierLayoutProps) {
  const bonusItemCount = tier.bonusItems?.length ?? 0;

  return (
    <div className="p-6 pb-4 relative z-0">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 rounded-full",
              isUnlocked ? "bg-purple-100 dark:bg-purple-900/30" : "bg-muted",
            )}
          >
            <Gamepad2
              className={cn(
                "h-5 w-5",
                isUnlocked
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {tier.name || "Extra Items"}
            </h3>
            <p className="text-sm text-muted-foreground">
              100% of this tier goes for this partner •{" "}
              <ItemCountLabel
                tierProducts={tierProducts}
                bonusItemCount={bonusItemCount}
                isBookBundle={isBookBundle}
              />
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-4">
        {allUpsellItems.map((item, index) => (
          <GridItemCard
            key={item.kind === "product" ? item.data.id : `bonus-${index}`}
            item={item}
            isUnlocked={isUnlocked}
            onProductClick={onProductClick}
            onBonusItemClick={onBonusItemClick}
          />
        ))}
      </div>

      {/* Availability Warning */}
      {!isAvailable && hasAvailableBaseTiers && (
        <div className="mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {keysCount === undefined
              ? "Not available in your country"
              : "Sold out"}
          </p>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={isUnlocked ? onCancel : onUnlock}
          disabled={!isAvailable && !isUnlocked}
          className={cn(
            "w-48 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
            isUnlocked
              ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/30 hover:border-purple-400 dark:hover:border-purple-600"
              : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white",
          )}
          size="default"
        >
          {isUnlocked ? (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              <span>Included • Remove</span>
            </>
          ) : (
            <>
              <Gamepad2 className="mr-2 h-4 w-4" />
              {isAvailable ? "Add Extra Items" : "Unavailable"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Compact layout (for side-by-side display on xl+ screens)
function CompactLayout({
  tier,
  allUpsellItems,
  isUnlocked,
  isAvailable,
  hasAvailableBaseTiers,
  keysCount,
  onUnlock,
  onCancel,
  onProductClick,
  onBonusItemClick,
}: UpsellTierLayoutProps) {
  return (
    <div className="p-4 pb-3 relative z-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-full",
              isUnlocked ? "bg-purple-100 dark:bg-purple-900/30" : "bg-muted",
            )}
          >
            <Gamepad2
              className={cn(
                "h-4 w-4",
                isUnlocked
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold">
              {tier.name || "Extra Items"}
            </h3>
            <p className="text-xs text-muted-foreground">
              100% of this tier goes for this partner
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xl font-bold">${tier.price}</div>
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-4 justify-items-center mb-3">
        {allUpsellItems.map((item, index) => (
          <GridItemCard
            key={item.kind === "product" ? item.data.id : `bonus-${index}`}
            item={item}
            isUnlocked={isUnlocked}
            onProductClick={onProductClick}
            onBonusItemClick={onBonusItemClick}
            compact
          />
        ))}
      </div>

      {/* Availability Warning */}
      {!isAvailable && hasAvailableBaseTiers && (
        <div className="mb-3 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {keysCount === undefined
              ? "Not available in your country"
              : "Sold out"}
          </p>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={isUnlocked ? onCancel : onUnlock}
          disabled={!isAvailable && !isUnlocked}
          className={cn(
            "w-48 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
            isUnlocked
              ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/30 hover:border-purple-400 dark:hover:border-purple-600"
              : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white",
          )}
          size="default"
        >
          {isUnlocked ? (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              <span>Included • Remove</span>
            </>
          ) : (
            <>
              <Gamepad2 className="mr-2 h-4 w-4" />
              {isAvailable ? "Add Extra Items" : "Unavailable"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function UpsellTierSection({
  tier,
  products,
  isUnlocked,
  onUnlock,
  onCancel,
  bundleType,
  isAvailable = true,
  keysCount,
  hasAvailableBaseTiers = true,
  bundle,
  allBundleProducts,
  allUnlockedProducts,
  isCompact = false,
}: UpsellTierSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBonusItem, setSelectedBonusItem] = useState<BonusItem | null>(null);
  const tierProducts = products.filter((p) => p.bundleTierId === tier.id);
  const bonusItems = tier.bonusItems ?? [];
  const isBookBundle = bundleType === BundleType.EBook;

  const allUpsellItems: UpsellGridItem[] = [
    ...tierProducts.map((p) => ({ kind: "product" as const, data: p })),
    ...bonusItems.map((b) => ({ kind: "bonus" as const, data: b })),
  ];

  if (allUpsellItems.length === 0) return null;

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBonusItemClick = (item: BonusItem) => {
    setSelectedBonusItem(item);
  };

  const layoutProps: UpsellTierLayoutProps = {
    tier,
    tierProducts,
    allUpsellItems,
    isUnlocked,
    isAvailable,
    hasAvailableBaseTiers,
    keysCount,
    isBookBundle,
    onUnlock,
    onCancel,
    onProductClick: handleProductClick,
    onBonusItemClick: handleBonusItemClick,
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 relative",
        isUnlocked
          ? "bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800"
          : "bg-gray-50/95 dark:bg-card/70 backdrop-blur-xs border-gray-100 dark:border-border shadow-xs",
        !isAvailable && hasAvailableBaseTiers && "opacity-60",
      )}
    >
      {/* Unavailability Overlay */}
      {!isAvailable && hasAvailableBaseTiers && (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/10 to-gray-900/5 dark:from-gray-900/30 dark:to-gray-900/10 z-10 pointer-events-none" />
      )}

      {/* Render appropriate layout based on compact mode and screen size */}
      {isCompact ? (
        <>
          <div className="xl:hidden">
            <RegularLayout {...layoutProps} />
          </div>
          <div className="hidden xl:block">
            <CompactLayout {...layoutProps} />
          </div>
        </>
      ) : (
        <RegularLayout {...layoutProps} />
      )}

      {/* Product Detail Modal */}
      {bundle && (
        <ProductDetailModal
          product={selectedProduct}
          bundle={bundle}
          allProducts={allBundleProducts || []}
          unlockedProducts={allUnlockedProducts || []}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onNavigateToProduct={(product) => setSelectedProduct(product)}
          allTiers={bundle.tiers}
          baseTierDisplayOrder="desc"
        />
      )}

      {/* Bonus Item Detail Modal */}
      {selectedBonusItem && (
        <ArtworkDetailModal
          isOpen={!!selectedBonusItem}
          onClose={() => setSelectedBonusItem(null)}
          artworkSrc={selectedBonusItem.thumbnailUrl}
          title={selectedBonusItem.title}
          description={selectedBonusItem.description}
          tierName={tier.name}
          tierType={tier.type}
        />
      )}
    </Card>
  );
}
