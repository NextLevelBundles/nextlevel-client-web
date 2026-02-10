"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ImageIcon } from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import { useCustomerCollection } from "@/hooks/queries/useCustomerCollection";
import type { CustomerCollectionGame } from "@/lib/api/types/customer-profile";

function getIgdbCoverUrl(coverImageId: string, size = "cover_big") {
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

function GameCard({ game }: { game: CustomerCollectionGame }) {
  const coverSrc = game.coverImageId
    ? getIgdbCoverUrl(game.coverImageId)
    : game.steamIconUrl
      ? getSteamIconUrl(game.steamAppId, game.steamIconUrl)
      : null;

  return (
    <div className="group flex flex-col">
      <div className="aspect-[3/4] rounded-md overflow-hidden bg-muted/50 mb-2">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={game.name}
            width={264}
            height={352}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <p className="text-sm font-medium truncate" title={game.name}>
        {game.name}
      </p>
      <p className="text-xs text-muted-foreground">
        {formatPlaytime(game.playtimeForever)}
        {game.releaseYear && ` · ${game.releaseYear}`}
      </p>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[3/4] rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
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
    <div className="grid gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {collection.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
