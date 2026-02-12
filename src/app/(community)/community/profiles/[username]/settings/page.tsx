"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PlusIcon, XIcon, Loader2Icon, SaveIcon, DownloadIcon, CheckIcon, GlobeIcon } from "lucide-react";
import {
  FaYoutube,
  FaInstagram,
  FaBluesky,
  FaXTwitter,
  FaReddit,
  FaSteam,
} from "react-icons/fa6";
import { useCustomer, useUpdateHandle } from "@/hooks/queries/useCustomer";
import { userApi } from "@/lib/api";
import Link from "next/link";
import {
  useCommunityProfile,
  useUpdateCommunityProfile,
} from "@/hooks/queries/useCommunityProfile";
import { toast } from "sonner";
import type {
  SocialHandle,
  ProfileCharity,
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

const PREDEFINED_PLATFORMS = [
  { key: "YouTube", label: "YouTube" },
  { key: "Instagram", label: "Instagram" },
  { key: "Bluesky", label: "Bluesky" },
  { key: "Twitter", label: "Twitter" },
  { key: "Reddit", label: "Reddit" },
  { key: "Steam", label: "Steam" },
];

export default function ProfileSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { data: customer } = useCustomer();
  const { data: profile, isLoading } = useCommunityProfile();
  const updateProfile = useUpdateCommunityProfile();
  const updateHandle = useUpdateHandle();

  const [handle, setHandle] = useState("");
  const [originalHandle, setOriginalHandle] = useState("");
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [title, setTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [socialHandles, setSocialHandles] = useState<SocialHandle[]>([]);
  const [customHandles, setCustomHandles] = useState<SocialHandle[]>([]);
  const [charities, setCharities] = useState<ProfileCharity[]>([]);

  // Redirect if not own profile
  useEffect(() => {
    if (customer && customer.handle !== username) {
      router.replace(`/community/profiles/${username}`);
    }
  }, [customer, username, router]);

  // Initialize handle from customer data
  useEffect(() => {
    if (customer?.handle) {
      setHandle(customer.handle);
      setOriginalHandle(customer.handle);
    }
  }, [customer]);

  const handleHandleChange = useCallback((value: string) => {
    const allowedChars = /[a-z0-9.\-_!@#$%^&*()=+]/g;
    const filtered = value
      .toLowerCase()
      .match(allowedChars)
      ?.join("") ?? "";
    setHandle(filtered);
    setHandleAvailable(null);
  }, []);

  // Debounced handle availability check
  useEffect(() => {
    if (!handle.trim() || handle === originalHandle) {
      setHandleAvailable(null);
      setIsCheckingHandle(false);
      return;
    }

    setIsCheckingHandle(true);
    const timeoutId = setTimeout(async () => {
      try {
        const isAvailable = await userApi.checkHandleAvailability(handle);
        setHandleAvailable(isAvailable);
      } catch {
        setHandleAvailable(null);
      } finally {
        setIsCheckingHandle(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [handle, originalHandle]);

  const handleChanged = handle !== originalHandle;
  const handleValid = !handleChanged || handleAvailable === true;

  // Initialize form from profile data
  useEffect(() => {
    if (profile) {
      setTitle(profile.title ?? "");
      setHeadline(profile.headline ?? "");
      setSpecialties(profile.specialties ?? "");

      // Split social handles into predefined and custom
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

      // Build the predefined list (ensure all 6 are present)
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

      setCharities(
        profile.charities.map((c) => ({
          name: c.name,
          link: c.link ?? "",
          logo: c.logo ?? "",
          description: c.description ?? "",
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

  const updateCustomHandle = (
    index: number,
    field: keyof SocialHandle,
    value: string
  ) => {
    setCustomHandles((prev) =>
      prev.map((sh, i) => (i === index ? { ...sh, [field]: value } : sh))
    );
  };

  const addCustomHandle = () => {
    setCustomHandles((prev) => [
      ...prev,
      { platform: "Other", handle: "", url: "" },
    ]);
  };

  const removeCustomHandle = (index: number) => {
    setCustomHandles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCharity = (
    index: number,
    field: keyof ProfileCharity,
    value: string
  ) => {
    setCharities((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const addCharity = () => {
    setCharities((prev) => [
      ...prev,
      { name: "", link: "", logo: "", description: "" },
    ]);
  };

  const removeCharity = (index: number) => {
    setCharities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only include predefined handles that have a value
    const filledPredefined = socialHandles.filter(
      (sh) => sh.handle.trim() !== ""
    );
    const filledCustom = customHandles.filter(
      (sh) => sh.platform.trim() !== "" && sh.handle.trim() !== ""
    );
    const filledCharities = charities.filter(
      (c) => c.name.trim() !== ""
    );

    try {
      // Update handle if changed
      if (handleChanged && handleAvailable) {
        await updateHandle.mutateAsync(handle);
        setOriginalHandle(handle);
        setHandleAvailable(null);
        // Redirect to new handle URL
        router.replace(`/community/profiles/${handle}/settings`);
      }

      await updateProfile.mutateAsync({
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
        charities: filledCharities.map((c) => ({
          name: c.name.trim(),
          link: c.link?.trim() || null,
          logo: c.logo?.trim() || null,
          description: c.description?.trim() || null,
        })),
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Profile Settings</h2>
        <Link href={`/community/profiles/${username}/settings/game-imports`}>
          <Button type="button" variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-1" />
            Game Imports
          </Button>
        </Link>
      </div>

      {/* Profile Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="handle">Handle</Label>
          <div className="relative">
            <Input
              id="handle"
              value={handle}
              onChange={(e) => handleHandleChange(e.target.value)}
              placeholder="Your unique handle"
              maxLength={30}
            />
            {isCheckingHandle && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isCheckingHandle && handleChanged && handleAvailable === true && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckIcon className="h-4 w-4 text-green-500" />
              </div>
            )}
            {!isCheckingHandle && handleChanged && handleAvailable === false && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <XIcon className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
          {handleChanged && handleAvailable === false && (
            <p className="text-sm text-red-500">This handle is already taken.</p>
          )}
          {handleChanged && handleAvailable === true && (
            <p className="text-sm text-green-500">Handle is available!</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Game Collector, Speedrunner, Indie Enthusiast"
            maxLength={255}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="headline">Headline</Label>
          <Textarea
            id="headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Write something about yourself..."
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
            placeholder="e.g. RPGs, Indie Games, Retro Gaming"
            maxLength={500}
          />
        </div>
      </div>

      {/* Social Handles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Links</h3>

        <div className="space-y-3">
          {socialHandles.map((sh, index) => {
            const Icon = PLATFORM_ICONS[sh.platform];
            const urlTemplate = PLATFORM_URL_TEMPLATES[sh.platform];
            const generatedUrl = sh.handle.trim() && urlTemplate ? urlTemplate(sh.handle.trim()) : null;
            return (
              <div key={sh.platform} className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-28 flex-shrink-0">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium">
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
            <div key={`custom-${index}`} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-28 flex-shrink-0">
                <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Other</span>
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
                placeholder="URL"
                className="flex-1"
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

      {/* Charities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Charities</h3>

        <div className="space-y-4">
          {charities.map((charity, index) => (
            <div
              key={index}
              className="space-y-2 rounded-md border p-3 relative"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCharity(index)}
                className="absolute top-2 right-2 h-6 w-6"
              >
                <XIcon className="h-3 w-3" />
              </Button>
              <div className="grid grid-cols-2 gap-3 pr-8">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={charity.name}
                    onChange={(e) =>
                      updateCharity(index, "name", e.target.value)
                    }
                    placeholder="Charity name"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Link</Label>
                  <Input
                    value={charity.link ?? ""}
                    onChange={(e) =>
                      updateCharity(index, "link", e.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  value={charity.description ?? ""}
                  onChange={(e) =>
                    updateCharity(index, "description", e.target.value)
                  }
                  placeholder="Brief description"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        {charities.length < 3 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCharity}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Charity
          </Button>
        )}
      </div>

      {/* Save */}
      <Button type="submit" disabled={updateProfile.isPending || updateHandle.isPending || (handleChanged && !handleAvailable) || isCheckingHandle}>
        {updateProfile.isPending || updateHandle.isPending ? (
          <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <SaveIcon className="h-4 w-4 mr-2" />
        )}
        Save Changes
      </Button>
    </form>
  );
}
