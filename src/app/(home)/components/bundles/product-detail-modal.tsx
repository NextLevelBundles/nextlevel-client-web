"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/utils/tailwind";
import Image from "next/image";
import { Bundle, Product, ProductType } from "@/app/(shared)/types/bundle";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Apple,
  AppWindow,
  MonitorSmartphone,
  Play,
  Lock,
  BookOpen,
  Calendar,
  User,
  FileText,
  Globe,
  Hash,
  Package,
  Gamepad2,
} from "lucide-react";
import { Markdown } from "@/app/(shared)/components/ui/markdown";
import { BundleBookFormatsResponse } from "@/lib/api/types/bundle";

interface ProductDetailModalProps {
  bundle: Bundle;
  product: Product | null;
  allProducts: Product[];
  unlockedProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProduct: (product: Product) => void;
  bookFormats?: BundleBookFormatsResponse | null;
}

export function ProductDetailModal({
  bundle,
  product,
  allProducts,
  unlockedProducts,
  isOpen,
  onClose,
  onNavigateToProduct,
  bookFormats,
}: ProductDetailModalProps) {
  const [, setIsPlaying] = useState(false);
  const [, setSelectedImageIndex] = useState(0);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [modalScreenshotIndex, setModalScreenshotIndex] = useState(0);

  useEffect(() => {
    // Reset state when product changes
    setIsPlaying(false);
    setSelectedImageIndex(0);
  }, [product?.id]);

  if (!product) return null;

  const isUnlocked = unlockedProducts.some((p) => p.id === product.id);
  const currentIndex = allProducts.findIndex((p) => p.id === product.id);

  // Parse screenshots from JSON string
  const screenshots = product.steamGameMetadata?.screenshotUrlsJson
    ? JSON.parse(product.steamGameMetadata.screenshotUrlsJson)
    : [];

  // const allMedia = [product.coverImage?.url, ...screenshots].filter(Boolean);

  const isGame = product.type === ProductType.SteamGame;
  const isBook = product.type === ProductType.EBook;

  // Ensure trailer URL uses HTTPS
  const getSecureTrailerUrl = (url: string | undefined) => {
    if (!url) return undefined;
    return url.startsWith("http://") ? url.replace("http://", "https://") : url;
  };

  // Helper function to get formats for the current product
  const getProductFormats = (): string[] => {
    if (!bookFormats || !product) return [];
    const productFormat = bookFormats.products.find(p => p.productId === product.id);
    return productFormat?.availableFormats || [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-[90vw] w-full lg:w-[1400px] max-h-[95vh] lg:max-h-[900px] h-[90vh] lg:h-[85vh] p-0 overflow-hidden flex flex-col gap-0">
        {/* Header with status indicator - always present to prevent layout shift */}
        <div
          className={cn(
            "border-b px-4 py-2 flex-shrink-0",
            isUnlocked
              ? "bg-primary/5 border-primary/10"
              : "bg-destructive/10 border-destructive/20"
          )}
        >
          <div className="flex items-center justify-center gap-2 text-sm">
            {isUnlocked ? (
              <>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="font-medium text-muted-foreground">
                  Product included in your tier
                </span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-destructive" />
                <span className="font-medium text-destructive">
                  This product is locked - Unlocks at $
                  {
                    bundle.tiers.find((t) => t.id === product.bundleTierId)
                      ?.price
                  }
                </span>
              </>
            )}
          </div>
        </div>

        {/* Main content - 2 column layout */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left column - Cover image only, fixed height */}
          <div
            className="relative flex-shrink-0 bg-black h-[40vh] lg:h-full"
            style={{ aspectRatio: "2/3" }}
          >
            <Image
              fill
              sizes="600px"
              quality={90}
              src={product.coverImage?.url || "/placeholder.jpg"}
              alt={product.title}
              className="object-cover"
            />
            {!isUnlocked && (
              <div className="absolute top-4 right-4 bg-destructive/90 backdrop-blur-sm rounded-full p-2">
                <Lock className="h-5 w-5 text-white" />
              </div>
            )}
            {/* Gradient overlay at bottom for better text visibility */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <Badge
                variant="secondary"
                className="bg-black/60 backdrop-blur-sm border-white/20"
              >
                <span className="font-semibold">${product.price}</span>
                <span className="ml-1 opacity-70">Value</span>
              </Badge>
            </div>
          </div>

          {/* Right column - Details with independent scrolling */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent p-4 lg:p-6 space-y-4 lg:space-y-5">
              {/* Title and platforms */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-3">
                  {product.title}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
                  {isGame &&
                    product.steamGameMetadata?.platforms?.includes(
                      "windows"
                    ) && (
                      <Badge variant="outline">
                        <AppWindow className="h-3 w-3 mr-1" />
                        Windows
                      </Badge>
                    )}
                  {isGame &&
                    product.steamGameMetadata?.platforms?.includes("mac") && (
                      <Badge variant="outline">
                        <Apple className="h-3 w-3 mr-1" />
                        macOS
                      </Badge>
                    )}
                  {isGame &&
                    product.steamGameMetadata?.platforms?.includes("linux") && (
                      <Badge variant="outline">
                        <MonitorSmartphone className="h-3 w-3 mr-1" />
                        Linux
                      </Badge>
                    )}
                  {isBook && (
                    <Badge variant="outline">
                      <BookOpen className="h-3 w-3 mr-1" />
                      eBook
                    </Badge>
                  )}
                  {isGame ? (
                    <Badge variant="default">
                      <Gamepad2 className="h-3 w-3 mr-1" />
                      Game
                    </Badge>
                  ) : isBook ? (
                    <Badge variant="secondary">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Book
                    </Badge>
                  ) : null}
                </div>
              </div>

              {/* Product value, tier info and trailer button */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
                >
                  <span className="font-semibold">${product.price}</span>
                  <span className="ml-1">Value</span>
                </Badge>
                {product.bundleTierId && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                    <Lock className="h-3 w-3" />
                    Tier $
                    {
                      bundle.tiers.find((t) => t.id === product.bundleTierId)
                        ?.price
                    }
                  </div>
                )}
                {isGame &&
                  getSecureTrailerUrl(
                    product.steamGameMetadata?.trailerUrl
                  ) && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowTrailerModal(true)}
                      className="h-7 px-3 text-xs"
                    >
                      <Play className="h-3 w-3 mr-1.5" />
                      Watch Trailer
                    </Button>
                  )}
              </div>

              {/* Media section for games */}
              {isGame && screenshots.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Screenshots</h4>
                  <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5 lg:gap-2">
                    {screenshots
                      .slice(0, 7)
                      .map((screenshot: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => {
                            setModalScreenshotIndex(index);
                            setShowScreenshotModal(true);
                          }}
                          className="relative aspect-video rounded overflow-hidden border border-border hover:border-primary/50 transition-all group"
                        >
                          <Image
                            fill
                            sizes="(max-width: 1024px) 100px, 150px"
                            src={screenshot}
                            alt={`Screenshot ${index + 1}`}
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </button>
                      ))}
                    {screenshots.length > 7 && (
                      <button
                        onClick={() => {
                          setModalScreenshotIndex(0);
                          setShowScreenshotModal(true);
                        }}
                        className="relative aspect-video rounded overflow-hidden border border-border hover:border-primary/50 transition-all group bg-muted/50"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-muted-foreground">
                            +{screenshots.length - 7}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            more
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Product-specific content */}
              {isGame ? (
                <GameDetails product={product} />
              ) : isBook ? (
                <BookDetails product={product} formats={getProductFormats()} />
              ) : (
                <div className="text-muted-foreground">
                  <p>{product.description}</p>
                </div>
              )}

              {/* Curator comment if exists */}
              {product.curatorComment && (
                <div className="bg-muted/30 rounded-lg p-3 lg:p-4 border border-border/50">
                  <h3 className="font-medium text-sm mb-1.5 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    Curator's Note
                  </h3>
                  <Markdown
                    content={product.curatorComment}
                    className="text-xs lg:text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with navigation - fixed at bottom */}
        <div className="border-t bg-background p-3 lg:p-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* Previous/Next navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const prevIndex =
                    (currentIndex - 1 + allProducts.length) %
                    allProducts.length;
                  onNavigateToProduct(allProducts[prevIndex]);
                }}
                disabled={allProducts.length <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {allProducts.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const nextIndex = (currentIndex + 1) % allProducts.length;
                  onNavigateToProduct(allProducts[nextIndex]);
                }}
                disabled={allProducts.length <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Product carousel */}
            <ScrollArea className="flex-1 mx-2 lg:mx-4">
              <div className="flex gap-1.5 lg:gap-2 justify-center">
                {allProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onNavigateToProduct(p)}
                    className={cn(
                      "relative flex-shrink-0 w-12 h-16 lg:w-16 lg:h-20 rounded-md overflow-hidden border-2 transition-all",
                      p.id === product.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-primary/50",
                      !unlockedProducts.some((up) => up.id === p.id) &&
                        "opacity-50"
                    )}
                  >
                    <Image
                      fill
                      sizes="64px"
                      src={p.coverImage?.url || "/placeholder.jpg"}
                      alt={p.title}
                      className="object-cover"
                    />
                    {!unlockedProducts.some((up) => up.id === p.id) && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {p.type === ProductType.EBook && (
                      <div className="absolute top-1 right-1 bg-secondary/80 rounded-full p-1">
                        <BookOpen className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {p.type === ProductType.SteamGame && (
                      <div className="absolute top-1 right-1 bg-primary/80 rounded-full p-1">
                        <Gamepad2 className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isGame && product.steamGameMetadata?.steamAppId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `https://store.steampowered.com/app/${product.steamGameMetadata?.steamAppId}`,
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Steam
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Trailer Modal */}
      {showTrailerModal &&
        getSecureTrailerUrl(product.steamGameMetadata?.trailerUrl) && (
          <Dialog open={showTrailerModal} onOpenChange={setShowTrailerModal}>
            <DialogContent className="max-w-[90vw] w-[1000px] p-0">
              <div className="relative aspect-video bg-black">
                <iframe
                  src={`${getSecureTrailerUrl(product.steamGameMetadata?.trailerUrl)}?autoplay=1`}
                  allow="autoplay; encrypted-media"
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

      {/* Screenshot Modal */}
      {showScreenshotModal && screenshots.length > 0 && (
        <Dialog
          open={showScreenshotModal}
          onOpenChange={setShowScreenshotModal}
        >
          <DialogContent className="max-w-[90vw] w-[1200px] p-0">
            <div className="relative">
              <div className="relative aspect-video bg-black">
                <Image
                  fill
                  sizes="1200px"
                  quality={95}
                  src={screenshots[modalScreenshotIndex]}
                  alt={`Screenshot ${modalScreenshotIndex + 1}`}
                  className="object-contain"
                />
              </div>
              {/* Navigation buttons */}
              {screenshots.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() =>
                      setModalScreenshotIndex(
                        (modalScreenshotIndex - 1 + screenshots.length) %
                          screenshots.length
                      )
                    }
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() =>
                      setModalScreenshotIndex(
                        (modalScreenshotIndex + 1) % screenshots.length
                      )
                    }
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm">
                      {modalScreenshotIndex + 1} / {screenshots.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

// Game-specific details component
function GameDetails({ product }: { product: Product }) {
  const metadata = product.steamGameMetadata;
  const Windows = AppWindow;

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {metadata?.protonDbTier && (
          <Badge variant="secondary">ProtonDB: {metadata.protonDbTier}</Badge>
        )}
        {metadata?.releaseDate && (
          <Badge variant="outline">
            <Calendar className="h-3 w-3 mr-1" />
            {metadata.releaseDate.date}
          </Badge>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 className="font-medium text-sm lg:text-base mb-1.5 lg:mb-2">
          About This Game
        </h3>
        <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Developers & Publishers */}
      {(metadata?.developers?.length || metadata?.publishers?.length) && (
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {metadata.developers?.length > 0 && (
            <div>
              <h4 className="text-xs lg:text-sm font-medium mb-0.5 lg:mb-1">
                Developer
              </h4>
              <p className="text-xs lg:text-sm text-muted-foreground">
                {metadata.developers.map((d) => d.name).join(", ")}
              </p>
            </div>
          )}
          {metadata.publishers?.length > 0 && (
            <div>
              <h4 className="text-xs lg:text-sm font-medium mb-0.5 lg:mb-1">
                Publisher
              </h4>
              <p className="text-xs lg:text-sm text-muted-foreground">
                {metadata.publishers.map((p) => p.name).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Supported Platforms */}
      {metadata?.platforms && metadata.platforms.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Supported Platforms</h4>
          <div className="flex flex-wrap gap-2">
            {metadata.platforms.map((platform) => (
              <Badge key={platform} variant="outline">
                {platform === "windows" || platform === "Windows" ? (
                  <>
                    <Windows className="h-3 w-3 mr-1" />
                    Windows
                  </>
                ) : platform === "mac" ||
                  platform === "Mac" ||
                  platform === "macOS" ? (
                  <>
                    <Apple className="h-3 w-3 mr-1" />
                    macOS
                  </>
                ) : platform === "linux" || platform === "Linux" ? (
                  <>
                    <MonitorSmartphone className="h-3 w-3 mr-1" />
                    Linux
                  </>
                ) : (
                  platform
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* System Requirements - Always visible, PC minimum only */}
      {metadata?.pcRequirements?.minimum && (
        <div>
          <h4 className="text-xs lg:text-sm font-medium mb-1.5 lg:mb-2">
            System Requirements
          </h4>
          <div className="bg-muted/30 p-3 lg:p-4 rounded-lg">
            <div
              className="text-xs lg:text-sm text-muted-foreground [&>strong]:font-medium [&>br]:leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: metadata.pcRequirements.minimum,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Book-specific details component
function BookDetails({ product, formats }: { product: Product; formats?: string[] }) {
  const metadata = product.ebookMetadata;

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Book metadata */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        {metadata?.author && (
          <div>
            <h4 className="text-xs lg:text-sm font-medium mb-0.5 lg:mb-1 flex items-center gap-1">
              <User className="h-3 w-3" />
              Author
            </h4>
            <p className="text-xs lg:text-sm text-muted-foreground">
              {metadata.author}
            </p>
          </div>
        )}
        {metadata?.publisher && (
          <div>
            <h4 className="text-xs lg:text-sm font-medium mb-0.5 lg:mb-1 flex items-center gap-1">
              <Package className="h-3 w-3" />
              Publisher
            </h4>
            <p className="text-xs lg:text-sm text-muted-foreground">
              {metadata.publisher}
            </p>
          </div>
        )}
        {metadata?.pageCount && (
          <div>
            <h4 className="text-xs lg:text-sm font-medium mb-0.5 lg:mb-1 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Pages
            </h4>
            <p className="text-xs lg:text-sm text-muted-foreground">
              {metadata.pageCount}
            </p>
          </div>
        )}
        {metadata?.language && (
          <div>
            <h4 className="text-xs lg:text-sm font-medium mb-0.5 lg:mb-1 flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Language
            </h4>
            <p className="text-xs lg:text-sm text-muted-foreground">
              {metadata.language}
            </p>
          </div>
        )}
        {metadata?.isbn && (
          <div>
            <h4 className="text-xs lg:text-sm font-medium mb-0.5 lg:mb-1 flex items-center gap-1">
              <Hash className="h-3 w-3" />
              ISBN
            </h4>
            <p className="text-xs lg:text-sm text-muted-foreground">
              {metadata.isbn}
            </p>
          </div>
        )}
        {metadata?.publicationDate && (
          <div>
            <h4 className="text-xs lg:text-sm font-medium mb-0.5 lg:mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Publication Date
            </h4>
            <p className="text-xs lg:text-sm text-muted-foreground">
              {metadata.publicationDate}
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 className="font-medium text-sm lg:text-base mb-1.5 lg:mb-2">
          About This Book
        </h3>
        <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Formats */}
      {(() => {
        // Use actual formats from API if available, otherwise fall back to metadata
        const displayFormats = formats && formats.length > 0 
          ? formats 
          : metadata?.availableFormats || [];
        
        if (displayFormats.length > 0) {
          return (
            <div>
              <h4 className="text-xs lg:text-sm font-medium mb-1.5 lg:mb-2">
                Available Formats
              </h4>
              <div className="flex gap-1.5 lg:gap-2">
                {displayFormats.map((format) => (
                  <Badge key={format} variant="secondary">
                    {format.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Tags/Genres */}
      {metadata?.tags && metadata.tags.length > 0 && (
        <div>
          <h4 className="text-xs lg:text-sm font-medium mb-1.5 lg:mb-2">
            Tags
          </h4>
          <div className="flex flex-wrap gap-1.5 lg:gap-2">
            {metadata.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
