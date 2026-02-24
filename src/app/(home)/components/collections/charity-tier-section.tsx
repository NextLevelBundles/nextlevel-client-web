"use client";

import { useState } from "react";
import { Heart, Lock, Unlock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/tailwind";
import { Tier, Product, BundleType, Bundle } from "@/app/(shared)/types/bundle";
import { Card } from "@/shared/components/ui/card";
import Image from "next/image";
import { ProductDetailModal } from "./product-detail-modal";
import { ArtworkDetailModal } from "./artwork-detail-modal";

interface CharityTierSectionProps {
  tier: Tier;
  products: Product[];
  isUnlocked: boolean;
  totalAmount: number;
  onUnlock: () => void;
  onCancel: () => void;
  bundleType: BundleType;
  isAvailable?: boolean;
  keysCount?: number;
  hasAvailableBaseTiers?: boolean;
  bundle?: Bundle;
  allBundleProducts?: Product[];
  allUnlockedProducts?: Product[];
  isCompact?: boolean;
}

interface CharityTierLayoutProps {
  tier: Tier;
  tierProducts: Product[];
  allCharityItems: Product[];
  isUnlocked: boolean;
  isAvailable: boolean;
  hasAvailableBaseTiers: boolean;
  keysCount?: number;
  isBookBundle: boolean;
  onUnlock: () => void;
  onCancel: () => void;
  onProductClick: (product: Product) => void;
}

// Regular (non-compact) layout
function RegularLayout({
  tier,
  tierProducts,
  allCharityItems,
  isUnlocked,
  isAvailable,
  hasAvailableBaseTiers,
  keysCount,
  isBookBundle,
  onUnlock,
  onCancel,
  onProductClick,
}: CharityTierLayoutProps) {
  return (
    <div className="p-6 pb-4 relative z-0">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 rounded-full",
              isUnlocked ? "bg-rose-100 dark:bg-rose-900/30" : "bg-muted",
            )}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isUnlocked
                  ? "text-rose-600 dark:text-rose-400 fill-rose-600 dark:fill-rose-400"
                  : "text-muted-foreground",
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
                ? tierProducts.length === 1
                  ? "book"
                  : "books"
                : tierProducts.length === 1
                  ? "Steam key"
                  : "Steam keys"}
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
        {allCharityItems.map((product) => (
          <div
            key={product.id}
            onClick={() => onProductClick(product)}
            className={cn(
              "relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer transition-all w-full",
              isUnlocked
                ? "ring-1 ring-rose-200 dark:ring-rose-800"
                : "ring-1 ring-border opacity-60",
            )}
          >
            {product.coverImage?.url ? (
              <Image
                src={product.coverImage.url}
                alt={product.title}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
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
                {product.price > 0 && (
                  <p className="text-[10px] text-white/80">
                    ${product.price} value
                  </p>
                )}
              </div>
            </div>
          </div>
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
              ? "bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-700 hover:bg-rose-200 dark:hover:bg-rose-900/30 hover:border-rose-400 dark:hover:border-rose-600"
              : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white",
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
              <Heart className="mr-2 h-4 w-4 fill-current" />
              {isAvailable ? "Add Charity Tier" : "Unavailable"}
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
  tierProducts,
  allCharityItems,
  isUnlocked,
  isAvailable,
  hasAvailableBaseTiers,
  keysCount,
  onUnlock,
  onCancel,
  onProductClick,
}: CharityTierLayoutProps) {
  return (
    <div className="p-4 pb-3 relative z-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-full",
              isUnlocked ? "bg-rose-100 dark:bg-rose-900/30" : "bg-muted",
            )}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isUnlocked
                  ? "text-rose-600 dark:text-rose-400 fill-rose-600 dark:fill-rose-400"
                  : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold">
              {tier.name || "Charity Tier"}
            </h3>
            <p className="text-xs text-muted-foreground">
              100% of this tier goes to charity
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
        {allCharityItems.map((product) => (
          <div
            key={product.id}
            onClick={() => onProductClick(product)}
            className={cn(
              "relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer transition-all w-48",
              isUnlocked
                ? "ring-1 ring-rose-200 dark:ring-rose-800"
                : "ring-1 ring-border opacity-60",
            )}
          >
            {product.coverImage?.url ? (
              <Image
                src={product.coverImage.url}
                alt={product.title}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes="192px"
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
                {product.price > 0 && (
                  <p className="text-[10px] text-white/80">
                    ${product.price} value
                  </p>
                )}
              </div>
            </div>
          </div>
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
              ? "bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-700 hover:bg-rose-200 dark:hover:bg-rose-900/30 hover:border-rose-400 dark:hover:border-rose-600"
              : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white",
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
              <Heart className="mr-2 h-4 w-4 fill-current" />
              {isAvailable ? "Add Charity Tier" : "Unavailable"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function CharityTierSection({
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
}: CharityTierSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Product | null>(null);
  const tierProducts = products.filter((p) => p.bundleTierId === tier.id);
  const isBookBundle = bundleType === BundleType.EBook;
  const allCharityItems = tierProducts;

  if (tierProducts.length === 0) return null;

  const handleProductClick = (product: Product) => {
    if (product.id === "charity-artwork-rotis") {
      setSelectedArtwork(product);
    } else {
      setSelectedProduct(product as Product);
    }
  };

  const layoutProps: CharityTierLayoutProps = {
    tier,
    tierProducts,
    allCharityItems,
    isUnlocked,
    isAvailable,
    hasAvailableBaseTiers,
    keysCount,
    isBookBundle,
    onUnlock,
    onCancel,
    onProductClick: handleProductClick,
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 relative",
        isUnlocked
          ? "bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-800"
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

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <ArtworkDetailModal
          isOpen={!!selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          artworkSrc={selectedArtwork.coverImage?.url ?? ""}
          title={selectedArtwork.title}
          description={selectedArtwork.description || undefined}
        />
      )}
    </Card>
  );
}
