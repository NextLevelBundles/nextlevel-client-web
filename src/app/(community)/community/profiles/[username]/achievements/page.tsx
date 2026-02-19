"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card } from "@/shared/components/ui/card";
import { TrophyIcon, ImageIcon, ChevronDownIcon, LockIcon } from "lucide-react";
import { useProfileAchievements } from "@/hooks/queries/useProfileAchievements";
import type { GameAchievementProgress } from "@/lib/api/types/customer-profile";

type FilterValue = "all" | "complete" | "incomplete";
type SortValue = "recent" | "completion" | "name";

function getIgdbCoverUrl(coverImageId: string, size = "cover_big") {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${coverImageId}.jpg`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatApiName(apiName: string): string {
  return apiName
    .replace(/^ACH_/i, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function GameAchievementRow({ game }: { game: GameAchievementProgress }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-4 py-3 w-full text-left hover:bg-muted/30 transition-colors px-1 rounded-sm cursor-pointer"
      >
        {/* Cover Image */}
        <div className="w-14 h-14 rounded-md overflow-hidden bg-muted/50 flex-shrink-0">
          {game.coverImageId ? (
            <Image
              src={getIgdbCoverUrl(game.coverImageId, "cover_small")}
              alt={game.gameName}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{game.gameName}</p>
          {game.lastUnlockTime && (
            <p className="text-xs text-muted-foreground">
              {formatDate(game.lastUnlockTime)}
            </p>
          )}
        </div>

        {/* Achievement Progress */}
        <div className="flex-shrink-0 w-36">
          <div className="flex items-center gap-1.5 text-sm mb-1">
            <TrophyIcon className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">
              {game.earnedAchievements} / {game.totalAchievements}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${game.completionPercentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-10 text-right">
              {game.completionPercentage}%
            </span>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDownIcon
          className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded: All achievements list */}
      {expanded && game.achievementsList?.length > 0 && (
        <div className="pb-3 pl-[4.75rem] pr-1">
          <div className="rounded-md border bg-muted/20 divide-y">
            <div className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-foreground bg-muted rounded-t-md">
              <span>Achievement Name</span>
              <span>Unlocked On</span>
            </div>
            {game.achievementsList.map((ach) => (
              <div
                key={ach.apiName}
                className={`flex items-center justify-between px-3 py-2 text-xs ${!ach.achieved ? "opacity-40" : ""}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {ach.achieved ? (
                    <TrophyIcon className="h-3 w-3 text-primary flex-shrink-0" />
                  ) : (
                    <LockIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="truncate font-medium">
                    {formatApiName(ach.apiName)}
                  </span>
                </div>
                <span className="text-muted-foreground flex-shrink-0 ml-3">
                  {ach.achieved && ach.unlockTime ? formatDate(ach.unlockTime) : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full rounded-lg" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="w-14 h-14 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="w-36 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AchievementsPage() {
  const params = useParams();
  const username = params.username as string;
  const { data: achievements, isLoading } = useProfileAchievements(username);

  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState<SortValue>("recent");

  const filteredAndSorted = useMemo(() => {
    if (!achievements?.games) return [];

    let games = [...achievements.games];

    // Apply filter
    if (filter === "complete") {
      games = games.filter((g) => g.completionPercentage === 100);
    } else if (filter === "incomplete") {
      games = games.filter((g) => g.completionPercentage < 100);
    }

    // Apply sort
    if (sort === "recent") {
      games.sort((a, b) => {
        if (!a.lastUnlockTime && !b.lastUnlockTime) return 0;
        if (!a.lastUnlockTime) return 1;
        if (!b.lastUnlockTime) return -1;
        return (
          new Date(b.lastUnlockTime).getTime() -
          new Date(a.lastUnlockTime).getTime()
        );
      });
    } else if (sort === "completion") {
      games.sort((a, b) => b.completionPercentage - a.completionPercentage);
    } else if (sort === "name") {
      games.sort((a, b) => a.gameName.localeCompare(b.gameName));
    }

    return games;
  }, [achievements?.games, filter, sort]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!achievements || achievements.games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No achievements data yet.</p>
      </div>
    );
  }

  const filters: { value: FilterValue; label: string }[] = [
    { value: "all", label: "All" },
    { value: "complete", label: "100%" },
    { value: "incomplete", label: "Not 100%" },
  ];

  const sorts: { value: SortValue; label: string }[] = [
    { value: "recent", label: "Last Unlocked" },
    { value: "completion", label: "Completion %" },
    { value: "name", label: "Name" },
  ];

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">
            {achievements.totalEarnedAchievements.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-sm">
            achievements earned
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Filter */}
          <div className="flex items-center gap-1.5">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                  filter === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            className="text-xs bg-transparent border rounded-md px-2 py-1 text-muted-foreground"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Game Count */}
      <p className="text-sm text-muted-foreground">
        {filteredAndSorted.length}{" "}
        {filteredAndSorted.length === 1 ? "game" : "games"}
      </p>

      {/* Game List */}
      <Card className="p-4">
        {filteredAndSorted.length > 0 ? (
          filteredAndSorted.map((game) => (
            <GameAchievementRow key={game.appId} game={game} />
          ))
        ) : (
          <p className="text-center py-6 text-muted-foreground text-sm">
            No games match the current filter.
          </p>
        )}
      </Card>
    </div>
  );
}
