"use client";

import { useParams } from "next/navigation";
import {
  GlobeIcon,
} from "lucide-react";
import {
  FaYoutube,
  FaInstagram,
  FaBluesky,
  FaXTwitter,
  FaReddit,
  FaSteam,
} from "react-icons/fa6";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useCommunityProfileByHandle } from "@/hooks/queries/useCommunityProfile";

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

export default function CuratorOverviewPage() {
  const params = useParams();
  const username = params.username as string;
  const { data: profile, isLoading } = useCommunityProfileByHandle(username);

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="flex items-center border-b px-5 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide">About Me</h3>
        </div>
        <div className="p-5 space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </Card>
    );
  }

  const hasContent =
    profile?.title ||
    profile?.headline ||
    profile?.specialties ||
    (profile?.socialHandles?.length ?? 0) > 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center border-b px-5 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide">About Me</h3>
      </div>
      <div className="p-5">
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
                  {profile!.socialHandles.map((sh) => {
                    const Icon = PLATFORM_ICONS[sh.platform] ?? GlobeIcon;
                    const style = PLATFORM_STYLES[sh.platform] ?? DEFAULT_PLATFORM_STYLE;
                    return sh.url ? (
                      <a
                        key={sh.platform}
                        href={sh.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full border px-3 py-1.5 transition-opacity hover:opacity-80 ${style.bg} ${style.text} ${style.border}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {sh.handle}
                      </a>
                    ) : (
                      <span
                        key={sh.platform}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full border px-3 py-1.5 ${style.bg} ${style.text} ${style.border}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {sh.handle}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Nothing here yet. Details coming soon.
          </p>
        )}
      </div>
    </Card>
  );
}
