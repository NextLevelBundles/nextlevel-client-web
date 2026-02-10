"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Skeleton } from "@/shared/components/ui/skeleton";
import Link from "next/link";
import { Loader2Icon, ArrowLeftIcon, DownloadIcon } from "lucide-react";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useAuth } from "@/shared/providers/auth-provider";
import {
  useUnimportedGames,
  useImportGames,
} from "@/hooks/queries/useCustomerCollection";
import { toast } from "sonner";

function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function GameImportsPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { isLoading: authLoading } = useAuth();
  const { data: customer } = useCustomer();
  const { data: games, isLoading } = useUnimportedGames();
  const importGames = useImportGames();

  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Redirect if not own profile
  useEffect(() => {
    if (customer && customer.handle !== username) {
      router.replace(`/community/profiles/${username}`);
    }
  }, [customer, username, router]);

  const toggleGame = (appId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (!games) return;
    setSelected(new Set(games.map((g) => g.appId)));
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  const handleImport = async (appIds: number[]) => {
    if (appIds.length === 0) return;
    try {
      await importGames.mutateAsync({ steamAppIds: appIds });
      setSelected(new Set());
      toast.success(`Imported ${appIds.length} game${appIds.length > 1 ? "s" : ""}`);
    } catch {
      toast.error("Failed to import games");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  const allSelected = games && games.length > 0 && selected.size === games.length;

  const hasSteamConnected = !!customer?.steamId;
  const hasSynced = customer?.steamLibrarySyncStatus === "SyncSucceeded";
  const hasNoGames = !games || games.length === 0;

  const renderEmptyState = () => {
    if (!hasSteamConnected) {
      return (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground">
            Connect your Steam account to import games.
          </p>
          <Link href="/customer/settings/steam">
            <Button variant="outline" size="sm">
              Go to Steam Settings
            </Button>
          </Link>
        </div>
      );
    }

    if (!hasSynced) {
      return (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground">
            Your Steam library hasn&apos;t been synced yet. Sync your library to import games.
          </p>
          <Link href="/customer/settings/steam">
            <Button variant="outline" size="sm">
              Go to Steam Settings
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">All Steam games imported!</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/community/profiles/${username}/settings`)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Game Imports</h2>
      </div>

      {hasNoGames ? (
        renderEmptyState()
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {games.length} unimported game{games.length !== 1 ? "s" : ""}
              {selected.size > 0 && ` · ${selected.size} selected`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={allSelected ? deselectAll : selectAll}
              >
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              <Button
                size="sm"
                disabled={selected.size === 0 || importGames.isPending}
                onClick={() => handleImport(Array.from(selected))}
              >
                {importGames.isPending ? (
                  <Loader2Icon className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <DownloadIcon className="h-4 w-4 mr-1" />
                )}
                Import Selected
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            {games.map((game) => (
              <label
                key={game.appId}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selected.has(game.appId)}
                  onCheckedChange={() => toggleGame(game.appId)}
                />
                <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden bg-muted/50">
                  {game.imgIconUrl ? (
                    <Image
                      src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appId}/${game.imgIconUrl}.jpg`}
                      alt=""
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
                <span className="text-sm font-medium flex-1 min-w-0 truncate">
                  {game.name ?? `Steam App ${game.appId}`}
                </span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatPlaytime(game.playtimeForever)}
                </span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
