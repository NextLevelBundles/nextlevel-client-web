"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PieChart, Pie, Cell, Label } from "recharts";
import {
  ImageIcon,
  ArrowRightIcon,
  GamepadIcon,
  ClockIcon,
  TagIcon,
  TrophyIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { useCustomerLists, useCustomerListDetail } from "@/hooks/queries/useCustomerLists";

import { useProfileStats } from "@/hooks/queries/useProfileStats";
import { useProfileAchievements } from "@/hooks/queries/useProfileAchievements";
import { useCustomer } from "@/hooks/queries/useCustomer";
import type {
  CustomerList,
  CustomerListItem,
  ProfileStats,
  CompletionStat,
  GameAchievementProgress,
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

const GENRE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(210, 70%, 55%)",
  "hsl(340, 65%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(45, 80%, 50%)",
  "hsl(270, 55%, 55%)",
  "hsl(190, 70%, 45%)",
  "hsl(15, 75%, 55%)",
];

const COMPLETION_COLORS: Record<string, string> = {
  "Not Started": "hsl(0, 65%, 50%)",
  "Unfinished": "hsl(45, 80%, 50%)",
  "Beaten": "hsl(210, 70%, 55%)",
  "Completed": "hsl(140, 60%, 45%)",
  "Continuous": "hsl(270, 55%, 55%)",
  "Dropped": "hsl(0, 0%, 50%)",
  "No Status": "hsl(0, 0%, 35%)",
};

// --- Section wrapper with border ---

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide">
          {title}
        </h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

// --- Playing Now Section ---

function PlayingNowSection({
  games,
  isLoading,
  username,
  listId,
}: {
  games: CustomerListItem[];
  isLoading: boolean;
  username: string;
  listId: string | null;
}) {
  if (isLoading) {
    return (
      <Section title="Playing Now">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-md" />
          ))}
        </div>
      </Section>
    );
  }

  const maxVisible = 6;
  const visibleGames = games.slice(0, maxVisible);

  return (
    <Section
      title="Playing Now"
      action={
        games.length > 0 && listId ? (
          <Link
            href={`/community/profiles/${username}/lists/${listId}`}
            className="text-xs text-primary hover:underline"
          >
            View all ({games.length})
          </Link>
        ) : null
      }
    >
      {games.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {visibleGames.map((game) => {
            const content = (
              <div>
                <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-muted/50 mb-1.5">
                  {game.coverImageId ? (
                    <Image
                      src={getIgdbCoverUrl(game.coverImageId)}
                      alt={game.title ?? "Game"}
                      width={264}
                      height={352}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                  {game.genre && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-semibold text-white bg-primary/80">
                      {game.genre}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium truncate" title={game.title ?? undefined}>
                  {game.title}
                </p>
              </div>
            );

            return game.slug ? (
              <Link
                key={game.id}
                href={`/community/profiles/${username}/games/${game.slug}`}
                className="group hover:opacity-90 transition-opacity"
              >
                {content}
              </Link>
            ) : (
              <div key={game.id}>{content}</div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No games in Playing Now list.
        </p>
      )}
    </Section>
  );
}

// --- Stats Section ---

function StatsSection({
  stats,
  isLoading,
}: {
  stats: ProfileStats | null | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Section title="Stats">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      </Section>
    );
  }

  const items = [
    {
      icon: GamepadIcon,
      label: "Total Games",
      value: stats ? stats.totalGames.toLocaleString() : "0",
    },
    {
      icon: ClockIcon,
      label: "Total Playtime",
      value: stats ? formatPlaytime(stats.totalPlaytimeMinutes) : "0m",
    },
    {
      icon: TagIcon,
      label: "Top Genre",
      value: stats?.topGenre ?? "N/A",
    },
    {
      icon: TrophyIcon,
      label: "Most Played",
      value: stats?.mostPlayedGame ?? "N/A",
      sub:
        stats?.mostPlayedGameMinutes != null
          ? formatPlaytime(stats.mostPlayedGameMinutes)
          : undefined,
    },
  ];

  return (
    <Section title="Stats">
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-md border p-3"
          >
            <div className="rounded-md bg-primary/10 p-2">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold truncate">{item.value}</p>
              {item.sub && (
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// --- Taste Profile Donut Chart ---

const TASTE_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "played", label: "Games played" },
  { value: "completed", label: "Games completed" },
];

function TasteProfileSection({
  totalGames,
  filteredTotalGames,
  genres,
  genresLoading,
  completionBreakdown,
  isLoading,
  filter,
  onFilterChange,
  username,
}: {
  totalGames: number;
  filteredTotalGames: number;
  genres: { name: string; count: number; percentage: number }[];
  genresLoading: boolean;
  completionBreakdown: CompletionStat[];
  isLoading: boolean;
  filter: string;
  onFilterChange: (value: string) => void;
  username: string;
}) {
  // Top 9 genres + "Other" bucket
  const displayGenres = useMemo(() => {
    if (genres.length <= 10) return genres;
    const top9 = genres.slice(0, 9);
    const rest = genres.slice(9);
    const otherCount = rest.reduce((sum, g) => sum + g.count, 0);
    const otherPercentage = rest.reduce((sum, g) => sum + g.percentage, 0);
    return [
      ...top9,
      {
        name: "Other",
        count: otherCount,
        percentage: Math.round(otherPercentage * 10) / 10,
      },
    ];
  }, [genres]);

  const chartData = useMemo(() => {
    return displayGenres.map((g, i) => ({
      name: g.name,
      value: g.count,
      fill: GENRE_COLORS[i % GENRE_COLORS.length],
    }));
  }, [displayGenres]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    chartData.forEach((d) => {
      config[d.name] = { label: d.name, color: d.fill };
    });
    return config;
  }, [chartData]);

  // Completion chart data
  const completionChartData = useMemo(() => {
    const nonZero = completionBreakdown
      .filter((s) => s.count > 0)
      .map((s) => ({
        name: s.name,
        value: s.count,
        fill: COMPLETION_COLORS[s.name] ?? "hsl(0, 0%, 50%)",
      }));
    return nonZero;
  }, [completionBreakdown]);

  const completionChartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    completionChartData.forEach((d) => {
      config[d.name] = { label: d.name, color: d.fill };
    });
    return config;
  }, [completionChartData]);

  const completionTotal = completionBreakdown.reduce((sum, s) => sum + s.count, 0);

  if (isLoading) {
    return (
      <Section title="Taste Profile">
        <div className="flex items-center gap-8">
          <Skeleton className="h-40 w-40 rounded-full flex-shrink-0" />
          <div className="space-y-3 flex-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </Section>
    );
  }

  const hasGenres = displayGenres.length > 0;
  const hasCompletion = completionChartData.length > 0;
  const chartTotal = displayGenres.reduce((sum, g) => sum + g.count, 0);

  return (
    <Section
      title="Taste Profile"
      action={
        <div className="flex items-center gap-2">
          <Link href={`/community/profiles/${username}/stats`}>
            <Button variant="ghost" size="sm" className="h-auto py-0">
              View All
              <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Genre breakdown with filter */}
        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Genres</h4>
            <Select value={filter} onValueChange={onFilterChange}>
              <SelectTrigger className="h-7 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASTE_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <ChartContainer
                config={hasGenres ? chartConfig : { empty: { label: "No data", color: "hsl(var(--muted))" } }}
                className="aspect-square w-[180px]"
              >
                <PieChart>
                  {hasGenres && (
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel nameKey="name" />}
                    />
                  )}
                  <Pie
                    data={hasGenres ? chartData : [{ name: "empty", value: 1, fill: "hsl(var(--muted))" }]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {hasGenres
                      ? chartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))
                      : <Cell fill="hsl(var(--muted))" />
                    }
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {filteredTotalGames.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                Games
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="flex-1 space-y-2.5 w-full">
              {displayGenres.map((genre, i) => (
                <div key={genre.name} className="flex items-center gap-2.5">
                  <div
                    className="h-3 w-3 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length],
                    }}
                  />
                  <span className="text-sm flex-1 min-w-0 truncate">
                    {genre.name}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${genre.percentage}%`,
                          backgroundColor:
                            GENRE_COLORS[i % GENRE_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {genre.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Completion status breakdown */}
        <div className="rounded-lg border bg-muted/20 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Completion Status
          </h4>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <ChartContainer
                config={hasCompletion ? completionChartConfig : { empty: { label: "No data", color: "hsl(var(--muted))" } }}
                className="aspect-square w-[180px]"
              >
                <PieChart>
                  {hasCompletion && (
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel nameKey="name" />}
                    />
                  )}
                  <Pie
                    data={hasCompletion ? completionChartData : [{ name: "empty", value: 1, fill: "hsl(var(--muted))" }]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {hasCompletion
                      ? completionChartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))
                      : <Cell fill="hsl(var(--muted))" />
                    }
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {completionTotal.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                Total
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="flex-1 space-y-2.5 w-full">
              {completionBreakdown.map((status) => (
                <div key={status.name} className="flex items-center gap-2.5">
                  <div
                    className="h-3 w-3 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor: COMPLETION_COLORS[status.name] ?? "hsl(0, 0%, 50%)",
                    }}
                  />
                  <span className="text-sm flex-1 min-w-0 truncate">
                    {status.name}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${status.percentage}%`,
                          backgroundColor: COMPLETION_COLORS[status.name] ?? "hsl(0, 0%, 50%)",
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {status.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// --- Achievements Overview Section ---

function AchievementsOverviewSection({
  games,
  totalEarned,
  isLoading,
  username,
}: {
  games: GameAchievementProgress[];
  totalEarned: number;
  isLoading: boolean;
  username: string;
}) {
  if (isLoading) {
    return (
      <Section title="Achievements">
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (games.length === 0) {
    return (
      <Section
        title="Achievements"
        action={
          <Link href={`/community/profiles/${username}/achievements`}>
            <Button variant="ghost" size="sm" className="h-auto py-0">
              View All
              <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          No achievements yet.
        </p>
      </Section>
    );
  }

  const perfectGames = games.filter((g) => g.completionPercentage === 100).length;
  const avgCompletion =
    games.length > 0
      ? Math.round(
          games.reduce((sum, g) => sum + g.completionPercentage, 0) /
            games.length
        )
      : 0;

  // Show top 5 most recently unlocked
  const recentGames = [...games]
    .filter((g) => g.earnedAchievements > 0)
    .sort((a, b) => {
      if (!a.lastUnlockTime && !b.lastUnlockTime) return 0;
      if (!a.lastUnlockTime) return 1;
      if (!b.lastUnlockTime) return -1;
      return (
        new Date(b.lastUnlockTime).getTime() -
        new Date(a.lastUnlockTime).getTime()
      );
    })
    .slice(0, 5);

  return (
    <Section
      title="Achievements"
      action={
        <Link href={`/community/profiles/${username}/achievements`}>
          <Button variant="ghost" size="sm" className="h-auto py-0">
            View All
            <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Summary stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <TrophyIcon className="h-4 w-4 text-primary" />
            <span className="font-semibold">{totalEarned.toLocaleString()}</span>
            <span className="text-muted-foreground">earned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">{perfectGames}</span>
            <span className="text-muted-foreground">perfect games</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">{avgCompletion}%</span>
            <span className="text-muted-foreground">avg completion</span>
          </div>
        </div>

        {/* Recent game achievement progress */}
        <div className="space-y-2.5">
          {recentGames.map((game) => (
            <div key={game.appId} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded overflow-hidden bg-muted/50 flex-shrink-0">
                {game.coverImageId ? (
                  <Image
                    src={getIgdbCoverUrl(game.coverImageId, "cover_small")}
                    alt={game.gameName}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium truncate">{game.gameName}</span>
                  <span className="text-muted-foreground flex-shrink-0 ml-2">
                    {game.earnedAchievements}/{game.totalAchievements}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${game.completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">
                    {game.completionPercentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// --- Recent Lists Section ---

function RecentListCard({
  list,
  username,
}: {
  list: CustomerList;
  username: string;
}) {
  const hasPreviews = list.previewCoverImageIds?.length > 0;

  return (
    <Link href={`/community/profiles/${username}/lists/${list.id}`}>
      <div className="group flex items-center gap-3 cursor-pointer rounded-md border bg-card p-2 hover:bg-muted/50 transition-colors">
        <div className="w-20 h-14 flex-shrink-0 rounded overflow-hidden bg-muted/50">
          {hasPreviews ? (
            <div className="flex h-full">
              {list.previewCoverImageIds.slice(0, 4).map((imageId) => (
                <Image
                  key={imageId}
                  src={getIgdbCoverUrl(imageId, "thumb")}
                  alt=""
                  width={40}
                  height={56}
                  className="h-full flex-1 min-w-0 object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <p className="text-sm font-medium truncate flex-1 min-w-0">
          {list.name}
        </p>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {list.itemCount}
        </span>
      </div>
    </Link>
  );
}

// --- Main Page ---

export default function ProfileOverviewPage() {
  const params = useParams();
  const username = params.username as string;
  const { data: customer } = useCustomer();
  const isOwnProfile = customer?.handle === username;
  const [tasteFilter, setTasteFilter] = useState("all");
  const { data: stats, isLoading: statsLoading } = useProfileStats(username);
  const { data: filteredStats, isLoading: filteredStatsLoading } =
    useProfileStats(
      username,
      tasteFilter !== "all" ? tasteFilter : undefined
    );
  const { data: achievements, isLoading: achievementsLoading } =
    useProfileAchievements(username);
  const { data: lists, isLoading: listsLoading } = useCustomerLists(username);

  const playingNowList = (lists ?? []).find(
    (l) => l.systemName === "PlayingNow"
  );
  const { data: playingNowDetail, isLoading: playingNowLoading } =
    useCustomerListDetail(playingNowList?.id ?? "", username);

  const recentLists = (lists ?? [])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="grid gap-6">
      {/* Two-column layout: left = Game Collection + Stats, right = Currently Playing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <TasteProfileSection
            totalGames={stats?.totalGames ?? 0}
            filteredTotalGames={filteredStats?.filteredTotalGames ?? 0}
            genres={filteredStats?.genreBreakdown ?? []}
            genresLoading={filteredStatsLoading}
            completionBreakdown={stats?.completionBreakdown ?? []}
            isLoading={statsLoading}
            filter={tasteFilter}
            onFilterChange={setTasteFilter}
            username={username}
          />
          <StatsSection stats={stats} isLoading={statsLoading} />
        </div>
        <PlayingNowSection
          games={playingNowDetail?.items ?? []}
          isLoading={listsLoading || playingNowLoading}
          username={username}
          listId={playingNowList?.id ?? null}
        />
      </div>

      {/* Achievements + Recent Lists side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AchievementsOverviewSection
          games={achievements?.games ?? []}
          totalEarned={achievements?.totalEarnedAchievements ?? 0}
          isLoading={achievementsLoading}
          username={username}
        />

        <Section
          title="Recent Lists"
          action={
            (lists?.length ?? 0) > 0 ? (
              <Link
                href={`/community/profiles/${username}/lists`}
                className="text-xs text-primary hover:underline"
              >
                View all ({lists!.length})
              </Link>
            ) : undefined
          }
        >
          {listsLoading ? (
            <div className="grid gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-[4.5rem] rounded-md" />
              ))}
            </div>
          ) : recentLists.length > 0 ? (
            <div className="grid gap-2">
              {recentLists.map((list) => (
                <RecentListCard key={list.id} list={list} username={username} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No lists yet.</p>
          )}
        </Section>
      </div>
    </div>
  );
}
