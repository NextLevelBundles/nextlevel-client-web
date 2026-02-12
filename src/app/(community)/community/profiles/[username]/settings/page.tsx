"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PlusIcon, XIcon, Loader2Icon, SaveIcon, DownloadIcon, CheckIcon, GlobeIcon, SearchIcon, HeartIcon } from "lucide-react";
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

interface EveryOrgNonprofit {
  name: string;
  profileUrl: string;
  logoUrl: string | null;
  description: string | null;
  websiteUrl: string | null;
}

function CharitySearch({
  onSelect,
  disabled,
}: {
  onSelect: (charity: ProfileCharity) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EveryOrgNonprofit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_EVERY_ORG_API_KEY;
        if (!apiKey) {
          setResults([]);
          return;
        }
        const res = await fetch(
          `https://partners.every.org/v0.2/search/${encodeURIComponent(query.trim())}?apiKey=${apiKey}&take=5`
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data.nonprofits ?? []);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(nonprofit: EveryOrgNonprofit) {
    onSelect({
      name: nonprofit.name,
      link: nonprofit.websiteUrl || nonprofit.profileUrl || null,
      logo: nonprofit.logoUrl || null,
      description: nonprofit.description?.slice(0, 200) || null,
    });
    setQuery("");
    setResults([]);
    setShowResults(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search for a charity..."
          className="pl-9"
          disabled={disabled}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {results.map((nonprofit, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(nonprofit)}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-muted/50 transition-colors first:rounded-t-md last:rounded-b-md"
            >
              <div className="w-8 h-8 rounded flex-shrink-0 overflow-hidden bg-muted/50">
                {nonprofit.logoUrl ? (
                  <Image
                    src={nonprofit.logoUrl}
                    alt={nonprofit.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HeartIcon className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{nonprofit.name}</p>
                {nonprofit.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {nonprofit.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && query.trim() && !isSearching && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg px-3 py-2.5">
          <p className="text-sm text-muted-foreground">No charities found.</p>
        </div>
      )}
    </div>
  );
}

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
  const [urlErrors, setUrlErrors] = useState<Record<number, string>>({});

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

  const validateUrl = (value: string): boolean => {
    if (!value.trim()) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

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

  const addCharity = (charity: ProfileCharity) => {
    if (charities.length >= 3) return;
    // Prevent duplicates by name
    if (charities.some((c) => c.name === charity.name)) {
      toast.info(`${charity.name} is already added.`);
      return;
    }
    setCharities((prev) => [...prev, charity]);
  };

  const removeCharity = (index: number) => {
    setCharities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate custom handle URLs before saving
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Profile Settings</h2>
        <Link href={`/community/profiles/${username}/settings/game-imports`}>
          <Button type="button" variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-1" />
            Game Imports
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: About Me + Charities */}
        <div className="space-y-8">
          {/* Profile Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Me</h3>

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

          {/* Charities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preferred Charities</h3>
            <p className="text-sm text-muted-foreground">
              Search and add up to 3 charities you support.
            </p>

            {charities.length < 3 && (
              <CharitySearch
                onSelect={addCharity}
                disabled={charities.length >= 3}
              />
            )}

            {charities.length > 0 && (
              <div className="space-y-3">
                {charities.map((charity, index) => (
                  <div
                    key={charity.name}
                    className="flex items-start gap-3 rounded-md border p-3"
                  >
                    <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden bg-muted/50">
                      {charity.logo ? (
                        <Image
                          src={charity.logo}
                          alt={charity.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HeartIcon className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {charity.link ? (
                          <a
                            href={charity.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline truncate"
                          >
                            {charity.name}
                          </a>
                        ) : (
                          <p className="text-sm font-medium truncate">{charity.name}</p>
                        )}
                      </div>
                      {charity.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {charity.description}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCharity(index)}
                      className="flex-shrink-0 h-7 w-7"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
      <Button type="submit" disabled={updateProfile.isPending || updateHandle.isPending || (handleChanged && !handleAvailable) || isCheckingHandle || Object.keys(urlErrors).length > 0}>
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
