"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PlusIcon, XIcon, Loader2Icon, SaveIcon, GlobeIcon } from "lucide-react";
import {
  FaYoutube,
  FaInstagram,
  FaBluesky,
  FaXTwitter,
  FaReddit,
  FaSteam,
} from "react-icons/fa6";
import { useCustomer } from "@/hooks/queries/useCustomer";
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
} from "@/hooks/queries/useCustomerProfile";
import { toast } from "sonner";
import type {
  SocialHandle,
} from "@/lib/api/types/customer-profile";

const PLATFORM_URL_TEMPLATES: Record<string, (handle: string) => string> = {
  YouTube: (h) => `https://youtube.com/@${h}`,
  Instagram: (h) => `https://instagram.com/${h}`,
  Bluesky: (h) => `https://bsky.app/profile/${h}`,
  Twitter: (h) => `https://x.com/${h}`,
  Reddit: (h) => `https://reddit.com/u/${h}`,
  Steam: (h) => `https://steamcommunity.com/id/${h}`,
};

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

const PREDEFINED_PLATFORMS = [
  { key: "YouTube", label: "YouTube" },
  { key: "Instagram", label: "Instagram" },
  { key: "Bluesky", label: "Bluesky" },
  { key: "Twitter", label: "Twitter" },
  { key: "Reddit", label: "Reddit" },
  { key: "Steam", label: "Steam" },
];

