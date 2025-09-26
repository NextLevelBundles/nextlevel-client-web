"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/utils/tailwind";
import Image from "next/image";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Apple,
  AppWindow,
  MonitorSmartphone,
  Play,
  Calendar,
  User,
  Globe,
  Package,
  Gamepad2,
  Coins,
  ArrowLeftRight,
} from "lucide-react";
import { Markdown } from "@/app/(shared)/components/ui/markdown";
import { useExchangeGameDetails } from "@/hooks/queries/use-exchange-game-details";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ExchangeGameDetailsPage() {
  const params = useParams();
  const gameId = params.id as string;
  const { data: game, isLoading, error } = useExchangeGameDetails(gameId);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            </div>
            <div className="lg:w-2/3 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Game not found</h2>
          <p className="text-muted-foreground">The game you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => window.history.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const steamApp = game.steamApp;
  const screenshots = steamApp.screenshots || [];
  const videos = steamApp.movies || [];
  const mainVideo = videos.find(v => v.highlight) || videos[0];

  const allMedia = [
    steamApp.headerImage,
    ...screenshots.map(s => s.pathFull),
  ].filter(Boolean);

  const getSecureUrl = (url: string | undefined) => {
    if (!url) return undefined;
    return url.startsWith("http://") ? url.replace("http://", "https://") : url;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            fill
            src={steamApp.background || steamApp.backgroundRaw || steamApp.headerImage || "/placeholder.jpg"}
            alt={steamApp.name}
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-white drop-shadow-lg">
              {steamApp.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              {steamApp.platforms?.windows && (
                <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                  <AppWindow className="h-3 w-3 mr-1" />
                  Windows
                </Badge>
              )}
              {steamApp.platforms?.mac && (
                <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                  <Apple className="h-3 w-3 mr-1" />
                  macOS
                </Badge>
              )}
              {steamApp.platforms?.linux && (
                <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                  <MonitorSmartphone className="h-3 w-3 mr-1" />
                  Linux
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Media */}
          <div className="lg:w-2/3 space-y-6">
            {/* Main Media Display */}
            {allMedia.length > 0 && (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <Image
                  fill
                  src={getSecureUrl(allMedia[selectedImageIndex]) || "/placeholder.jpg"}
                  alt={`${steamApp.name} screenshot`}
                  className="object-cover"
                />
                {mainVideo && selectedImageIndex === 0 && (
                  <button
                    onClick={() => setShowTrailerModal(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
                  >
                    <div className="rounded-full bg-primary p-4">
                      <Play className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </button>
                )}
                {/* Navigation */}
                {allMedia.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background/90"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev + 1) % allMedia.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background/90"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Thumbnail Gallery */}
            {allMedia.length > 1 && (
              <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                <div className="flex gap-2">
                  {allMedia.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={cn(
                        "relative flex-shrink-0 w-32 aspect-video rounded-md overflow-hidden border-2 transition-all",
                        selectedImageIndex === idx
                          ? "border-primary"
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <Image
                        fill
                        src={getSecureUrl(media) || "/placeholder.jpg"}
                        alt={`Thumbnail ${idx + 1}`}
                        className="object-cover"
                      />
                      {idx === 0 && mainVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">About This Game</h2>
              {steamApp.aboutTheGame ? (
                <Markdown content={steamApp.aboutTheGame} />
              ) : steamApp.shortDescription ? (
                <p>{steamApp.shortDescription}</p>
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </div>

            {/* System Requirements */}
            {(steamApp.pcRequirements || steamApp.macRequirements || steamApp.linuxRequirements) && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">System Requirements</h2>
                <div className="grid gap-6">
                  {steamApp.pcRequirements && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AppWindow className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Windows</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {steamApp.pcRequirements.minimum && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground">Minimum</h4>
                            <div className="prose prose-sm prose-invert">
                              <Markdown content={steamApp.pcRequirements.minimum} />
                            </div>
                          </div>
                        )}
                        {steamApp.pcRequirements.recommended && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground">Recommended</h4>
                            <div className="prose prose-sm prose-invert">
                              <Markdown content={steamApp.pcRequirements.recommended} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {steamApp.macRequirements && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Apple className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">macOS</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {steamApp.macRequirements.minimum && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground">Minimum</h4>
                            <div className="prose prose-sm prose-invert">
                              <Markdown content={steamApp.macRequirements.minimum} />
                            </div>
                          </div>
                        )}
                        {steamApp.macRequirements.recommended && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground">Recommended</h4>
                            <div className="prose prose-sm prose-invert">
                              <Markdown content={steamApp.macRequirements.recommended} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {steamApp.linuxRequirements && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MonitorSmartphone className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Linux</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {steamApp.linuxRequirements.minimum && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground">Minimum</h4>
                            <div className="prose prose-sm prose-invert">
                              <Markdown content={steamApp.linuxRequirements.minimum} />
                            </div>
                          </div>
                        )}
                        {steamApp.linuxRequirements.recommended && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground">Recommended</h4>
                            <div className="prose prose-sm prose-invert">
                              <Markdown content={steamApp.linuxRequirements.recommended} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Game Info */}
          <div className="lg:w-1/3 space-y-6">
            {/* Exchange Info Card */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h2 className="text-xl font-bold">Exchange Details</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={game.status === 'Active' ? 'default' : 'secondary'}>
                    {game.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Input Credits</span>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{game.inputCredits}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Output Credits</span>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{game.outputCredits}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Exchange Now
              </Button>
            </div>

            {/* Game Details Card */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="font-semibold">Game Information</h3>
              <div className="space-y-3 text-sm">
                {steamApp.releaseDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-muted-foreground">Release Date</div>
                      <div>{steamApp.releaseDate.comingSoon ? "Coming Soon" : steamApp.releaseDate.date}</div>
                    </div>
                  </div>
                )}

                {steamApp.developers && steamApp.developers.length > 0 && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-muted-foreground">Developer</div>
                      <div>{steamApp.developers.join(", ")}</div>
                    </div>
                  </div>
                )}

                {steamApp.publishers && steamApp.publishers.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-muted-foreground">Publisher</div>
                      <div>{steamApp.publishers.join(", ")}</div>
                    </div>
                  </div>
                )}

                {steamApp.genres && steamApp.genres.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Gamepad2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-muted-foreground">Genres</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {steamApp.genres.map(genre => (
                          <Badge key={genre.id} variant="outline" className="text-xs">
                            {genre.description}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {steamApp.categories && steamApp.categories.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Gamepad2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-muted-foreground">Features</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {steamApp.categories.map(cat => (
                          <Badge key={cat.id} variant="outline" className="text-xs">
                            {cat.description}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {steamApp.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-muted-foreground">Website</div>
                      <a
                        href={steamApp.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                {steamApp.recommendations && (
                  <div className="flex items-start gap-3">
                    <Gamepad2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-muted-foreground">User Reviews</div>
                      <div>{steamApp.recommendations.total.toLocaleString()} recommendations</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Overview */}
            {steamApp.priceOverview && (
              <div className="rounded-lg border bg-card p-6 space-y-4">
                <h3 className="font-semibold">Steam Store Price</h3>
                <div className="space-y-2">
                  {steamApp.priceOverview.discountPercent > 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          -{steamApp.priceOverview.discountPercent}%
                        </Badge>
                        <span className="text-sm text-muted-foreground line-through">
                          {steamApp.priceOverview.initialFormatted}
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        {steamApp.priceOverview.finalFormatted}
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold">
                      {steamApp.priceOverview.finalFormatted}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && mainVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowTrailerModal(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              autoPlay
              controls
              className="w-full h-full"
              src={getSecureUrl(mainVideo.webm?.videoMax || mainVideo.mp4?.videoMax)}
            />
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur hover:bg-background/90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}