"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/shared/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
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
} from "lucide-react";
import { useCustomer } from "@/hooks/queries/useCustomer";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const username = params.username as string;
  const { data: customer, isLoading } = useCustomer();

  const basePath = `/community/profiles/${username}`;

  const profileTabs = [
    { value: "overview", label: "Profile", href: basePath, icon: UserIcon },
    { value: "collection", label: "Collection", href: `${basePath}/collection`, icon: LibraryIcon },
    { value: "achievements", label: "Achievements", href: `${basePath}/achievements`, icon: TrophyIcon },
    { value: "wishlist", label: "Wishlist", href: `${basePath}/wishlist`, icon: HeartIcon },
    { value: "lists", label: "Lists", href: `${basePath}/lists`, icon: ListIcon },
    { value: "stats", label: "Stats", href: `${basePath}/stats`, icon: BarChart3Icon },
  ];

  const isOwnProfile = customer?.handle === username;

  const getCurrentTab = () => {
    if (pathname.includes("/game-imports")) return "game-imports";
    if (pathname.includes("/settings")) return "settings";
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
              <AvatarFallback className="bg-primary/10 text-lg font-semibold">
                {getInitials(customer?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{customer?.name}</h1>
              <p className="text-sm text-muted-foreground">
                @{username}
                {customer?.createdAt && (
                  <span className="ml-2">
                    · Member since {formatMemberSince(customer.createdAt)}
                  </span>
                )}
              </p>
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
                {getCurrentTab() === "collection" && (
                  <Link href={`${basePath}/settings/game-imports`} className="flex">
                    <TabsTrigger
                      value="game-imports"
                      className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
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
