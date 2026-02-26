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
  HeartIcon,
  ListIcon,
  BarChart3Icon,
  TrophyIcon,
  SettingsIcon,
  Gamepad2,
  StarIcon,
  GlobeIcon,
  QuoteIcon,
} from "lucide-react";
import {
  PLATFORM_ICONS,
  PLATFORM_STYLES,
  DEFAULT_PLATFORM_STYLE,
} from "@/lib/constants/social-platforms";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useAuth } from "@/shared/providers/auth-provider";
import { useCustomerProfileByHandle } from "@/hooks/queries/useCustomerProfile";
import { useCuratorProfile } from "@/hooks/queries/useCuratorProfile";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const username = params.username as string;
  const { user, isLoading: authLoading } = useAuth();
  const { data: customer, isLoading } = useCustomer();
  const { data: customerProfile, isLoading: profileLoading, isError: profileError } = useCustomerProfileByHandle(username);
  const { data: curatorProfile } = useCuratorProfile(
    customerProfile?.isCurator ? username : ""
  );

  const basePath = `/community/profiles/${username}`;

  const profileTabs = [
    { value: "overview", label: "Profile", href: basePath, icon: UserIcon },
    { value: "collection", label: "Collection", href: `${basePath}/collection`, icon: LibraryIcon },
    { value: "achievements", label: "Achievements", href: `${basePath}/achievements`, icon: TrophyIcon },
    { value: "wishlist", label: "Wishlist", href: `${basePath}/wishlist`, icon: HeartIcon },
    { value: "lists", label: "Lists", href: `${basePath}/lists`, icon: ListIcon },
    { value: "stats", label: "Stats", href: `${basePath}/stats`, icon: BarChart3Icon },
    ...(customerProfile?.isCurator
      ? [{ value: "curated-collections", label: "Curated Collections", href: `${basePath}/curated-collections`, icon: StarIcon }]
      : []),
  ];

  const isOwnProfile = customer?.handle === username;

  const getCurrentTab = () => {
    if (pathname.includes("/game-imports")) return "game-imports";
    if (pathname.includes("/settings")) return "settings";
    if (pathname.includes("/curated-collections")) return "curated-collections";

    if (pathname.includes("/games/")) return "collection";
    if (pathname.includes("/collection")) return "collection";
    if (pathname.includes("/achievements")) return "achievements";
    if (pathname.includes("/wishlist")) return "wishlist";
    if (pathname.includes("/lists")) return "lists";
    if (pathname.includes("/stats")) return "stats";
    return "overview";
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
    }).format(date);
  };

  const avatarUrl = customerProfile?.pictureUrl || customer?.pictureUrl;

  const genreTags = curatorProfile?.genreFocusTags ?? [];
  const specialtyTags = customerProfile?.specialties
    ? customerProfile.specialties.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
        <p className="text-muted-foreground">
          You need to be signed in to view profiles.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return null;
  }

  if (!customer || customer.handle !== username || profileError) {
    return (
      <div className="text-center py-20">
        <UserIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
        <p className="text-muted-foreground">
          The profile &ldquo;{username}&rdquo; does not exist or is not available.
        </p>
      </div>
    );
  }

  const displayName = customerProfile?.name ?? username;

  return (
    <div className="grid gap-6">
      {/* Profile Header */}
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
                <AvatarImage src={avatarUrl} alt={displayName} />
              )}
              <AvatarFallback className="bg-primary/10 text-lg font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                {customerProfile?.isCurator && (
                  <Badge variant="default" className="text-[10px]">
                    Curator
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                @{username}
                {isOwnProfile && customer?.createdAt && (
                  <span className="ml-2">
                    · Member since {formatMemberSince(customer.createdAt)}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                {customerProfile?.title && (
                  <p className="text-sm text-primary font-medium">{customerProfile.title}</p>
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
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {customerProfile?.headline && (
                <div className="flex items-start gap-1.5 mt-1">
                  <QuoteIcon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-primary/60" />
                  <p className="text-sm text-muted-foreground italic">{customerProfile.headline}</p>
                </div>
              )}
              {(customerProfile?.socialHandles?.length ?? 0) > 0 && (
                <div className="flex gap-1.5 mt-1.5">
                  {customerProfile!.socialHandles.map((sh) => {
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
            {profileTabs.map((tab) => (
              <Link key={tab.value} href={tab.href} className="flex">
                <TabsTrigger
                  value={tab.value}
                  className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none cursor-pointer"
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
                {getCurrentTab() === "collection" && (
                  <Link href={`${basePath}/settings/game-imports`} className="flex">
                    <TabsTrigger
                      value="game-imports"
                      className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Import from Steam</span>
                      </div>
                    </TabsTrigger>
                  </Link>
                )}
                <Link href={`${basePath}/settings`} className="flex">
                  <TabsTrigger
                    value="settings"
                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none cursor-pointer"
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
