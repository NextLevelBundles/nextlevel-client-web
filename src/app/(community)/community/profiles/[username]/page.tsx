"use client";

import { useMemo } from "react";
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { useCustomerLists } from "@/hooks/queries/useCustomerLists";
import { useCommunityProfileByHandle } from "@/hooks/queries/useCommunityProfile";
import { useProfileStats } from "@/hooks/queries/useProfileStats";
import { useProfileAchievements } from "@/hooks/queries/useProfileAchievements";
import type {
  CustomerList,
  RecentlyPlayedGame,
  ProfileStats,
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
  "hsl(var(--muted-foreground))",
];

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

// --- About Me Section ---

function AboutMeSection({
  profile,
  isLoading,
}: {
  profile: ReturnType<typeof useCommunityProfileByHandle>["data"];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Section title="About Me">
        <div className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </Section>
    );
  }

  const hasContent =
    profile?.title ||
    profile?.headline ||
    profile?.specialties ||
    (profile?.socialHandles?.length ?? 0) > 0;

  return (
    <Section title="About Me">
      {hasContent ? (
        <div className="space-y-4">
          {profile?.title && (
            <p className="text-sm font-medium text-primary">{profile.title}</p>
          )}
          {profile?.headline && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {profile.headline}
            </p>
          )}
          {profile?.specialties && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Specialties
              </span>
              <p className="text-sm mt-1">{profile.specialties}</p>
            </div>
          )}
          {(profile?.socialHandles?.length ?? 0) > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Social Links
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile!.socialHandles.map((sh) => (
                  <span
                    key={sh.platform}
                    className="inline-flex items-center gap-1 text-xs rounded-full bg-muted px-2.5 py-1"
                  >
                    <span className="font-medium">{sh.platform}:</span>
                    {sh.url ? (
                      <a
                        href={sh.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {sh.handle}
                      </a>
                    ) : (
                      <span>{sh.handle}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(profile?.charities?.length ?? 0) > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Charities
              </span>
              <div className="space-y-1 mt-1">
                {profile!.charities.map((c) => (
                  <div key={c.name} className="text-sm">
                    {c.link ? (
                      <a
                        href={c.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {c.name}
                      </a>
                    ) : (
                      <span className="font-medium">{c.name}</span>
                    )}
                    {c.description && (
                      <span className="text-muted-foreground">
                        {" "}
                        — {c.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Nothing here yet. Details coming soon.
        </p>
      )}
    </Section>
  );
}

// --- Currently Playing Section ---

function CurrentlyPlayingSection({
  games,
  isLoading,
}: {
  games: RecentlyPlayedGame[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Section title="Currently Playing">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-md" />
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section title="Currently Playing">
      {games.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {games.map((game, idx) => (
            <div key={idx}>
              <div className="aspect-[3/4] rounded-md overflow-hidden bg-muted/50 mb-1.5">
                {game.coverImageId ? (
                  <Image
                    src={getIgdbCoverUrl(game.coverImageId)}
                    alt={game.name}
                    width={264}
                    height={352}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <p className="text-xs font-medium truncate" title={game.name}>
                {game.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatPlaytime(game.playtime2Weeks)} past 2 weeks
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No games played in the last 2 weeks.
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

  if (!stats || stats.totalGames === 0) return null;

  const items = [
    {
      icon: GamepadIcon,
      label: "Total Games",
      value: stats.totalGames.toLocaleString(),
    },
    {
      icon: ClockIcon,
      label: "Total Playtime",
      value: formatPlaytime(stats.totalPlaytimeMinutes),
    },
    {
      icon: TagIcon,
      label: "Top Genre",
      value: stats.topGenre ?? "N/A",
    },
    {
      icon: TrophyIcon,
      label: "Most Played",
      value: stats.mostPlayedGame ?? "N/A",
      sub:
        stats.mostPlayedGameMinutes != null
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

// --- Game Collection Donut Chart ---

function GameCollectionSection({
  totalGames,
  genres,
  isLoading,
}: {
  totalGames: number;
  genres: { name: string; count: number; percentage: number }[];
  isLoading: boolean;
}) {
  const topGenres = genres.slice(0, 5);
  const otherCount = genres
    .slice(5)
    .reduce((sum, g) => sum + g.count, 0);

  const chartData = useMemo(() => {
    const data = topGenres.map((g, i) => ({
      name: g.name,
      value: g.count,
      fill: GENRE_COLORS[i % GENRE_COLORS.length],
    }));
    if (otherCount > 0) {
      data.push({
        name: "Other",
        value: otherCount,
        fill: GENRE_COLORS[5],
      });
    }
    return data;
  }, [topGenres, otherCount]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    chartData.forEach((d) => {
      config[d.name] = { label: d.name, color: d.fill };
    });
    return config;
  }, [chartData]);

  if (isLoading) {
    return (
      <Section title="Game Collection">
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

  if (totalGames === 0) return null;

  const hasGenres = genres.length > 0;

  return (
    <Section title="Game Collection">
      {hasGenres ? (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="flex-shrink-0">
            <ChartContainer
              config={chartConfig}
              className="aspect-square w-[180px]"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="name" />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
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
                              {totalGames.toLocaleString()}
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

          {/* Genre Legend */}
          <div className="flex-1 space-y-2.5 w-full">
            {topGenres.map((genre, i) => (
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
            {otherCount > 0 && (
              <div className="flex items-center gap-2.5">
                <div
                  className="h-3 w-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: GENRE_COLORS[5] }}
                />
                <span className="text-sm flex-1 min-w-0 truncate text-muted-foreground">
                  Other
                </span>
                <span className="text-xs text-muted-foreground">
                  {otherCount}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-20 w-20 rounded-full bg-muted flex-shrink-0">
            <span className="text-xl font-bold">
              {totalGames.toLocaleString()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">
              {totalGames.toLocaleString()} games
            </p>
            <p className="text-xs text-muted-foreground">
              Genre breakdown will appear once games are matched.
            </p>
          </div>
        </div>
      )}
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

  if (games.length === 0) return null;

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
  const { data: profile, isLoading: profileLoading } =
    useCommunityProfileByHandle(username);
  const { data: stats, isLoading: statsLoading } = useProfileStats(username);
  const { data: achievements, isLoading: achievementsLoading } =
    useProfileAchievements(username);
  const { data: lists, isLoading: listsLoading } = useCustomerLists();

  const recentLists = (lists ?? [])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="grid gap-6">
      {/* Quadrant grid: 2x2 on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AboutMeSection profile={profile} isLoading={profileLoading} />
        <CurrentlyPlayingSection
          games={stats?.recentlyPlayed ?? []}
          isLoading={statsLoading}
        />
        <GameCollectionSection
          totalGames={stats?.totalGames ?? 0}
          genres={stats?.genreBreakdown ?? []}
          isLoading={statsLoading}
        />
        <StatsSection stats={stats} isLoading={statsLoading} />
      </div>

      {/* Achievements Overview — full width */}
      <AchievementsOverviewSection
        games={achievements?.games ?? []}
        totalEarned={achievements?.totalEarnedAchievements ?? 0}
        isLoading={achievementsLoading}
        username={username}
      />

      {/* Recent Lists — full width */}
      <Section
        title="Recent Lists"
        action={
          (lists?.length ?? 0) > 5 ? (
            <Link href={`/community/profiles/${username}/lists`}>
              <Button variant="ghost" size="sm" className="h-auto py-0">
                More
                <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
              </Button>
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
  );
}
