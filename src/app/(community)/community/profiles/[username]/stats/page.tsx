"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card } from "@/shared/components/ui/card";
import {
  GamepadIcon,
  ClockIcon,
  TagIcon,
  TrophyIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ImageIcon,
} from "lucide-react";
import { useProfileStats } from "@/hooks/queries/useProfileStats";
import type {
  ProfileStats,
  GameActivityList,
} from "@/lib/api/types/customer-profile";

function getIgdbCoverUrl(coverImageId: string, size = "cover_big") {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${coverImageId}.jpg`;
}

function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold truncate">{value}</p>
          {sub && (
            <p className="text-xs text-muted-foreground truncate">{sub}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function GenreBreakdown({
  genres,
}: {
  genres: ProfileStats["genreBreakdown"];
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? genres : genres.slice(0, 5);
  const maxCount = genres.length > 0 ? genres[0].count : 1;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Taste Profile</h2>
      <div className="space-y-3">
        {visible.map((genre) => (
          <div key={genre.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{genre.name}</span>
              <span className="text-muted-foreground">
                {genre.percentage}% ({genre.count})
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${(genre.count / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {genres.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUpIcon className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDownIcon className="h-4 w-4" />
              Show all ({genres.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}

function GameActivitySection({ list, username }: { list: GameActivityList; username: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">{list.listName}</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {list.items.map((item, idx) => {
          const content = (
            <>
              <div className="aspect-[3/4] rounded-md overflow-hidden bg-muted/50 mb-1.5">
                {item.coverImageId ? (
                  <Image
                    src={getIgdbCoverUrl(item.coverImageId)}
                    alt={item.title ?? "Game"}
                    width={120}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <p
                className="text-xs font-medium truncate"
                title={item.title ?? undefined}
              >
                {item.title ?? "Unknown"}
              </p>
            </>
          );

          return item.slug ? (
            <Link
              key={`${item.gameId ?? idx}`}
              href={`/community/profiles/${username}/games/${item.slug}`}
              className="flex-shrink-0 w-[120px] hover:opacity-90 transition-opacity"
            >
              {content}
            </Link>
          ) : (
            <div
              key={`${item.gameId ?? idx}`}
              className="flex-shrink-0 w-[120px]"
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const params = useParams();
  const username = params.username as string;
  const { data: stats, isLoading } = useProfileStats(username);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!stats || stats.totalGames === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No stats available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={GamepadIcon}
          label="Total Games"
          value={stats.totalGames.toLocaleString()}
        />
        <SummaryCard
          icon={ClockIcon}
          label="Total Playtime"
          value={formatPlaytime(stats.totalPlaytimeMinutes)}
        />
        <SummaryCard
          icon={TagIcon}
          label="Top Genre"
          value={stats.topGenre ?? "N/A"}
        />
        <SummaryCard
          icon={TrophyIcon}
          label="Most Played"
          value={stats.mostPlayedGame ?? "N/A"}
          sub={
            stats.mostPlayedGameMinutes != null
              ? formatPlaytime(stats.mostPlayedGameMinutes)
              : undefined
          }
        />
      </div>

      {/* Genre Breakdown */}
      {stats.genreBreakdown.length > 0 && (
        <GenreBreakdown genres={stats.genreBreakdown} />
      )}

      {/* Game Activity */}
      {stats.gameActivity.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Game Activity</h2>
          {stats.gameActivity.map((list) => (
            <GameActivitySection key={list.systemName} list={list} username={username} />
          ))}
        </div>
      )}
    </div>
  );
}
