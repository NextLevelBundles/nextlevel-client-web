"use client";

import { useState, useEffect } from "react";
import { Heart, Lock, Unlock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/tailwind";
import { Tier, Product, BundleType } from "@/app/(shared)/types/bundle";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
  totalAmount,
  onUnlock,
  onCancel,
  bundleType,
}: CharityTierSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const tierProducts = products.filter((p) => p.bundleTierId === tier.id);
  const isBookBundle = bundleType === BundleType.EBook;

  useEffect(() => {
    if (!isHovered && tierProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % tierProducts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isHovered, tierProducts.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + tierProducts.length) % tierProducts.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tierProducts.length);
  };

  if (tierProducts.length === 0) return null;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl transition-all duration-500",
      isUnlocked
        ? "bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-rose-950/30 dark:via-pink-950/30 dark:to-rose-950/30 border border-rose-300 dark:border-rose-700"
        : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700"
    )}>
      <div className="flex gap-0">
        {/* Left side - Interactive product preview with 2:3 aspect ratio */}
        <div
          className="relative w-[160px] h-[240px] flex-shrink-0 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {tierProducts[currentIndex]?.coverImage?.url && (
                <Image
                  src={tierProducts[currentIndex].coverImage.url}
                  alt={tierProducts[currentIndex].title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          {tierProducts.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </>
          )}

          {/* Product info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
            <h4 className="text-xs font-bold text-white mb-0.5 drop-shadow-lg truncate">
              {tierProducts[currentIndex]?.title}
            </h4>
            <p className="text-[10px] text-white/90 drop-shadow-lg">
              {currentIndex + 1} of {tierProducts.length}
            </p>
          </div>

          {/* Thumbnail strip */}
          {tierProducts.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 p-4 z-20">
              {tierProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === currentIndex
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right side - Information and CTA */}
        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                "p-2 rounded-full",
                isUnlocked
                  ? "bg-rose-500 text-white"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
              )}>
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Charity Tier
                </h3>
                <p className="text-xs text-muted-foreground">
                  100% goes to charity
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-4">
              <p className={cn(
                "text-xs",
                isUnlocked ? "text-gray-700 dark:text-gray-300" : "text-gray-600 dark:text-gray-400"
              )}>
                Unlock {tierProducts.length} additional {isBookBundle ? "books" : "games"} while supporting
                incredible charities.
              </p>

              {/* Products list - more compact */}
              <div className="space-y-1 max-h-[80px] overflow-y-auto pr-2 scrollbar-thin">
                {tierProducts.map((product) => (
                  <div
                    key={product.id}
                    className={cn(
                      "flex items-center gap-2 p-1.5 rounded transition-all",
                      isUnlocked
                        ? "bg-white/50 dark:bg-white/10"
                        : "bg-gray-200/50 dark:bg-gray-700/50 opacity-60"
                    )}
                  >
                    {product.coverImage?.url && (
                      <Image
                        src={product.coverImage.url}
                        alt={product.title}
                        width={20}
                        height={30}
                        className="rounded object-cover"
                      />
                    )}
                    <span className="text-[11px] font-medium truncate flex-1">
                      {product.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ${product.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">
                ${tier.price}
              </span>
              <div className="flex items-center gap-1">
                {isUnlocked ? (
                  <>
                    <Unlock className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Unlocked</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500">Locked</span>
                  </>
                )}
              </div>
            </div>

            {!isUnlocked ? (
              <Button
                onClick={onUnlock}
                className={cn(
                  "py-2 px-4 text-xs font-semibold transition-all",
                  "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600",
                  "text-white shadow-sm hover:shadow hover:scale-[1.01]"
                )}
                size="sm"
              >
                <Heart className="mr-1 h-3 w-3 fill-current" />
                Unlock Charity
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="text-center p-2 rounded bg-rose-100 dark:bg-rose-900/30">
                  <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
                    Thank you for supporting charity!
                  </p>
                </div>
                <Button
                  onClick={onCancel}
                  variant="ghost"
                  className="py-1 px-3 text-xs"
                  size="sm"
                >
                  Remove Charity Tier
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}