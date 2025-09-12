"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/tailwind";
import { LockedTierCard } from "./locked-tier-card";
import { ProductDetailModal } from "./product-detail-modal";
import Image from "next/image";
import {
  Bundle,
  Product,
  Tier,
  BundleType,
  ProductType,
} from "@/app/(shared)/types/bundle";
import { BookOpen, FileText, FileAudio, FileType } from "lucide-react";

interface ProductGridProps {
  id?: string;
  bundle: Bundle;
  products: Product[];
  selectedTier: Tier;
  tiers: Tier[];
  unlockedProducts: Product[];
  setTotalAmount: (amount: number) => void;
}

export function ProductGrid({
  id,
  bundle,
  selectedTier,
  products,
  unlockedProducts,
  tiers,
  setTotalAmount,
}: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const isBookBundle =
    (bundle as any).type === "EBook" || bundle.bundleType === BundleType.EBook;

  // Get locked tiers
  const selectedTierIndex = tiers.findIndex(
    (tier) => tier.id === selectedTier.id
  );

  const lockedTiers = tiers.slice(selectedTierIndex + 1);

  // Calculate cumulative items for each locked tier
  const lockedTiersWithCumulativeItems = lockedTiers.map((tier, index) => {
    const itemsInCurrentAndPreviousLockedTiers = lockedTiers
      .slice(0, index + 1)
      .reduce(
        (acc, t) => acc + products.filter((x) => x.bundleTierId == t.id).length,
        0
      );
    return {
      ...tier,
      totalItemsToUnlock: itemsInCurrentAndPreviousLockedTiers,
    };
  });

  // Create properly ordered products array: unlocked products first (by tier), then locked products (by tier)
  const orderedProducts = [
    ...unlockedProducts,
    ...lockedTiers.flatMap(tier => 
      products.filter(p => p.bundleTierId === tier.id)
    )
  ];

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case "pdf":
        return <FileText className="h-3 w-3" />;
      case "epub":
        return <BookOpen className="h-3 w-3" />;
      case "mobi":
        return <FileType className="h-3 w-3" />;
      case "mp3":
      case "audio":
        return <FileAudio className="h-3 w-3" />;
      default:
        return <FileType className="h-3 w-3" />;
    }
  };

  return (
    <Card
      id={id}
      className={cn(
        "cursor-pointer p-6 bg-gray-50/95 dark:bg-card/70 backdrop-blur-xs border border-gray-100 dark:border-border shadow-xs transition-all duration-500"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {unlockedProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-border shadow-xs hover:shadow-lg transition-all duration-300 hover:border-primary/50 hover:scale-[1.01] hover:bg-white/95"
          >
            <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 dark:bg-gray-900">
              <Image
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={80}
                src={product.coverImage?.url || "/placeholder.jpg"}
                alt={product.title}
                className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-[1.02] saturate-[1.02] group-hover:saturate-[1.05]"
              />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-rajdhani text-lg font-bold line-clamp-1 text-gray-900 dark:text-foreground">
                  {product.title}
                </h3>
                <span className="text-sm font-medium bg-blue-50 line-through text-blue-700 dark:bg-primary/20 dark:text-primary px-2 py-0.5 rounded-full">
                  ${product.price}
                </span>
              </div>

              {/* Show book metadata for book products */}
              {product.type === ProductType.EBook && product.ebookMetadata && (
                <div className="mt-3 space-y-2">
                  {product.ebookMetadata.author && (
                    <p className="text-sm text-muted-foreground">
                      by {product.ebookMetadata.author}
                    </p>
                  )}
                  {product.ebookMetadata.availableFormats &&
                    product.ebookMetadata.availableFormats.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.ebookMetadata.availableFormats.map(
                          (format) => (
                            <span
                              key={format}
                              className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-500 ring-1 ring-amber-500/10"
                            >
                              {getFormatIcon(format)}
                              {format}
                            </span>
                          )
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        ))}

        {lockedTiersWithCumulativeItems.map((tier, index) => (
          <LockedTierCard
            key={tier.id}
            tier={tier}
            bundle={bundle}
            onSelect={() => setTotalAmount(tier.price)}
            tierIndex={index}
            totalGamesToUnlock={tier.totalItemsToUnlock}
          />
        ))}

        {/* Use unified product detail modal */}
        {selectedProduct && (
          <ProductDetailModal
            bundle={bundle}
            product={selectedProduct}
            allProducts={orderedProducts}
            unlockedProducts={unlockedProducts}
            isOpen={selectedProduct !== null}
            onClose={() => setSelectedProduct(null)}
            onNavigateToProduct={setSelectedProduct}
          />
        )}
      </div>
    </Card>
  );
}
