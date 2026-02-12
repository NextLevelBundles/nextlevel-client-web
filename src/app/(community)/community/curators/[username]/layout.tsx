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
} from "lucide-react";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useCommunityProfileByHandle } from "@/hooks/queries/useCommunityProfile";
import { useCuratorProfile } from "@/hooks/queries/useCuratorProfile";

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
                {specialtyTags.length > 0 && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <div className="flex flex-wrap gap-1">
                      {specialtyTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
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
