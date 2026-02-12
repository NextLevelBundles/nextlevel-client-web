"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/shared/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  UserIcon,
  LibraryIcon,
  SettingsIcon,
  GlobeIcon,
  QuoteIcon,
} from "lucide-react";
import {
  FaYoutube,
  FaInstagram,
  FaBluesky,
  FaXTwitter,
  FaReddit,
  FaSteam,
} from "react-icons/fa6";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useCommunityProfileByHandle } from "@/hooks/queries/useCommunityProfile";
import { useCuratorProfile } from "@/hooks/queries/useCuratorProfile";

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  YouTube: FaYoutube,
  Instagram: FaInstagram,
  Bluesky: FaBluesky,
  Twitter: FaXTwitter,
  Reddit: FaReddit,
  Steam: FaSteam,
};

const PLATFORM_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  YouTube: {
    bg: "bg-red-500/10 dark:bg-red-500/20",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/20 dark:border-red-500/30",
  },
  Instagram: {
    bg: "bg-pink-500/10 dark:bg-pink-500/20",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-500/20 dark:border-pink-500/30",
  },
  Bluesky: {
    bg: "bg-sky-500/10 dark:bg-sky-500/20",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20 dark:border-sky-500/30",
  },
  Twitter: {
    bg: "bg-neutral-500/10 dark:bg-neutral-400/20",
    text: "text-neutral-700 dark:text-neutral-300",
    border: "border-neutral-500/20 dark:border-neutral-400/30",
  },
  Reddit: {
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20 dark:border-orange-500/30",
  },
  Steam: {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20 dark:border-indigo-500/30",
  },
};

const DEFAULT_PLATFORM_STYLE = {
  bg: "bg-muted",
  text: "text-muted-foreground",
  border: "border-border",
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CuratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const username = params.username as string;
  const { data: customer, isLoading } = useCustomer();
  const { data: profile } = useCommunityProfileByHandle(username);
  const { data: curatorProfile } = useCuratorProfile(username);

  const basePath = `/community/curators/${username}`;

  const curatorTabs = [
    { value: "overview", label: "Overview", href: basePath, icon: UserIcon },
    { value: "collections", label: "Collections", href: `${basePath}/collections`, icon: LibraryIcon },
  ];

  const isOwnProfile = customer?.handle === username;

  const getCurrentTab = () => {
    if (pathname.includes("/settings")) return "settings";
    if (pathname.includes("/collections")) return "collections";
    return "overview";
  };

  const avatarUrl = profile?.pictureUrl || customer?.pictureUrl;

  const genreTags = curatorProfile?.genreFocusTags ?? [];
  const specialtyTags = profile?.specialties
    ? profile.specialties.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="grid gap-6">
      {/* Curator Header */}
      <div className="flex items-center gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </>
        ) : (
          <>
            <Avatar className="h-16 w-16">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={profile?.handle ?? username} />
              )}
              <AvatarFallback className="bg-primary/10 text-lg font-semibold">
                {getInitials(profile?.handle ?? username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{profile?.handle ?? username}</h1>
                <Link
                  href={`/community/profiles/${username}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  View Profile
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                {profile?.title && (
                  <p className="text-sm text-primary font-medium">{profile.title}</p>
                )}
                {(curatorProfile?.curatedBundlesCount ?? 0) > 0 && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">
                      {curatorProfile!.curatedBundlesCount} Collections Curated
                    </span>
                  </>
                )}
                {(genreTags.length > 0 || specialtyTags.length > 0) && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <div className="flex flex-wrap gap-1">
                      {(genreTags.length > 0 ? genreTags : specialtyTags).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {profile?.headline && (
                <div className="flex items-start gap-1.5 mt-1">
                  <QuoteIcon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-primary/60" />
                  <p className="text-sm text-muted-foreground italic">{profile.headline}</p>
                </div>
              )}
              {(profile?.socialHandles?.length ?? 0) > 0 && (
                <div className="flex gap-1.5 mt-1.5">
                  {profile!.socialHandles.map((sh) => {
                    const Icon = PLATFORM_ICONS[sh.platform] ?? GlobeIcon;
                    const style = PLATFORM_STYLES[sh.platform] ?? DEFAULT_PLATFORM_STYLE;
                    return sh.url ? (
                      <a
                        key={sh.platform}
                        href={sh.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${sh.platform}: ${sh.handle}`}
                        className={`inline-flex items-center justify-center h-7 w-7 rounded-full border transition-opacity hover:opacity-80 ${style.bg} ${style.text} ${style.border}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span
                        key={sh.platform}
                        title={`${sh.platform}: ${sh.handle}`}
                        className={`inline-flex items-center justify-center h-7 w-7 rounded-full border ${style.bg} ${style.text} ${style.border}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Tab Navigation */}
      <Card className="p-1">
        <Tabs value={getCurrentTab()} className="w-full">
          <TabsList className="w-full justify-start gap-4 rounded-none border-b bg-transparent p-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {curatorTabs.map((tab) => (
              <Link key={tab.value} href={tab.href} className="flex">
                <TabsTrigger
                  value={tab.value}
                  className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </div>
                </TabsTrigger>
              </Link>
            ))}
            {isOwnProfile && (
              <div className="flex items-center ml-auto gap-1">
                <Link href={`${basePath}/settings`} className="flex">
                  <TabsTrigger
                    value="settings"
                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </TabsTrigger>
                </Link>
              </div>
            )}
          </TabsList>
          <div className="p-4">{children}</div>
        </Tabs>
      </Card>
    </div>
  );
}