export default function CuratorSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { data: customer } = useCustomer();
  const { data: profile, isLoading } = useCustomerProfile();
  const updateProfile = useUpdateCustomerProfile();

  const [title, setTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [socialHandles, setSocialHandles] = useState<SocialHandle[]>([]);
  const [customHandles, setCustomHandles] = useState<SocialHandle[]>([]);
  const [urlErrors, setUrlErrors] = useState<Record<number, string>>({});

  // Redirect if not own profile
  useEffect(() => {
    if (customer && customer.handle !== username) {
      router.replace(`/community/curators/${username}`);
    }
  }, [customer, username, router]);

  // Initialize form from profile data
  useEffect(() => {
    if (profile) {
      setTitle(profile.title ?? "");
      setHeadline(profile.headline ?? "");
      setSpecialties(profile.specialties ?? "");

      const predefinedKeys = PREDEFINED_PLATFORMS.map((p) => p.key);
      const predefined: SocialHandle[] = [];
      const custom: SocialHandle[] = [];

      for (const sh of profile.socialHandles) {
        if (predefinedKeys.includes(sh.platform)) {
          predefined.push(sh);
        } else {
          custom.push(sh);
        }
      }

      const predefinedMap = new Map(predefined.map((p) => [p.platform, p]));
      setSocialHandles(
        PREDEFINED_PLATFORMS.map((p) => ({
          platform: p.key,
          handle: predefinedMap.get(p.key)?.handle ?? "",
          url: predefinedMap.get(p.key)?.url ?? "",
        }))
      );

      setCustomHandles(
        custom.map((c) => ({
          platform: c.platform,
          handle: c.handle,
          url: c.url ?? "",
        }))
      );

    }
  }, [profile]);

  const updateSocialHandle = (
    index: number,
    field: keyof SocialHandle,
    value: string
  ) => {
    setSocialHandles((prev) =>
      prev.map((sh, i) => (i === index ? { ...sh, [field]: value } : sh))
    );
  };

  const validateUrl = useCallback((value: string): boolean => {
    if (!value.trim()) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, []);

  const updateCustomHandle = (
    index: number,
    field: keyof SocialHandle,
    value: string
  ) => {
    setCustomHandles((prev) =>
      prev.map((sh, i) => (i === index ? { ...sh, [field]: value } : sh))
    );
    if (field === "url") {
      setUrlErrors((prev) => {
        const next = { ...prev };
        if (!value.trim() || validateUrl(value)) {
          delete next[index];
        } else {
          next[index] = "Please enter a valid URL (e.g. https://example.com)";
        }
        return next;
      });
    }
  };

  const addCustomHandle = () => {
    setCustomHandles((prev) => [
      ...prev,
      { platform: "Other", handle: "", url: "" },
    ]);
  };

  const removeCustomHandle = (index: number) => {
    setCustomHandles((prev) => prev.filter((_, i) => i !== index));
    setUrlErrors((prev) => {
      const next: Record<number, string> = {};
      for (const [key, value] of Object.entries(prev)) {
        const k = Number(key);
        if (k < index) next[k] = value;
        else if (k > index) next[k - 1] = value;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newUrlErrors: Record<number, string> = {};
    customHandles.forEach((sh, index) => {
      if (sh.url?.trim() && !validateUrl(sh.url)) {
        newUrlErrors[index] = "Please enter a valid URL (e.g. https://example.com)";
      }
    });
    if (Object.keys(newUrlErrors).length > 0) {
      setUrlErrors(newUrlErrors);
      toast.error("Please fix invalid URLs before saving");
      return;
    }

    const filledPredefined = socialHandles.filter(
      (sh) => sh.handle.trim() !== ""
    );
    const filledCustom = customHandles.filter(
      (sh) => sh.platform.trim() !== "" && sh.handle.trim() !== ""
    );

    try {
      await updateProfile.mutateAsync({
        name: null,
        title: title.trim() || null,
        headline: headline.trim() || null,
        specialties: specialties.trim() || null,
        socialHandles: [
          ...filledPredefined.map((sh) => {
            const trimmedHandle = sh.handle.trim();
            const urlTemplate = PLATFORM_URL_TEMPLATES[sh.platform];
            return {
              platform: sh.platform,
              handle: trimmedHandle,
              url: urlTemplate ? urlTemplate(trimmedHandle) : null,
            };
          }),
          ...filledCustom.map((sh) => ({
            platform: sh.platform.trim(),
            handle: sh.handle.trim(),
            url: sh.url?.trim() || null,
          })),
        ],
        charities: profile?.charities ?? [],
      });
      toast.success("Curator profile updated successfully");
    } catch {
      toast.error("Failed to update curator profile");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-xl font-bold">Curator Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: About Me + Charities */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Me</h3>

            <div className="space-y-2">
              <Label htmlFor="title">Title / Role</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Curator · Former Humble Bundle"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Taste Statement</Label>
              <Textarea
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="What drives your curation? e.g. Just looking for the best of each genre..."
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties</Label>
              <Input
                id="specialties"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="e.g. Metroidvanias, RTS, Idle Games"
                maxLength={500}
              />
            </div>
          </div>

        </div>

        {/* Right column: Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Social Links</h3>

          <div className="space-y-3">
            {socialHandles.map((sh, index) => {
              const Icon = PLATFORM_ICONS[sh.platform];
              const urlTemplate = PLATFORM_URL_TEMPLATES[sh.platform];
              const generatedUrl = sh.handle.trim() && urlTemplate ? urlTemplate(sh.handle.trim()) : null;
              const style = PLATFORM_STYLES[sh.platform];
              return (
                <div key={sh.platform} className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-2 w-28 flex-shrink-0 rounded-full border px-3 py-1.5 ${style ? `${style.bg} ${style.text} ${style.border}` : "bg-muted text-muted-foreground border-border"}`}>
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      <span className="text-xs font-medium">
                        {PREDEFINED_PLATFORMS.find((p) => p.key === sh.platform)?.label}
                      </span>
                    </div>
                    <Input
                      value={sh.handle}
                      onChange={(e) =>
                        updateSocialHandle(index, "handle", e.target.value)
                      }
                      placeholder="Username"
                      className="flex-1"
                    />
                  </div>
                  {generatedUrl && (
                    <p className="text-xs text-muted-foreground ml-[7.75rem] truncate">{generatedUrl}</p>
                  )}
                </div>
              );
            })}

            {/* Custom handles */}
            {customHandles.map((sh, index) => (
              <div key={`custom-${index}`} className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 w-28 flex-shrink-0 rounded-full border bg-muted text-muted-foreground border-border px-3 py-1.5">
                    <GlobeIcon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Other</span>
                  </div>
                  <Input
                    value={sh.handle}
                    onChange={(e) =>
                      updateCustomHandle(index, "handle", e.target.value)
                    }
                    placeholder="Username / handle"
                    className="flex-1"
                  />
                  <Input
                    value={sh.url ?? ""}
                    onChange={(e) =>
                      updateCustomHandle(index, "url", e.target.value)
                    }
                    placeholder="https://example.com"
                    className={`flex-1 ${urlErrors[index] ? "border-red-500" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCustomHandle(index)}
                    className="flex-shrink-0"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
                {urlErrors[index] && (
                  <p className="text-xs text-red-500 ml-[7.75rem]">{urlErrors[index]}</p>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomHandle}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Other Platform
          </Button>
        </div>
      </div>

      {/* Save */}
      <Button type="submit" disabled={updateProfile.isPending || Object.keys(urlErrors).length > 0}>
        {updateProfile.isPending ? (
          <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <SaveIcon className="h-4 w-4 mr-2" />
        )}
        Save Changes
      </Button>
    </form>
  );
}
