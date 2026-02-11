"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Skeleton } from "@/shared/components/ui/skeleton";
import Link from "next/link";
import { Loader2Icon, ArrowLeftIcon, DownloadIcon, RefreshCwIcon, Pencil } from "lucide-react";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useAuth } from "@/shared/providers/auth-provider";
import {
  useUnimportedGames,
  useImportGames,
  unimportedGamesQueryKey,
} from "@/hooks/queries/useCustomerCollection";
import { useSyncSteamLibrary } from "@/hooks/queries/useSteamKeys";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ImportGameStatus } from "@/lib/api/types/customer-profile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
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

function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function StatusBadge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

function ImportStatusDialog({
  gameName,
  initial,
  open,
  onOpenChange,
  onSave,
}: {
  gameName: string;
  initial: ImportGameStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (status: ImportGameStatus) => void;
}) {
  const [playStatus, setPlayStatus] = useState(initial.playStatus || "NoStatus");
  const [completionStatus, setCompletionStatus] = useState<string | null>(
    initial.completionStatus ?? null
  );

  const showCompletion = playStatus === "Playing" || playStatus === "Played";

  function handlePlayStatusChange(value: string) {
    if (!value) return;
    setPlayStatus(value);

    if (value === "NoStatus" || value === "Unplayed") {
      setCompletionStatus(null);
    } else if (completionStatus) {
      const validOptions = getCompletionOptions(value);
      if (!validOptions.includes(completionStatus)) {
        setCompletionStatus(null);
      }
    }
  }

  function handleSave() {
    onSave({
      playStatus: playStatus === "NoStatus" ? undefined : playStatus,
      completionStatus: showCompletion ? completionStatus : null,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{gameName}</DialogTitle>
          <DialogDescription>Set status before importing</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Play Status</label>
            <ToggleGroup
              type="single"
              value={playStatus}
              onValueChange={handlePlayStatusChange}
              className="justify-start flex-wrap"
            >
              {PLAY_STATUSES.map((status) => (
                <ToggleGroupItem key={status} value={status} variant="outline" size="sm">
                  {PLAY_STATUS_LABELS[status]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {showCompletion && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Completion Status</label>
              <Select
                value={completionStatus ?? ""}
                onValueChange={setCompletionStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select completion status" />
                </SelectTrigger>
                <SelectContent className="z-[101]">
                  {getCompletionOptions(playStatus).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function GameImportsPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { isLoading: authLoading } = useAuth();
  const { data: customer } = useCustomer();
  const { data: games, isLoading } = useUnimportedGames();
  const importGames = useImportGames();
  const syncSteamLibrary = useSyncSteamLibrary();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [statuses, setStatuses] = useState<Record<number, ImportGameStatus>>({});
  const [editingGame, setEditingGame] = useState<{ appId: number; name: string } | null>(null);

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

  const handleStatusSave = useCallback((appId: number, status: ImportGameStatus) => {
    setStatuses((prev) => ({ ...prev, [appId]: status }));
  }, []);

  const handleImport = async (appIds: number[]) => {
    if (appIds.length === 0) return;
    try {
      const relevantStatuses: Record<number, ImportGameStatus> = {};
      for (const appId of appIds) {
        if (statuses[appId]) {
          relevantStatuses[appId] = statuses[appId];
        }
      }
      const hasStatuses = Object.keys(relevantStatuses).length > 0;
      await importGames.mutateAsync({
        steamAppIds: appIds,
        statuses: hasStatuses ? relevantStatuses : undefined,
      });
      setSelected(new Set());
      // Clean up statuses for imported games
      setStatuses((prev) => {
        const next = { ...prev };
        for (const appId of appIds) delete next[appId];
        return next;
      });
      toast.success(`Imported ${appIds.length} game${appIds.length > 1 ? "s" : ""}`);
    } catch {
      toast.error("Failed to import games");
    }
  };

  const handleSyncSteamLibrary = () => {
    syncSteamLibrary.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: unimportedGamesQueryKey });
      },
    });
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
      <div className="flex items-center justify-between">
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
        {hasSteamConnected && (
          <Button
            onClick={handleSyncSteamLibrary}
            disabled={syncSteamLibrary.isPending}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {syncSteamLibrary.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCwIcon className="h-4 w-4" />
            )}
            Sync Steam Library
          </Button>
        )}
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
            {games.map((game) => {
              const gameStatus = statuses[game.appId];
              const playStatus = gameStatus?.playStatus || "NoStatus";
              const completionStatus = gameStatus?.completionStatus;

              return (
                <div
                  key={game.appId}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
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
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <StatusBadge
                      label={PLAY_STATUS_LABELS[playStatus]}
                      colorClass={PLAY_STATUS_COLORS[playStatus]}
                    />
                    {completionStatus && (
                      <StatusBadge
                        label={completionStatus}
                        colorClass={COMPLETION_STATUS_COLORS[completionStatus] ?? "bg-muted text-muted-foreground"}
                      />
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setEditingGame({
                        appId: game.appId,
                        name: game.name ?? `Steam App ${game.appId}`,
                      })
                    }
                    className="flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs text-muted-foreground flex-shrink-0 w-16 text-right">
                    {formatPlaytime(game.playtimeForever)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {editingGame && (
        <ImportStatusDialog
          key={editingGame.appId}
          gameName={editingGame.name}
          initial={statuses[editingGame.appId] ?? {}}
          open={!!editingGame}
          onOpenChange={(open) => {
            if (!open) setEditingGame(null);
          }}
          onSave={(status) => handleStatusSave(editingGame.appId, status)}
        />
      )}
    </div>
  );
}
