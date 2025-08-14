"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/tailwind";
import { LockedTierCard } from "./locked-tier-card";
import { GameDetailDrawer } from "./game-detail-drawer";
import { BookDetailDrawer } from "./book-detail-drawer";
import Image from "next/image";
import { Bundle, Product, Tier, BundleType, ProductType } from "@/app/(shared)/types/bundle";
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
  const isBookBundle = bundle.bundleType === BundleType.EBook;

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

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-3 w-3" />;
      case 'epub':
        return <BookOpen className="h-3 w-3" />;
      case 'mobi':
        return <FileType className="h-3 w-3" />;
      case 'mp3':
      case 'audio':
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
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {unlockedProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-border shadow-xs hover:shadow-lg transition-all duration-300 hover:border-primary/50 hover:scale-[1.01] hover:bg-white/95"
          >
            <div className="relative overflow-hidden">
              <Image
                sizes="500px"
                quality={80}
                width={500}
                height={500}
                src={product.headerImage}
                alt={product.title}
                className="h-auto w-full transition-all duration-300 group-hover:scale-105 group-hover:brightness-[1.02] saturate-[1.02] group-hover:saturate-[1.05]"
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
                  {product.ebookMetadata.formats && product.ebookMetadata.formats.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.ebookMetadata.formats.map((format) => (
                        <span
                          key={format}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-500 ring-1 ring-amber-500/10"
                        >
                          {getFormatIcon(format)}
                          {format}
                        </span>
                      ))}
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

        {/* Use appropriate detail drawer based on product type */}
        {selectedProduct && (
          <>
            {selectedProduct.type === ProductType.EBook ? (
              <BookDetailDrawer
                bundle={bundle}
                product={selectedProduct}
                isOpen={selectedProduct !== null}
                onClose={() => setSelectedProduct(null)}
                onNavigateToBook={setSelectedProduct}
                unlockedProducts={unlockedProducts}
              />
            ) : (
              <GameDetailDrawer
                bundle={bundle}
                product={selectedProduct}
                isOpen={selectedProduct !== null}
                onClose={() => setSelectedProduct(null)}
                onNavigateToGame={setSelectedProduct}
                unlockedProducts={unlockedProducts}
              />
            )}
          </>
        )}
      </div>
    </Card>
  );
}