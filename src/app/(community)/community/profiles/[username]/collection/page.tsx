"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Input } from "@/shared/components/ui/input";
import {
  ImageIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import {
  useCollectionPaged,
  useUpdateCollectionGameStatus,
} from "@/hooks/queries/useCustomerCollection";
import type { CustomerGame } from "@/lib/api/types/customer-profile";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";

const VISIBLE_PLAY_STATUSES = ["Unplayed", "Playing", "Played"] as const;

const PLAY_STATUS_LABELS: Record<string, string> = {
  NoStatus: "No Status",
  Unplayed: "Unplayed",
  Playing: "Playing",
  Played: "Played",
};

const PAGE_SIZES = [25, 50, 100] as const;

function getCompletionOptions(playStatus: string) {
  const base = ["Unfinished", "Beaten", "Completed", "Continuous"];
  if (playStatus === "Played") {
    return [...base, "Dropped"];
  }
  return base;
}

function getIgdbCoverUrl(coverImageId: string, size = "cover_small") {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${coverImageId}.jpg`;
}

function getSteamIconUrl(appId: number, iconHash: string) {
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${iconHash}.jpg`;
}

function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function GameCard({
  game,
  username,
}: {
  game: CustomerGame;
  username: string;
}) {
  const updateStatus = useUpdateCollectionGameStatus();

  const coverSrc = game.coverImageId
    ? getIgdbCoverUrl(game.coverImageId)
    : game.steamIconUrl
      ? getSteamIconUrl(game.steamAppId, game.steamIconUrl)
      : null;

  const playStatus = game.playStatus || "NoStatus";
  const completionStatus = game.completionStatus;
  const showCompletion = playStatus === "Playing" || playStatus === "Played";

  function handlePlayStatusChange(value: string) {
    if (!value) return;
    let newCompletion: string | null = completionStatus ?? null;

    if (value === "NoStatus" || value === "Unplayed") {
      newCompletion = null;
    } else if (newCompletion) {
      const validOptions = getCompletionOptions(value);
      if (!validOptions.includes(newCompletion)) {
        newCompletion = "Unfinished";
      }
    } else {
      newCompletion = "Unfinished";
    }

    updateStatus.mutate(
      { id: game.id, data: { playStatus: value, completionStatus: newCompletion } },
      {
        onSuccess: () => toast.success(`Updated ${game.name} to ${PLAY_STATUS_LABELS[value] ?? value}`),
        onError: () => toast.error("Failed to update status"),
      }
    );
  }

  function handleCompletionChange(value: string) {
    updateStatus.mutate(
      { id: game.id, data: { playStatus, completionStatus: value } },
      {
        onSuccess: () => toast.success(`Updated ${game.name} to ${value}`),
        onError: () => toast.error("Failed to update status"),
      }
    );
  }

  const coverElement = coverSrc ? (
    <Image
      src={coverSrc}
      alt={game.name}
      fill
      className="object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
    </div>
  );

  return (
    <div className="flex rounded-lg border border-border bg-card overflow-hidden">
      {/* Cover image */}
      <div className="p-2 flex-shrink-0">
        {game.slug ? (
          <Link
            href={`/community/profiles/${username}/games/${game.slug}`}
            className="relative w-[50px] flex-shrink-0 aspect-[2/3] rounded overflow-hidden block"
          >
            {coverElement}
          </Link>
        ) : (
          <div className="relative w-[50px] flex-shrink-0 aspect-[2/3] rounded overflow-hidden bg-muted/50">
            {coverElement}
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="flex-1 min-w-0 p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          {game.slug ? (
            <Link
              href={`/community/profiles/${username}/games/${game.slug}`}
              className="text-sm font-medium leading-tight line-clamp-2 hover:text-primary transition-colors"
            >
              {game.name}
            </Link>
          ) : (
            <span className="text-sm font-medium leading-tight line-clamp-2">
              {game.name}
            </span>
          )}
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatPlaytime(game.playtimeForever)}
            {game.releaseYear && ` · ${game.releaseYear}`}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mt-auto h-[68px]">
          <ToggleGroup
            type="single"
            value={playStatus}
            onValueChange={handlePlayStatusChange}
            className="w-full"
          >
            {VISIBLE_PLAY_STATUSES.map((status) => (
              <ToggleGroupItem
                key={status}
                value={status}
                variant="outline"
                size="sm"
                className="text-xs flex-1"
              >
                {PLAY_STATUS_LABELS[status]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {showCompletion && (
            <Select
              value={completionStatus ?? ""}
              onValueChange={handleCompletionChange}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Completion..." />
              </SelectTrigger>
              <SelectContent>
                {getCompletionOptions(playStatus).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params.username as string;
  const initialPlayStatus = searchParams.get("playStatus");
  const { isLoading: authLoading } = useAuth();

  const [playStatusFilter, setPlayStatusFilter] = useState<string>(
    initialPlayStatus ?? ""
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter/pageSize change
  useEffect(() => {
    setPage(1);
  }, [playStatusFilter, pageSize]);

  const { data, isLoading } = useCollectionPaged({
    search: debouncedSearch || undefined,
    playStatus: playStatusFilter || undefined,
    page,
    pageSize,
  });

  const games = data?.items;
  const totalPages = data?.totalPages ?? 1;
  const totalFiltered = data?.total ?? 0;

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[113px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const hasNoGames =
    data !== undefined && data.total === 0 && !debouncedSearch && !playStatusFilter;

  return (
    <div className="space-y-6">
      {hasNoGames ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No games in collection yet.{" "}
            <Link
              href={`/community/profiles/${username}/settings/game-imports`}
              className="text-primary hover:underline"
            >
              Import from Steam
            </Link>
          </p>
        </div>
      ) : (
        <>
          {/* Search & Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {[
                    { value: "", label: "All" },
                    { value: "Unplayed", label: "Unplayed" },
                    { value: "Playing", label: "Playing" },
                    { value: "Played", label: "Played" },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setPlayStatusFilter(f.value)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        playStatusFilter === f.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {totalFiltered} game{totalFiltered !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Game grid */}
          {games && games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  username={username}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No games found matching your filters.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-transparent border rounded-md px-2 py-1 text-xs"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>per page</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
