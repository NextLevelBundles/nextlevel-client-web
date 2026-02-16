"use client";

import { useState } from "react";
import { Heart, Lock, Unlock, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/tailwind";
import { Tier, Product, BundleType, Bundle } from "@/app/(shared)/types/bundle";
import { Card } from "@/shared/components/ui/card";
import Image from "next/image";
import rotisArtwork from "@/assets/arts/rotis.jpg";
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
}: CharityTierSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showArtworkModal, setShowArtworkModal] = useState(false);
  const tierProducts = products.filter((p) => p.bundleTierId === tier.id);
  const isBookBundle = bundleType === BundleType.EBook;

  // Add hard-coded artwork to charity tier products
  // const charitySupportArtwork = {
  //   id: "charity-artwork-rotis",
  //   title: "Exclusive Charity Artwork",
  //   price: 0,
  //   coverImage: { url: rotisArtwork.src },
  // };

  // Combine actual products with the artwork
  // const allCharityItems = [...tierProducts, charitySupportArtwork];
  const allCharityItems = tierProducts;

  if (tierProducts.length === 0) return null;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 relative",
        isUnlocked
          ? "bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-800"
          : "bg-card border-border",
        !isAvailable && hasAvailableBaseTiers && "opacity-60"
      )}
    >
      {/* Unavailability Overlay */}
      {!isAvailable && hasAvailableBaseTiers && (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/10 to-gray-900/5 dark:from-gray-900/30 dark:to-gray-900/10 z-10 pointer-events-none" />
      )}

      {/* Header */}
      <div className="p-6 pb-4 relative z-0">
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
                  ? tierProducts.length === 1
                    ? "book"
                    : "books"
                  : tierProducts.length === 1
                    ? "Steam key"
                    : "Steam keys"}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-4">
          {allCharityItems.map((product) => (
            <div
              key={product.id}
              onClick={() => {
                if (product.id === "charity-artwork-rotis") {
                  // Open artwork modal for the charity artwork
                  setShowArtworkModal(true);
                } else {
                  // Open product modal for regular products
                  setSelectedProduct(product as Product);
                }
              }}
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

        {/* Availability Warning - Only show if base tiers are available */}
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
        {!isUnlocked ? (
          <div className="flex justify-center">
            <Button
              onClick={onUnlock}
              disabled={!isAvailable}
              className="w-48 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              size="default"
            >
              <Heart className="mr-2 h-4 w-4 fill-current" />
              {isAvailable ? "Add Charity Tier" : "Unavailable"}
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

      {/* Product Detail Modal */}
      {bundle && (
        <ProductDetailModal
          product={selectedProduct}
          bundle={bundle}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onNavigateToProduct={(product) => setSelectedProduct(product)}
          allProducts={allBundleProducts || tierProducts}
          unlockedProducts={allUnlockedProducts || tierProducts}
        />
      )}

      {/* Artwork Detail Modal */}
      <ArtworkDetailModal
        isOpen={showArtworkModal}
        onClose={() => setShowArtworkModal(false)}
        artworkSrc={rotisArtwork.src}
        title="Exclusive Charity Artwork"
        description="This beautiful artwork is exclusively available to supporters who contribute to the Charity Tier. By adding the Charity Tier to your purchase, you receive this high-resolution digital artwork as a token of appreciation for your support. 100% of your charity tier contribution goes directly to our featured charitable cause, making a real difference while receiving this exclusive collectible."
      />
    </Card>
  );
}
