"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useRef, useCallback } from "react";
import {
  Timer,
  BookOpen,
  Gamepad2,
  Sparkles,
  Play,
  X,
  User,
} from "lucide-react";
import {
  Bundle,
  BundleType,
  CuratorType,
  HeroMediaType,
} from "@/app/(shared)/types/bundle";
import { useCountdownTimer } from "@/app/(shared)/hooks/useCountdownTimer";
import { BundleStaticDeck } from "./collection-static-deck";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

// Extract YouTube video ID from embed URL or regular YouTube URL
function extractVideoId(url: string): string | null {
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return embedMatch[1];
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

// Extract YouTube thumbnail from URL
function extractVideoThumbnail(url: string): string | null {
  const id = extractVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

// Build YouTube embed URL from any YouTube URL
function buildEmbedUrl(url: string, params: string): string | null {
  const id = extractVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}?${params}` : null;
}

// Game art cascade card positions (desktop)
const cascadePositions = [
  { top: "8%", right: "18%", rotate: "-3deg", delay: "200ms" },
  { top: "5%", right: "2%", rotate: "2deg", delay: "350ms" },
  { top: "38%", right: "26%", rotate: "1.5deg", delay: "500ms" },
  { top: "42%", right: "10%", rotate: "-2deg", delay: "650ms" },
];

interface CollectionHeroV5Props {
  bundle: Bundle;
}

export function CollectionHeroV5({ bundle }: CollectionHeroV5Props) {
  const showProducts = false;
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // --- Hero media type ---
  const heroMedia = bundle.heroMedia;
  const heroMediaType = heroMedia?.type ?? null;
  const isYouTubeBackground = heroMediaType === HeroMediaType.YouTube;

  // Background YouTube video ID (from heroMedia, not curatorVideoLink)
  const bgVideoId = isYouTubeBackground && heroMedia?.url
    ? extractVideoId(heroMedia.url)
    : null;

  // --- Curator video (separate from background) ---
  const hasVideo = !!bundle.curatorVideoLink;
  const curatorVideoThumbnail = hasVideo
    ? extractVideoThumbnail(bundle.curatorVideoLink!)
    : null;

  // Send a command to the background YouTube iframe via postMessage
  const sendYTCommand = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*"
    );
  }, []);

  // Play/close only apply to YouTube background hero
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    sendYTCommand("unMute");
    sendYTCommand("setLoop", [false]);
  }, [sendYTCommand]);

  const handleClose = useCallback(() => {
    setIsPlaying(false);
    sendYTCommand("mute");
    sendYTCommand("setLoop", [true]);
  }, [sendYTCommand]);

  // --- Countdown logic ---
  const startDate = useMemo(
    () => new Date(bundle.startsAt),
    [bundle.startsAt]
  );
  const endDate = useMemo(() => new Date(bundle.endsAt), [bundle.endsAt]);
  const saleStartDate = useMemo(
    () => (bundle.sellFrom ? new Date(bundle.sellFrom) : startDate),
    [bundle.sellFrom, startDate]
  );
  const saleEndDate = useMemo(
    () => (bundle.sellTo ? new Date(bundle.sellTo) : endDate),
    [bundle.sellTo, endDate]
  );

  const now = new Date();
  const bundleHasStarted = now >= startDate;
  const bundleHasEnded = now > endDate;
  const saleHasStarted = now >= saleStartDate;
  const saleHasEnded = now > saleEndDate;

  let countdownTarget: string;
  let timerLabel: string;

  if (bundleHasEnded) {
    countdownTarget = bundle.endsAt;
    timerLabel = "Collection Ended";
  } else if (!bundleHasStarted) {
    if (bundle.sellFrom || bundle.sellTo) {
      if (saleHasStarted && !saleHasEnded) {
        countdownTarget = bundle.startsAt;
        timerLabel = "Exclusive Access Ends in";
      } else if (!saleHasStarted) {
        countdownTarget = bundle.sellFrom || bundle.startsAt;
        timerLabel = "Exclusive Access Starts in";
      } else {
        countdownTarget = bundle.startsAt;
        timerLabel = "Starts in";
      }
    } else {
      countdownTarget = bundle.startsAt;
      timerLabel = "Starts in";
    }
  } else {
    countdownTarget = bundle.endsAt;
    timerLabel = "Ends in";
  }

  const { timeLeft } = useCountdownTimer(countdownTarget);

  // --- Curator data ---
  const curators = bundle.curators || [];
  const leadCurators = curators.filter((c) => c.type === CuratorType.Lead);
  const guestCurators = curators.filter((c) => c.type === CuratorType.Guest);
  const leadCurator = leadCurators[0];
  const curatorQuote = leadCurator?.quote || guestCurators[0]?.quote;
  const hasCurators = curators.length > 0;

  // SEO image as final fallback
  const seoImage = bundle.seo?.image;

  // Game images for cascade (up to 4)
  const cascadeImages = bundle.imageMedia.slice(0, 4);

  return (
    <div className="container max-w-[1560px] relative min-h-[640px] lg:min-h-0 lg:aspect-video w-full overflow-hidden rounded-3xl">
      {/* === Layer 0: Dynamic background === */}
      <div className="absolute inset-0 pointer-events-none">
        {heroMediaType === HeroMediaType.ProductSlivers ? (
          /* Product slivers mosaic (like V1/stage) */
          <BundleStaticDeck
            images={bundle.imageMedia}
            title={bundle.title}
            containerClassName="w-full h-full"
            className="blur-sm scale-105"
          />
        ) : heroMediaType === HeroMediaType.Image && heroMedia?.url ? (
          /* Single image background (like V2) */
          <Image
            src={heroMedia.url}
            alt={bundle.title}
            fill
            className="object-cover blur-sm scale-105"
            sizes="100vw"
            priority
          />
        ) : bgVideoId ? (
          /* YouTube video poster as initial background */
          <Image
            src={`https://img.youtube.com/vi/${bgVideoId}/hqdefault.jpg`}
            alt={bundle.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : seoImage ? (
          /* SEO image fallback */
          <Image
            src={seoImage.url}
            alt={bundle.title}
            fill
            className="object-cover blur-sm scale-105"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700" />
        )}
      </div>

      {/* === Layer 1: YouTube background iframe (only for YouTube heroMedia) === */}
      {bgVideoId && (
        <div className="absolute inset-0 z-10">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${bgVideoId}?autoplay=1&mute=1&loop=1&playlist=${bgVideoId}&controls=1&showinfo=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: "none" }}
          />
        </div>
      )}

      {/* === Close button — centered at top edge, visible only when YouTube bg is playing === */}
      {bgVideoId && (
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ${
            isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-t-xl bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white/90 hover:text-white cursor-pointer shadow-lg transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="text-sm font-medium">Close</span>
          </button>
        </div>
      )}

      {/* === Layer 2: Gradient overlay === */}
      <div
        className={`absolute inset-0 z-20 bg-gradient-to-r from-black/85 via-black/60 to-black/30 lg:from-black/90 lg:via-black/65 lg:to-black/25 transition-opacity duration-700 ${
          isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      {/* === Bundle type banner — top center (desktop) === */}
      <div
        className={`transition-opacity duration-500 ${isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        {bundle.bundleTypeTag && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
            <div className="flex items-center gap-1.5 px-6 pt-2.5 pb-3 bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-lg shadow-black/20"
              style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 10px) 100%, 10px 100%)" }}
            >
              <Sparkles className="h-3.5 w-3.5 drop-shadow-sm" />
              <span className="text-xs font-bold uppercase tracking-wider drop-shadow-sm">
                {bundle.bundleTypeTag.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* === Overlay content (fades out when YouTube bg is playing) === */}
      <div
        className={`absolute inset-0 z-30 transition-opacity duration-500 ${isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        {/* === Left column: Story content === */}
        <div className="flex flex-col justify-start pt-16 pb-8 px-6 lg:justify-center lg:pt-10 lg:pb-10 lg:px-10 lg:max-w-[55%] h-full gap-6">
          {/* Collection type badge */}
          <div
            className="flex flex-wrap items-center gap-2 animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide ${
                bundle.type === BundleType.EBook
                  ? "bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white shadow-lg shadow-amber-500/30"
                  : "bg-gradient-to-r from-blue-500/90 to-indigo-500/90 text-white shadow-lg shadow-blue-500/30"
              } backdrop-blur-sm border border-white/20`}
            >
              {bundle.type === BundleType.EBook ? (
                <>
                  <BookOpen className="h-4 w-4" />
                  Book Collection
                </>
              ) : (
                <>
                  <Gamepad2 className="h-4 w-4" />
                  Steam Game Collection
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight animate-fade-up"
            style={{ animationDelay: "50ms" }}
          >
            {bundle.title}
          </h1>

          {/* Curator video thumbnail (below title) */}
          {hasVideo && (
            <button
              onClick={() => setVideoDialogOpen(true)}
              className="relative w-full max-w-[320px] aspect-video rounded-xl overflow-hidden ring-1 ring-white/20 shadow-xl shadow-black/30 cursor-pointer group transition-transform duration-300 hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: "150ms" }}
            >
              {curatorVideoThumbnail ? (
                <Image
                  src={curatorVideoThumbnail}
                  alt="Curator video"
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40" />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg">
                  <Play className="h-5 w-5 text-gray-900 ml-0.5" />
                </div>
              </div>
            </button>
          )}

          {/* Watch video button (mobile only, for YouTube background) */}
          {bgVideoId && (
            <div
              className="lg:hidden animate-fade-up"
              style={{ animationDelay: "180ms" }}
            >
              <button
                onClick={handlePlay}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all duration-300 cursor-pointer group"
              >
                <Play className="h-4 w-4 text-white/80 group-hover:text-white" />
                <span className="text-sm text-white/80 group-hover:text-white transition-colors font-medium">
                  Watch video
                </span>
              </button>
            </div>
          )}

          {/* Fallbacks when no curator video: quote or icon */}
          {!hasVideo && hasCurators && curatorQuote ? (
            <div
              className="relative max-w-sm pl-4 border-l-2 border-white/20 animate-fade-up"
              style={{ animationDelay: "150ms" }}
            >
              <p className="text-sm italic text-white/80 leading-relaxed">
                &ldquo;{curatorQuote}&rdquo;
              </p>
            </div>
          ) : !hasVideo && !hasCurators ? (
            <div
              className="flex items-center justify-center w-20 h-20 rounded-full bg-white/10 border border-white/20 animate-fade-up"
              style={{ animationDelay: "150ms" }}
            >
              {bundle.type === BundleType.EBook ? (
                <BookOpen className="h-10 w-10 text-white/50" />
              ) : (
                <Gamepad2 className="h-10 w-10 text-white/50" />
              )}
            </div>
          ) : null}

        </div>

        {/* === Right column: Watch video button (desktop, centered) === */}
        {bgVideoId && (
          <div
            className="absolute right-0 top-0 bottom-0 left-[55%] z-10 hidden lg:flex items-center justify-center animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <button
              onClick={handlePlay}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all duration-300 cursor-pointer group"
            >
              <Play className="h-5 w-5 text-white/80 group-hover:text-white" />
              <span className="text-base text-white/80 group-hover:text-white transition-colors font-medium">
                Watch video
              </span>
            </button>
          </div>
        )}

        {/* === Right column: Game art cascade (desktop only) === */}
        {showProducts && (
          <div className="absolute right-0 top-0 bottom-0 left-[50%] z-10 hidden lg:block">
            <div className="relative w-full h-full">
              {cascadeImages.map((image, index) => {
                const pos = cascadePositions[index];
                if (!pos) return null;
                return (
                  <div
                    key={image.id}
                    className="absolute w-[200px] h-[280px] rounded-xl overflow-hidden shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-2.5 hover:shadow-[0_30px_50px_-12px_rgba(0,0,0,0.6)] hover:brightness-110 animate-fade-up"
                    style={{
                      top: pos.top,
                      right: pos.right,
                      transform: `rotate(${pos.rotate})`,
                      animationDelay: pos.delay,
                    }}
                  >
                    <Image
                      src={image.url}
                      alt={`${bundle.title} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                      priority={index <= 1}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === Bottom bar: Curators (left) + Countdown (right) === */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-6 lg:px-10 py-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none">
          {/* Curators */}
          {hasCurators ? (
            <div
              className={`flex flex-col gap-2 animate-fade-up ${isPlaying ? "pointer-events-none" : "pointer-events-auto"}`}
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex flex-wrap items-center gap-3">
                {leadCurators.map((curator) => (
                  <Link
                    key={curator.id}
                    href={`/community/profiles/${curator.customerHandle}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-all duration-200"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-primary/50">
                      {curator.customerPictureUrl ? (
                        <AvatarImage
                          src={curator.customerPictureUrl}
                          alt={curator.customerName}
                        />
                      ) : null}
                      <AvatarFallback className="bg-white/10">
                        <User className="h-3.5 w-3.5 text-white/60" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/50 font-medium leading-none mb-0.5">
                        Curated by
                      </p>
                      <p className="text-sm font-semibold text-white hover:text-primary transition-colors leading-none">
                        {curator.customerName}
                      </p>
                    </div>
                  </Link>
                ))}
                {guestCurators.length > 0 && (
                  <div className="flex items-center gap-2 ml-1">
                    <span className="text-white/30">|</span>
                    {guestCurators.map((curator) => (
                      <Link
                        key={curator.id}
                        href={`/community/profiles/${curator.customerHandle}`}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-all duration-200"
                      >
                        <Avatar className="h-6 w-6 ring-1 ring-white/30">
                          {curator.customerPictureUrl ? (
                            <AvatarImage
                              src={curator.customerPictureUrl}
                              alt={curator.customerName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-white/10">
                            <User className="h-3 w-3 text-white/60" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-white/70 hover:text-primary transition-colors">
                          {curator.customerName}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {curatorQuote && (
                <p className="text-xs italic text-white/60 leading-relaxed max-w-sm">
                  &ldquo;{curatorQuote}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}

          {/* Countdown */}
          <div
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-md border shadow-lg animate-fade-up self-start lg:self-auto ${isPlaying ? "pointer-events-none" : "pointer-events-auto"} ${
              bundleHasEnded
                ? "bg-red-500/15 border-red-500/30 text-red-300"
                : "bg-white/10 border-white/20 text-white"
            }`}
            style={{ animationDelay: "250ms" }}
          >
            <Timer className="h-4 w-4 opacity-70" />
            <span className="text-xs uppercase tracking-wide opacity-70">
              {timerLabel}
            </span>
            <span className="font-mono font-bold text-base">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* === Curator Video Dialog === */}
      {hasVideo && (
        <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
          <DialogContent className="max-w-4xl p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Curator Video</DialogTitle>
            </DialogHeader>
            <div className="aspect-video w-full">
              <iframe
                src={bundle.curatorVideoLink!}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
