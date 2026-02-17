"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ImageIcon } from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import {
  useCustomerCollection,
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

const PLAY_STATUSES = ["NoStatus", "Unplayed", "Playing", "Played"] as const;

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

function GameRow({
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

    updateStatus.mutate({
      id: game.id,
      data: { playStatus: value, completionStatus: newCompletion },
    });
  }

  function handleCompletionChange(value: string) {
    updateStatus.mutate({
      id: game.id,
      data: { playStatus, completionStatus: value },
    });
  }

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/50">
      {/* Cover */}
      {game.slug ? (
        <Link href={`/community/profiles/${username}/games/${game.slug}`} className="w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-muted/50 block">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={game.name}
              width={64}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
            </div>
          )}
        </Link>
      ) : (
        <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-muted/50">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={game.name}
              width={64}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
            </div>
          )}
        </div>
      )}

      {/* Name + playtime */}
      <div className="flex-1 min-w-0">
        {game.slug ? (
          <Link
            href={`/community/profiles/${username}/games/${game.slug}`}
            className="text-sm font-semibold truncate block hover:text-primary transition-colors"
          >
            {game.name}
          </Link>
        ) : (
          <p className="text-sm font-semibold truncate">{game.name}</p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatPlaytime(game.playtimeForever)}
          {game.releaseYear && ` · ${game.releaseYear}`}
        </p>
      </div>

      {/* Inline status controls */}
      <div className="flex flex-col items-start gap-1.5 flex-shrink-0">
        <ToggleGroup
          type="single"
          value={playStatus}
          onValueChange={handlePlayStatusChange}
          className="justify-start"
        >
          {PLAY_STATUSES.map((status) => (
            <ToggleGroupItem
              key={status}
              value={status}
              variant="outline"
              size="sm"
              className="text-xs"
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
            <SelectTrigger className="w-[130px] h-8 text-xs">
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
  );
}

export default function CollectionPage() {
  const params = useParams();
  const username = params.username as string;
  const { isLoading: authLoading } = useAuth();
  const { data: collection, isLoading } = useCustomerCollection();

  if (authLoading || isLoading) {
    return (
      <div className="space-y-0">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-border/50">
            <Skeleton className="w-16 h-20 rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-5 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!collection || collection.length === 0) {
    return (
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
    );
  }

  return (
    <div>
      <div className="space-y-0">
        {collection.map((game) => (
          <GameRow
            key={game.id}
            game={game}
            username={username}
          />
        ))}
      </div>
    </div>
  );
}
