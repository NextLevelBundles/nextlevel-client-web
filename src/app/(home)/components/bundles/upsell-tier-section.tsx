"use client";

import { useState, useEffect } from "react";
import {
  Gamepad2,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/tailwind";
import { Tier, Product, BundleType } from "@/app/(shared)/types/bundle";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
  totalAmount,
  onUnlock,
  onCancel,
  bundleType,
  highestBaseTierPrice,
}: UpsellTierSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const tierProducts = products.filter((p) => p.bundleTierId === tier.id);
  const isBookBundle = bundleType === BundleType.EBook;

  // Calculate minimum amount needed to unlock this tier
  // Upsell tier should be unlocked independently of charity tier
  const minimumAmountNeeded = highestBaseTierPrice + tier.price;

  useEffect(() => {
    if (!isHovered && tierProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % tierProducts.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [isHovered, tierProducts.length]);

  const handlePrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + tierProducts.length) % tierProducts.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tierProducts.length);
  };

  if (tierProducts.length === 0) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-500",
        isUnlocked
          ? "bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border border-purple-300 dark:border-purple-700"
          : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex gap-0">
        {/* Left side - Interactive product preview with 2:3 aspect ratio */}
        <div
          className="relative w-[160px] h-[240px] flex-shrink-0 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />

          {/* Sparkle effect for developer tier */}
          <div className="absolute inset-0 z-5">
            <div className="absolute top-5 left-5 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            <div className="absolute top-10 right-10 w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75" />
            <div className="absolute bottom-10 left-10 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-150" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
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
            <div className="flex items-center gap-1 mb-1">
              <Sparkles className="h-3 w-3 text-yellow-400" />
              <span className="text-[10px] text-yellow-400 font-semibold uppercase tracking-wider">
                Premium
              </span>
            </div>
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
              <div
                className={cn(
                  "p-2 rounded-full",
                  isUnlocked
                    ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                )}
              >
                <Gamepad2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Extra Items
                </h3>
                <p className="text-xs text-muted-foreground">
                  100% to developers
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-4">
              <p
                className={cn(
                  "text-xs",
                  isUnlocked
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                Support the creators directly! Unlock {tierProducts.length}{" "}
                premium {isBookBundle ? "books" : "games"}.
              </p>

              {/* Products list - more compact */}
              <div className="space-y-1 max-h-[60px] overflow-y-auto pr-2 scrollbar-thin">
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
                    <Sparkles className="h-2.5 w-2.5 text-purple-500" />
                    <span className="text-[10px] text-muted-foreground font-semibold">
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
              <span className="text-lg font-bold">+${tier.price}</span>
              <div className="flex items-center gap-1">
                {isUnlocked ? (
                  <>
                    <Unlock className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">
                      Unlocked
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500">
                      Locked
                    </span>
                  </>
                )}
              </div>
            </div>

            {!isUnlocked ? (
              <Button
                onClick={onUnlock}
                className={cn(
                  "py-2 px-4 text-xs font-semibold transition-all",
                  "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600",
                  "text-white shadow-sm hover:shadow hover:scale-[1.01]"
                )}
                size="sm"
              >
                <Gamepad2 className="mr-1 h-3 w-3" />
                Unlock Extra
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="text-center p-2 rounded bg-purple-100 dark:bg-purple-900/30">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    Supporting the developers!
                  </p>
                </div>
                <Button
                  onClick={onCancel}
                  variant="ghost"
                  className="py-1 px-3 text-xs"
                  size="sm"
                >
                  Remove Extra Items
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
