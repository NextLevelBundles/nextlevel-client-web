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
    <div className="flex flex-wrap gap-1.5">
      {validWebsites.map((w, i) => (
        <a
          key={i}
          href={w.url!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          {WEBSITE_TYPE_LABELS[w.type!] ?? "Link"}
        </a>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2 py-1.5 text-sm border-b border-border/30">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right truncate">{value}</span>
    </div>
  );
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

  // Wishlist logic
  const { data: wishlistDetail } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const igdbId = game?.igdbId ?? 0;
  const wishListItem = wishlistDetail?.items.find(
    (item) => item.gameId === igdbId
  );
  const isInWishList = !!wishListItem;
  const wishlistPending =
    addToWishlist.isPending || removeFromWishlist.isPending;

  function handleWishlistToggle() {
    if (!igdbId) return;
    if (isInWishList && wishListItem) {
      removeFromWishlist.mutate(wishListItem.id);
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
                    className={`h-4 w-4 ${isInWishList ? "fill-red-500 text-red-500" : ""}`}
                  />
                  {isInWishList ? "In Wishlist" : "Wishlist"}
                </Button>
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

        {/* Platform badges + Genre tags */}
        <div className="flex flex-wrap gap-2">
          {game.platforms.map((p, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {p.abbreviation || p.name}
            </Badge>
          ))}
          {game.genres.map((g, i) => (
            <Badge key={`g-${i}`} variant="outline" className="text-xs">
              {g.name}
            </Badge>
          ))}
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
          <div className="space-y-0">
            <InfoRow
              label="Developer"
              value={game.developers.map((d) => d.name).join(", ") || null}
            />
            <InfoRow
              label="Publisher"
              value={game.publishers.map((p) => p.name).join(", ") || null}
            />
            <InfoRow
              label="Game Modes"
              value={game.gameModes.map((m) => m.name).join(", ") || null}
            />
            <InfoRow
              label="Perspectives"
              value={
                game.playerPerspectives.map((p) => p.name).join(", ") || null
              }
            />
            <InfoRow
              label="Themes"
              value={game.themes.map((t) => t.name).join(", ") || null}
            />
            <InfoRow
              label="Engine"
              value={game.gameEngines.map((e) => e.name).join(", ") || null}
            />
            <InfoRow label="Franchise" value={game.franchiseName} />
            <InfoRow label="IGDB ID" value={String(game.igdbId)} />
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
            <div className="space-y-0">
              {game.releaseDates.map((rd, i) => (
                <div
                  key={i}
                  className="flex justify-between gap-2 py-1.5 text-sm border-b border-border/30"
                >
                  <span className="text-muted-foreground truncate">
                    {rd.platformName}
                    {rd.region && (
                      <span className="text-[10px] ml-1 opacity-60">
                        ({rd.region})
                      </span>
                    )}
                  </span>
                  <span className="shrink-0">
                    {rd.date ? formatReleaseDate(rd.date) : "TBA"}
                  </span>
                </div>
              ))}
            </div>
          </SidebarSection>
        )}

        {/* Age Ratings */}
        {game.ageRatings.length > 0 && (
          <SidebarSection title="Age Ratings">
            <div className="flex flex-wrap gap-2">
              {game.ageRatings.map((ar, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {ar.organization}: {ar.rating}
                </Badge>
              ))}
            </div>
          </SidebarSection>
        )}
      </aside>
    </div>
  );
}
