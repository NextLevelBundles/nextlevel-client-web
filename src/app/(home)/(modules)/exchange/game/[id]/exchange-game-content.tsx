"use client";

import { useState } from "react";
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
  Loader2,
} from "lucide-react";
import { Markdown } from "@/app/(shared)/components/ui/markdown";
import { ExchangeGame } from "@/lib/api/types/exchange-game";
import { useExchangeCreditsForKey } from "@/hooks/queries/use-exchange";
import { useUserCredits } from "@/hooks/queries/use-user-credits";
import { useRouter } from "next/navigation";

interface ExchangeGameContentProps {
  game: ExchangeGame;
}

export function ExchangeGameContent({ game }: ExchangeGameContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const exchangeCreditsForKeyMutation = useExchangeCreditsForKey();
  const { data: userCredits = 0 } = useUserCredits();
  const router = useRouter();

  const steamApp = game.steamApp;
  const isExchanging = exchangeCreditsForKeyMutation.isPending;
  const canAfford = userCredits >= game.inputCredits;

  const handleExchange = () => {
    if (!canAfford || isExchanging) return;

    // The API expects the Steam App ID as a number
    exchangeCreditsForKeyMutation.mutate(steamApp.id, {
      onSuccess: () => {
        // Optionally redirect to customer dashboard or refresh the page
        router.push('/customer/dashboard');
      }
    });
  };
  const screenshots = steamApp.screenshots || [];
  const videos = steamApp.movies || [];
  const mainVideo = videos.find(v => v.highlight) || videos[0];

  const allMedia = [
    ...screenshots.map(s => s.pathFull),
  ].filter(Boolean);

  const getSecureUrl = (url: string | undefined) => {
    if (!url) return undefined;
    return url.startsWith("http://") ? url.replace("http://", "https://") : url;
  };

  return (
    <>
      {/* Title and Platforms */}
      <div className="mb-6">
        <h1 className="text-3xl lg:text-4xl font-bold mb-3">
          {steamApp.name}
        </h1>
        {/* Supported Platforms */}
        {steamApp.platforms && (
          <div>
            <h4 className="text-sm font-medium mb-2">Supported Platforms</h4>
            <div className="flex flex-wrap gap-2">
              {steamApp.platforms.windows && (
                <Badge variant="outline">
                  <AppWindow className="h-3 w-3 mr-1" />
                  Windows
                </Badge>
              )}
              {steamApp.platforms.mac && (
                <Badge variant="outline">
                  <Apple className="h-3 w-3 mr-1" />
                  macOS
                </Badge>
              )}
              {steamApp.platforms.linux && (
                <Badge variant="outline">
                  <MonitorSmartphone className="h-3 w-3 mr-1" />
                  Linux
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Media */}
        <div className="lg:w-2/3 space-y-6">
          {/* Main Media Display */}
          {allMedia.length > 0 && (
            <div className="relative aspect-video bg-muted/50 border rounded-lg overflow-hidden">
              <Image
                fill
                src={getSecureUrl(allMedia[selectedImageIndex]) || "/placeholder.jpg"}
                alt={`${steamApp.name} screenshot`}
                className="object-contain bg-black/5"
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
                      "relative flex-shrink-0 w-32 aspect-video rounded-md overflow-hidden border-2 transition-all bg-muted/30",
                      selectedImageIndex === idx
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border/50 hover:border-border"
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
              <div className="space-y-4">
                {steamApp.pcRequirements && (
                  <div className="rounded-lg border bg-card/50 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <AppWindow className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold">Windows</h3>
                    </div>
                    <div className="space-y-4">
                      <div
                        className="text-sm text-muted-foreground space-y-1 [&>strong]:text-foreground [&>strong]:font-medium [&>br]:leading-relaxed [&>ul]:ml-4 [&>ul]:list-disc"
                        dangerouslySetInnerHTML={{ __html:
                          (steamApp.pcRequirements.minimum && steamApp.pcRequirements.recommended)
                            ? steamApp.pcRequirements.minimum + '<br/><br/>' + steamApp.pcRequirements.recommended
                            : steamApp.pcRequirements.minimum || steamApp.pcRequirements.recommended || ''
                        }}
                      />
                    </div>
                  </div>
                )}
                {steamApp.macRequirements && (
                  <div className="rounded-lg border bg-card/50 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <Apple className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold">macOS</h3>
                    </div>
                    <div className="space-y-4">
                      <div
                        className="text-sm text-muted-foreground space-y-1 [&>strong]:text-foreground [&>strong]:font-medium [&>br]:leading-relaxed [&>ul]:ml-4 [&>ul]:list-disc"
                        dangerouslySetInnerHTML={{ __html:
                          (steamApp.macRequirements.minimum && steamApp.macRequirements.recommended)
                            ? steamApp.macRequirements.minimum + '<br/><br/>' + steamApp.macRequirements.recommended
                            : steamApp.macRequirements.minimum || steamApp.macRequirements.recommended || ''
                        }}
                      />
                    </div>
                  </div>
                )}
                {steamApp.linuxRequirements && (
                  <div className="rounded-lg border bg-card/50 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <MonitorSmartphone className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold">Linux</h3>
                    </div>
                    <div className="space-y-4">
                      <div
                        className="text-sm text-muted-foreground space-y-1 [&>strong]:text-foreground [&>strong]:font-medium [&>br]:leading-relaxed [&>ul]:ml-4 [&>ul]:list-disc"
                        dangerouslySetInnerHTML={{ __html:
                          (steamApp.linuxRequirements.minimum && steamApp.linuxRequirements.recommended)
                            ? steamApp.linuxRequirements.minimum + '<br/><br/>' + steamApp.linuxRequirements.recommended
                            : steamApp.linuxRequirements.minimum || steamApp.linuxRequirements.recommended || ''
                        }}
                      />
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
            <h2 className="text-xl font-bold">Claim This Game</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Credits Required</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-lg">{game.inputCredits}</span>
                </div>
              </div>

              {/* Show user's current credits */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Credits</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-muted-foreground" />
                  <span className={userCredits >= game.inputCredits ? "text-green-600" : "text-red-600"}>
                    {userCredits}
                  </span>
                </div>
              </div>

              {userCredits >= game.inputCredits ? (
                <p className="text-xs text-muted-foreground">
                  Spend {game.inputCredits} credits to claim this game and add it to your library.
                </p>
              ) : (
                <p className="text-xs text-red-600">
                  You need {game.inputCredits - userCredits} more credits to claim this game.
                </p>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!canAfford || isExchanging}
              variant={canAfford ? "default" : "secondary"}
              onClick={handleExchange}
            >
              {isExchanging ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : canAfford ? (
                <>
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Claim Game
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Need {game.inputCredits - userCredits} More Credits
                </>
              )}
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

            {/* Features - Simple text list at the bottom */}
            {steamApp.categories && steamApp.categories.length > 0 && (
              <div className="pt-3 mt-3 border-t">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Features:</span>{" "}
                  {steamApp.categories.map(cat => cat.description).join(", ")}
                </div>
              </div>
            )}
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
    </>
  );
}