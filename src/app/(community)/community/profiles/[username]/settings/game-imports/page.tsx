"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Input } from "@/shared/components/ui/input";
import Link from "next/link";
import {
  Loader2Icon,
  ArrowLeftIcon,
  DownloadIcon,
  RefreshCwIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeOffIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useAuth } from "@/shared/providers/auth-provider";
import {
  useUnimportedGames,
  useImportGames,
  useSetGamesRemoved,
  unimportedGamesQueryKey,
} from "@/hooks/queries/useCustomerCollection";
import { useSyncSteamLibrary } from "@/hooks/queries/useSteamKeys";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ImportGameStatus } from "@/lib/api/types/customer-profile";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type PlaytimeFilter = "all" | "has-playtime" | "no-playtime";
type ActiveTab = "ready" | "ignored";
const PAGE_SIZES = [25, 50, 100] as const;

const PLAY_STATUSES = ["NoStatus", "Unplayed", "Playing", "Played"] as const;

const PLAY_STATUS_LABELS: Record<string, string> = {
  NoStatus: "No Status",
  Unplayed: "Unplayed",
  Playing: "Playing",
  Played: "Played",
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

export default function GameImportsPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { isLoading: authLoading } = useAuth();
  const { data: customer } = useCustomer();
  const importGames = useImportGames();
  const setGamesRemoved = useSetGamesRemoved();
  const syncSteamLibrary = useSyncSteamLibrary();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTab>("ready");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [statuses, setStatuses] = useState<Record<number, ImportGameStatus>>({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [playtimeFilter, setPlaytimeFilter] = useState<PlaytimeFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const isRemoved = activeTab === "ignored";

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when filter/pageSize changes
  useEffect(() => {
    setPage(1);
  }, [playtimeFilter, pageSize]);

  const serverPlaytimeFilter = playtimeFilter === "all" ? undefined : playtimeFilter;

  // Active tab query (full pagination)
  const { data, isLoading } = useUnimportedGames({
    search: debouncedSearch || undefined,
    playtimeFilter: serverPlaytimeFilter,
    page,
    pageSize,
    isRemoved,
  });

  // Inactive tab query (just for count)
  const { data: otherTabData } = useUnimportedGames({
    page: 1,
    pageSize: 1,
    isRemoved: !isRemoved,
  });

  const games = data?.items;
  const totalPages = data?.totalPages ?? 1;
  const totalFiltered = data?.total ?? 0;

  const readyCount = isRemoved ? (otherTabData?.total ?? 0) : totalFiltered;
  const ignoredCount = isRemoved ? totalFiltered : (otherTabData?.total ?? 0);

  // Redirect if not own profile
  useEffect(() => {
    if (customer && customer.handle !== username) {
      router.replace(`/community/profiles/${username}`);
    }
  }, [customer, username, router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as ActiveTab);
    setPage(1);
    setSelected(new Set());
    setSearch("");
    setDebouncedSearch("");
    setPlaytimeFilter("all");
  };

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
    setSelected(new Set(games?.map((g) => g.appId) ?? []));
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

  const handleSetRemoved = async (setRemoved: boolean) => {
    const appIds = Array.from(selected);
    if (appIds.length === 0) return;
    try {
      await setGamesRemoved.mutateAsync({ appIds, isRemoved: setRemoved });
      setSelected(new Set());
      toast.success(
        setRemoved
          ? `Ignored ${appIds.length} game${appIds.length > 1 ? "s" : ""}`
          : `Recovered ${appIds.length} game${appIds.length > 1 ? "s" : ""}`
      );
    } catch {
      toast.error(setRemoved ? "Failed to ignore games" : "Failed to recover games");
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

  const allSelected = !!games && games.length > 0 && games.every((g) => selected.has(g.appId));

  const hasSteamConnected = !!customer?.steamId;
  const hasSynced = customer?.steamLibrarySyncStatus === "SyncSucceeded";
  const hasNoGames = data !== undefined && data.total === 0 && !debouncedSearch && !serverPlaytimeFilter;

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

    if (activeTab === "ignored") {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No removed games.</p>
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
    <div className="space-y-6">
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
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="justify-start gap-4 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="ready"
              className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              READY TO SYNC ({readyCount})
            </TabsTrigger>
            <TabsTrigger
              value="ignored"
              className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              REMOVED ({ignoredCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
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

      {hasNoGames ? (
        renderEmptyState()
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
                  {(
                    [
                      { value: "all", label: "All" },
                      { value: "has-playtime", label: "Has Playtime" },
                      { value: "no-playtime", label: "Never Played" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setPlaytimeFilter(f.value)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        playtimeFilter === f.value
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
                  {selected.size > 0 && ` · ${selected.size} selected`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={allSelected ? deselectAll : selectAll}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </Button>
                {activeTab === "ready" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selected.size === 0 || setGamesRemoved.isPending}
                      onClick={() => handleSetRemoved(true)}
                    >
                      {setGamesRemoved.isPending ? (
                        <Loader2Icon className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <EyeOffIcon className="h-4 w-4 mr-1" />
                      )}
                      Ignore
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
                      Add games to collection
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    disabled={selected.size === 0 || setGamesRemoved.isPending}
                    onClick={() => handleSetRemoved(false)}
                  >
                    {setGamesRemoved.isPending ? (
                      <Loader2Icon className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RotateCcwIcon className="h-4 w-4 mr-1" />
                    )}
                    Recover
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {games?.map((game) => {
              const gameStatus = statuses[game.appId];
              const playStatus = gameStatus?.playStatus || "NoStatus";
              const completionStatus = gameStatus?.completionStatus;
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

                handleStatusSave(game.appId, {
                  playStatus: value === "NoStatus" ? undefined : value,
                  completionStatus: newCompletion,
                });
              }

              function handleCompletionChange(value: string) {
                handleStatusSave(game.appId, {
                  playStatus: playStatus === "NoStatus" ? undefined : playStatus,
                  completionStatus: value,
                });
              }

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
                  {activeTab === "ready" && (
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
                  )}
                  <span className="text-xs text-muted-foreground flex-shrink-0 w-16 text-right">
                    {formatPlaytime(game.playtimeForever)}
                  </span>
                </div>
              );
            })}
          </div>

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
