"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import {
  ImageIcon,
  ExternalLink,
  Play,
  ChevronDown,
  ChevronUp,
  Heart,
} from "lucide-react";
import { useGameDetail } from "@/hooks/queries/useGameDetail";
import { useAuth } from "@/shared/providers/auth-provider";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useCustomerCollection } from "@/hooks/queries/useCustomerCollection";
import {
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@/hooks/queries/useCustomerLists";
import type {
  GameDetail,
  GameDetailReleaseDate,
  GameDetailRelatedGame,
  GameDetailWebsite,
} from "@/lib/api/types/game";
import type { CustomerGame } from "@/lib/api/types/customer-profile";

// --- Helpers ---

function getIgdbImageUrl(imageId: string, size: string) {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

function getYouTubeThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function formatReleaseDate(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getReleaseYear(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.getFullYear();
}

// Maps organization + rating strings from IGDB to local image paths
const AGE_RATING_IMAGES: Record<string, Record<string, string>> = {
  ESRB: {
    EC: "/ratings/esrb-ec.svg",
    "Early Childhood": "/ratings/esrb-ec.svg",
    E: "/ratings/esrb-e.svg",
    Everyone: "/ratings/esrb-e.svg",
    E10: "/ratings/esrb-e10.svg",
    "Everyone 10+": "/ratings/esrb-e10.svg",
    T: "/ratings/esrb-t.svg",
    Teen: "/ratings/esrb-t.svg",
    M: "/ratings/esrb-m.svg",
    "Mature 17+": "/ratings/esrb-m.svg",
    Mature: "/ratings/esrb-m.svg",
    AO: "/ratings/esrb-ao.svg",
    "Adults Only": "/ratings/esrb-ao.svg",
    "Adults Only 18+": "/ratings/esrb-ao.svg",
    RP: "/ratings/esrb-rp.svg",
    "Rating Pending": "/ratings/esrb-rp.svg",
  },
  PEGI: {
    Three: "/ratings/pegi-3.png",
    "3": "/ratings/pegi-3.png",
    Seven: "/ratings/pegi-7.png",
    "7": "/ratings/pegi-7.png",
    Twelve: "/ratings/pegi-12.png",
    "12": "/ratings/pegi-12.png",
    Sixteen: "/ratings/pegi-16.png",
    "16": "/ratings/pegi-16.png",
    Eighteen: "/ratings/pegi-18.png",
    "18": "/ratings/pegi-18.png",
  },
};

function getAgeRatingImage(
  organization: string | null,
  rating: string | null
): string | null {
  if (!organization || !rating) return null;
  return AGE_RATING_IMAGES[organization]?.[rating] ?? null;
}

const WEBSITE_TYPE_LABELS: Record<number, string> = {
  1: "Official",
  2: "Wikia",
  3: "Wikipedia",
  4: "Facebook",
  5: "Twitter",
  6: "Twitch",
  8: "Instagram",
  9: "YouTube",
  10: "iPhone",
  11: "iPad",
  12: "Android",
  13: "Steam",
  14: "Reddit",
  15: "Itch",
  16: "Epic Games",
  17: "GOG",
  18: "Discord",
};

// --- Status Constants ---

const PLAY_STATUS_LABELS: Record<string, string> = {
  NoStatus: "No Status",
  Unplayed: "Unplayed",
  Playing: "Playing",
  Played: "Played",
};

const PLAY_STATUS_COLORS: Record<string, string> = {
  NoStatus: "bg-muted text-muted-foreground",
  Unplayed: "bg-zinc-600 text-zinc-100",
  Playing: "bg-green-600 text-white",
  Played: "bg-blue-600 text-white",
};

const COMPLETION_STATUS_COLORS: Record<string, string> = {
  Unfinished: "bg-yellow-600 text-white",
  Beaten: "bg-indigo-600 text-white",
  Completed: "bg-purple-600 text-white",
  Continuous: "bg-cyan-600 text-white",
  Dropped: "bg-red-600 text-white",
};

// --- Sub-Components ---

function RatingCircle({
  value,
  label,
  size = 64,
}: {
  value: number | null;
  label: string;
  size?: number;
}) {
  if (value == null) return null;
  const rounded = Math.round(value);
  const circumference = 2 * Math.PI * 24;
  const offset = circumference - (rounded / 100) * circumference;
  const color =
    rounded >= 75
      ? "text-green-500"
      : rounded >= 50
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox="0 0 56 56"
        >
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted/30"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          {rounded}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function ExpandableText({ text, maxLength = 300 }: { text: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = text.length > maxLength;

  return (
    <div>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {expanded || !needsTruncate ? text : `${text.slice(0, maxLength)}...`}
      </p>
      {needsTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs text-primary hover:underline inline-flex items-center gap-0.5"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Read more <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

function MediaGrid({ game }: { game: GameDetail }) {
  const videos = game.videos.filter((v) => v.videoId);
  const screenshots = game.screenshots.filter((s) => s.imageId);
  const artworks = game.artworks.filter((a) => a.imageId);

  if (videos.length === 0 && screenshots.length === 0 && artworks.length === 0)
    return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Media
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {videos.map((v) => (
          <a
            key={v.videoId}
            href={`https://www.youtube.com/watch?v=${v.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-video rounded overflow-hidden bg-muted/50 group"
          >
            <Image
              src={getYouTubeThumbnail(v.videoId!)}
              alt={v.name || "Video"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
            {v.name && (
              <span className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] text-white bg-gradient-to-t from-black/70 truncate">
                {v.name}
              </span>
            )}
          </a>
        ))}
        {screenshots.map((s, i) => (
          <div
            key={`ss-${i}`}
            className="relative aspect-video rounded overflow-hidden bg-muted/50"
          >
            <Image
              src={getIgdbImageUrl(s.imageId!, "screenshot_med")}
              alt={`Screenshot ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </div>
        ))}
        {artworks.map((a, i) => (
          <div
            key={`art-${i}`}
            className="relative aspect-video rounded overflow-hidden bg-muted/50"
          >
            <Image
              src={getIgdbImageUrl(a.imageId!, "screenshot_med")}
              alt={`Artwork ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedGamesSection({ games }: { games: GameDetailRelatedGame[] }) {
  if (games.length === 0) return null;

  const grouped: Record<string, GameDetailRelatedGame[]> = {};
  for (const g of games) {
    if (!grouped[g.relationship]) grouped[g.relationship] = [];
    grouped[g.relationship].push(g);
  }

  const tabs = Object.keys(grouped);
  if (tabs.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Related Games
      </h3>
      <Tabs defaultValue={tabs[0]} className="w-full">
        <TabsList className="w-full justify-start">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="text-xs">
              {tab}s ({grouped[tab].length})
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-3">
              {grouped[tab].map((rg) => (
                <div key={rg.igdbId} className="space-y-1">
                  <div className="aspect-[3/4] rounded overflow-hidden bg-muted/50 relative">
                    {rg.coverImageId ? (
                      <Image
                        src={getIgdbImageUrl(rg.coverImageId, "cover_big")}
                        alt={rg.name || "Related game"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate" title={rg.name ?? undefined}>
                    {rg.name}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function WebsiteLinks({ websites }: { websites: GameDetailWebsite[] }) {
  const validWebsites = websites.filter((w) => w.url && w.type != null);
  if (validWebsites.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {validWebsites.map((w, i) => (
        <a
          key={i}
          href={w.url!}
          target="_blank"
          rel="noopener noreferrer"
          title={WEBSITE_TYPE_LABELS[w.type!] ?? "Link"}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-semibold"
        >
          {WEBSITE_TYPE_SHORT[w.type!] ?? <ExternalLink className="h-3.5 w-3.5" />}
        </a>
      ))}
    </div>
  );
}

const WEBSITE_TYPE_SHORT: Record<number, string> = {
  1: "\u{1F310}",  // Official — globe
  2: "W",    // Wikia
  3: "W",    // Wikipedia
  4: "f",    // Facebook
  5: "\u{1D54F}",  // Twitter — 𝕏
  6: "\u{25B6}",   // Twitch — play symbol
  8: "\u{1F4F7}",  // Instagram — camera
  9: "\u{25B6}",   // YouTube — play
  10: "\u{F8FF}",  // iPhone
  11: "\u{F8FF}",  // iPad
  12: "\u{1F4F1}", // Android
  13: "S",   // Steam
  14: "r/",  // Reddit
  15: "it",  // Itch
  16: "E",   // Epic
  17: "G",   // GOG
  18: "D",   // Discord
};

function InfoBlock({
  label,
  values,
}: {
  label: string;
  values: (string | null | undefined)[];
}) {
  const filtered = values.filter(Boolean) as string[];
  if (filtered.length === 0) return null;
  return (
    <div className="space-y-0.5">
      <h4 className="text-sm font-semibold">{label}</h4>
      {filtered.map((v, i) => (
        <p key={i} className="text-sm text-muted-foreground">
          {v}
        </p>
      ))}
    </div>
  );
}

const REGION_FLAGS: Record<string, string> = {
  "North America": "\u{1F1FA}\u{1F1F8}",
  "Europe": "\u{1F1EA}\u{1F1FA}",
  "Japan": "\u{1F1EF}\u{1F1F5}",
  "Australia": "\u{1F1E6}\u{1F1FA}",
  "New Zealand": "\u{1F1F3}\u{1F1FF}",
  "China": "\u{1F1E8}\u{1F1F3}",
  "South Korea": "\u{1F1F0}\u{1F1F7}",
  "Brazil": "\u{1F1E7}\u{1F1F7}",
  "Worldwide": "\u{1F30D}",
};

function getRegionFlag(region: string | null): string {
  if (!region) return "\u{1F30D}";
  return REGION_FLAGS[region] ?? "\u{1F3F3}\u{FE0F}";
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

// --- Release Dates grouped by platform ---

function ReleaseDatesByPlatform({
  releaseDates,
}: {
  releaseDates: GameDetailReleaseDate[];
}) {
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  // Group by platform
  const grouped = releaseDates.reduce<
    Record<string, { region: string | null; date: number | null }[]>
  >((acc, rd) => {
    const platform = rd.platformName ?? "Unknown";
    if (!acc[platform]) acc[platform] = [];
    acc[platform].push({ region: rd.region, date: rd.date });
    return acc;
  }, {});

  return (
    <div className="space-y-0">
      {Object.entries(grouped).map(([platform, dates]) => {
        const primary = dates[0];
        const hasMultiple = dates.length > 1;
        const isExpanded = expandedPlatform === platform;

        return (
          <div key={platform} className="border-b border-border/30 py-1.5 space-y-0.5">
            {dates.map((d, i) => {
              const isFirst = i === 0;
              const isHidden = !isFirst && !isExpanded;
              if (isHidden) return null;

              return (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="text-muted-foreground shrink-0">
                    {isFirst ? platform : ""}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>
                      {getRegionFlag(d.region)}{" "}
                      {d.date ? formatReleaseDate(d.date) : "TBA"}
                    </span>
                    {isFirst && hasMultiple ? (
                      <button
                        onClick={() =>
                          setExpandedPlatform(isExpanded ? null : platform)
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors w-3.5"
                      >
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    ) : hasMultiple ? (
                      <span className="w-3.5" />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// --- Collection Status (readonly badges) ---

function CollectionStatusBadges({
  collectionGame,
}: {
  collectionGame: CustomerGame | null;
}) {
  const playStatus = collectionGame?.playStatus || "NoStatus";
  const completionStatus = collectionGame?.completionStatus;

  if (!collectionGame) {
    return <p className="text-xs text-muted-foreground">Not in collection</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <span
        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${PLAY_STATUS_COLORS[playStatus]}`}
      >
        {PLAY_STATUS_LABELS[playStatus]}
      </span>
      {completionStatus && (
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${COMPLETION_STATUS_COLORS[completionStatus] ?? "bg-muted text-muted-foreground"}`}
        >
          {completionStatus}
        </span>
      )}
    </div>
  );
}

// --- Loading skeleton ---

function GameDetailSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6">
        <div className="flex gap-6">
          <Skeleton className="w-[170px] h-[230px] rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded" />
          ))}
        </div>
      </div>
      <div className="w-full lg:w-72 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main Page ---

export default function GameDetailPage() {
  const params = useParams();
  const username = params.username as string;
  const slug = params.slug as string;
  const { data: game, isLoading } = useGameDetail(slug);
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { data: customer } = useCustomer();
  const isOwnProfile = customer?.handle === username;
  const { data: collection } = useCustomerCollection(username);
  const collectionGame =
    collection?.find((g) => g.slug === slug) ?? null;

  // Wishlist logic — own wishlist (for toggle on own profile, or "Add to My Wishlist" on other profiles)
  const { data: myWishlistDetail } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  // Visited user's wishlist (for showing their wishlist status on non-own profiles)
  const { data: profileWishlistDetail } = useWishlist(isOwnProfile ? undefined : username);

  const igdbId = game?.igdbId ?? 0;

  // Own wishlist state
  const myWishListItem = myWishlistDetail?.items.find(
    (item) => item.gameId === igdbId
  );
  const isInMyWishList = !!myWishListItem;

  // Visited profile's wishlist state
  const profileWishListItem = profileWishlistDetail?.items.find(
    (item) => item.gameId === igdbId
  );
  const isInProfileWishList = !!profileWishListItem;

  const wishlistPending =
    addToWishlist.isPending || removeFromWishlist.isPending;

  function handleWishlistToggle() {
    if (!igdbId) return;
    if (isInMyWishList && myWishListItem) {
      removeFromWishlist.mutate(myWishListItem.id);
    } else {
      addToWishlist.mutate({ gameId: igdbId });
    }
  }

  if (isLoading) {
    return <GameDetailSkeleton />;
  }

  if (!game) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Game not found</h2>
        <p className="text-muted-foreground">
          The game you&apos;re looking for doesn&apos;t exist or hasn&apos;t been synced yet.
        </p>
        <Link
          href={`/community/profiles/${username}/collection`}
          className="text-primary hover:underline text-sm mt-4 inline-block"
        >
          Back to Collection
        </Link>
      </div>
    );
  }

  const releaseYear = getReleaseYear(game.firstReleaseDate);
  const developerName = game.developers[0]?.name;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left column — main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Hero section */}
        <div className="flex gap-6">
          {/* Cover + status controls */}
          <div className="flex flex-col gap-3 flex-shrink-0">
            <div className="w-[170px] h-[230px] rounded-lg overflow-hidden bg-muted/50">
              {game.coverImageId ? (
                <Image
                  src={getIgdbImageUrl(game.coverImageId, "cover_big")}
                  alt={game.name || "Game cover"}
                  width={170}
                  height={230}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {isAuthenticated && (
              <CollectionStatusBadges collectionGame={collectionGame} />
            )}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold leading-tight">
                  {game.name}
                  {releaseYear && (
                    <span className="text-muted-foreground font-normal ml-2">
                      ({releaseYear})
                    </span>
                  )}
                </h1>
                {developerName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {developerName}
                  </p>
                )}
              </div>
              {isAuthenticated && isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 gap-1.5"
                  onClick={handleWishlistToggle}
                  disabled={wishlistPending}
                >
                  <Heart
                    className={`h-4 w-4 ${isInMyWishList ? "fill-red-500 text-red-500" : ""}`}
                  />
                  {isInMyWishList ? "In Wishlist" : "Wishlist"}
                </Button>
              )}
              {isAuthenticated && !isOwnProfile && (
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled
                  >
                    <Heart
                      className={`h-4 w-4 ${isInProfileWishList ? "fill-red-500 text-red-500" : ""}`}
                    />
                    {isInProfileWishList ? "In Wishlist" : "Not in Wishlist"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      if (!igdbId || isInMyWishList) return;
                      addToWishlist.mutate({ gameId: igdbId });
                    }}
                    disabled={wishlistPending || isInMyWishList}
                  >
                    <Heart
                      className={`h-4 w-4 ${isInMyWishList ? "fill-red-500 text-red-500" : ""}`}
                    />
                    {isInMyWishList ? "In My Wishlist" : "Add to My Wishlist"}
                  </Button>
                </div>
              )}
            </div>

            {/* Rating circles */}
            <div className="flex items-center gap-5 mt-4">
              <RatingCircle
                value={game.aggregatedRating}
                label="Critic"
              />
              <RatingCircle
                value={game.totalRating}
                label="Total"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        {game.summary && (
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Summary
            </h3>
            <ExpandableText text={game.summary} />
          </div>
        )}

        {/* Platforms & Genres */}
        <div className="space-y-2">
          {game.platforms.length > 0 && (
            <p className="text-sm">
              <span className="font-semibold">Platforms:</span>{" "}
              <span className="text-muted-foreground">
                {game.platforms.map((p) => p.abbreviation || p.name).join(", ")}
              </span>
            </p>
          )}
          {game.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {game.genres.map((g, i) => (
                <Badge key={`g-${i}`} variant="outline" className="text-xs">
                  {g.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Media */}
        <MediaGrid game={game} />

        {/* Related Games */}
        <RelatedGamesSection games={game.relatedGames} />
      </div>

      {/* Right sidebar */}
      <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">
        {/* Game Info */}
        <SidebarSection title="Game Info">
          <div className="space-y-3">
            <InfoBlock
              label="Developers"
              values={game.developers.map((d) => d.name)}
            />
            <InfoBlock
              label="Publishers"
              values={game.publishers.map((p) => p.name)}
            />
            <InfoBlock
              label="Game Modes"
              values={game.gameModes.map((m) => m.name)}
            />
            <InfoBlock
              label="Player Perspectives"
              values={game.playerPerspectives.map((p) => p.name)}
            />
            <InfoBlock label="Series" values={[game.franchiseName]} />
            <InfoBlock label="IGDB ID" values={[String(game.igdbId)]} />
          </div>
        </SidebarSection>

        {/* Websites */}
        {game.websites.length > 0 && (
          <SidebarSection title="Links">
            <WebsiteLinks websites={game.websites} />
          </SidebarSection>
        )}

        {/* Release Dates */}
        {game.releaseDates.length > 0 && (
          <SidebarSection title="Release Dates">
            <ReleaseDatesByPlatform releaseDates={game.releaseDates} />
          </SidebarSection>
        )}

        {/* Age Ratings */}
        {game.ageRatings.length > 0 && (
          <SidebarSection title="Age Rating">
            <div className="flex flex-wrap gap-3 items-end">
              {game.ageRatings.map((ar, i) => {
                const imagePath = getAgeRatingImage(ar.organization, ar.rating);
                return imagePath ? (
                  <Image
                    key={i}
                    src={imagePath}
                    alt={`${ar.organization} ${ar.rating}`}
                    width={48}
                    height={64}
                    className="h-16 w-auto object-contain"
                  />
                ) : (
                  <Badge key={i} variant="outline" className="text-xs">
                    {ar.organization}: {ar.rating}
                  </Badge>
                );
              })}
            </div>
          </SidebarSection>
        )}
      </aside>
    </div>
  );
}
