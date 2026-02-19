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
  User,
} from "lucide-react";
import {
  Bundle,
  BundleType,
  CuratorType,
} from "@/app/(shared)/types/bundle";
import { useCountdownTimer } from "@/app/(shared)/hooks/useCountdownTimer";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/shared/components/ui/avatar";

// Extract YouTube video ID from embed URL
function extractVideoId(iframeSrc: string): string | null {
  const ytMatch = iframeSrc.match(
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
  );
  return ytMatch ? ytMatch[1] : null;
}

// Extract YouTube thumbnail from embed URL
function extractVideoThumbnail(iframeSrc: string): string | null {
  const id = extractVideoId(iframeSrc);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

// Game art cascade card positions (desktop)
const cascadePositions = [
  { top: "8%", right: "18%", rotate: "-3deg", delay: "200ms" },
  { top: "5%", right: "2%", rotate: "2deg", delay: "350ms" },
  { top: "38%", right: "26%", rotate: "1.5deg", delay: "500ms" },
  { top: "42%", right: "10%", rotate: "-2deg", delay: "650ms" },
];

interface CollectionHeroV4Props {
  bundle: Bundle;
}

export function CollectionHeroV4({ bundle }: CollectionHeroV4Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send a command to the YouTube iframe via postMessage
  const sendYTCommand = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*"
    );
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    sendYTCommand("unMute");
    sendYTCommand("setLoop", [false]);
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
  const hasVideo = !!bundle.curatorVideoLink;

  // Video ID and thumbnail
  const videoId = hasVideo
    ? extractVideoId(bundle.curatorVideoLink!)
    : null;
  const videoThumbnail = hasVideo
    ? extractVideoThumbnail(bundle.curatorVideoLink!)
    : null;

  // SEO image fallback for background when no video
  const seoImage = bundle.seo?.image;

  // Game images for cascade (up to 4)
  const cascadeImages = bundle.imageMedia.slice(0, 4);

  return (
    <div className="container max-w-[1560px] relative min-h-[520px] w-full overflow-hidden rounded-3xl">
      {/* === Layer 0: Background poster/fallback === */}
      <div className="absolute inset-0 pointer-events-none">
        {videoId && videoThumbnail ? (
          <Image
            src={videoThumbnail}
            alt={bundle.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : seoImage ? (
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

      {/* === Layer 1: Video iframe — always interactive with controls === */}
      {videoId && (
        <div className="absolute inset-0 z-10">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&showinfo=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: "none" }}
          />
        </div>
      )}

      {/* === Layer 2: Gradient overlay — fades out when playing === */}
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 hidden lg:flex flex-col items-center">
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

      {/* === Overlay content (fades out when playing) === */}
      <div
        className={`relative z-30 transition-opacity duration-500 ${isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        {/* === Left column: Story content === */}
        <div className="flex flex-col justify-center px-6 pt-8 pb-20 lg:px-10 lg:py-10 lg:max-w-[55%] min-h-[520px] gap-5">
          {/* Collection type badge + bundle type tag (mobile inline) */}
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
            {/* Bundle type tag — inline pill on mobile only */}
            {bundle.bundleTypeTag && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold text-xs uppercase tracking-wider lg:hidden">
                <Sparkles className="h-3 w-3" />
                {bundle.bundleTypeTag.name}
              </div>
            )}
          </div>

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight animate-fade-up"
            style={{ animationDelay: "50ms" }}
          >
            {bundle.title}
          </h1>

          {/* Play button (replaces video thumbnail) OR curator quote fallback OR icon fallback */}
          {hasVideo ? (
            <div
              className="animate-fade-up"
              style={{ animationDelay: "150ms" }}
            >
              <button
                onClick={handlePlay}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg shadow-black/30">
                  <Play className="h-7 w-7 text-gray-900 ml-0.5" />
                </div>
                <span className="text-sm text-white/70 group-hover:text-white transition-colors font-medium">
                  Watch the curator&apos;s story
                </span>
              </button>
            </div>
          ) : hasCurators && curatorQuote ? (
            <div
              className="relative max-w-sm pl-4 border-l-2 border-white/20 animate-fade-up"
              style={{ animationDelay: "150ms" }}
            >
              <p className="text-sm italic text-white/80 leading-relaxed">
                &ldquo;{curatorQuote}&rdquo;
              </p>
            </div>
          ) : !hasCurators ? (
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

          {/* Curator identity */}
          {hasCurators && (
            <div
              className="flex flex-wrap lg:flex-nowrap items-center gap-3 animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              {leadCurators.map((curator) => (
                <Link
                  key={curator.id}
                  href={`/community/profiles/${curator.customerHandle}`}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all duration-200"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-primary/50">
                    {curator.customerPictureUrl ? (
                      <AvatarImage
                        src={curator.customerPictureUrl}
                        alt={curator.customerName}
                      />
                    ) : null}
                    <AvatarFallback className="bg-white/10">
                      <User className="h-4 w-4 text-white/60" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/50 font-medium">
                      Curated by
                    </p>
                    <p className="text-sm font-semibold text-white hover:text-primary transition-colors">
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
                      className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all duration-200"
                    >
                      <Avatar className="h-7 w-7 ring-1 ring-white/30">
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
          )}

          {/* Curator quote (shown below identity if video is present) */}
          {hasVideo && curatorQuote && (
            <div
              className="relative max-w-sm animate-fade-up"
              style={{ animationDelay: "400ms" }}
            >
              <p className="text-sm italic text-white/70 leading-relaxed">
                &ldquo;{curatorQuote}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* === Right column: Game art cascade (desktop only) === */}
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

        {/* === Bottom bar: Countdown === */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-6 lg:px-10 py-4 flex items-center justify-end bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none">
          <div
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-md border shadow-lg animate-fade-up pointer-events-auto ${
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
    </div>
  );
}
