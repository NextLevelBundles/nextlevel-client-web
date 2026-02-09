"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PlusIcon, XIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { useCustomer } from "@/hooks/queries/useCustomer";
import {
  useCommunityProfile,
  useUpdateCommunityProfile,
} from "@/hooks/queries/useCommunityProfile";
import { toast } from "sonner";
import type {
  SocialHandle,
  ProfileCharity,
} from "@/lib/api/types/customer-profile";

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
      { platform: "", handle: "", url: "" },
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
      await updateProfile.mutateAsync({
        title: title.trim() || null,
        headline: headline.trim() || null,
        specialties: specialties.trim() || null,
        socialHandles: [
          ...filledPredefined.map((sh) => ({
            platform: sh.platform,
            handle: sh.handle.trim(),
            url: sh.url?.trim() || null,
          })),
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
      <h2 className="text-xl font-bold">Profile Settings</h2>

      {/* Profile Info */}
      <div className="space-y-4">
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
          {socialHandles.map((sh, index) => (
            <div key={sh.platform} className="flex items-center gap-3">
              <span className="text-sm font-medium w-24 flex-shrink-0">
                {PREDEFINED_PLATFORMS.find((p) => p.key === sh.platform)?.label}
              </span>
              <Input
                value={sh.handle}
                onChange={(e) =>
                  updateSocialHandle(index, "handle", e.target.value)
                }
                placeholder="Username / handle"
                className="flex-1"
              />
              <Input
                value={sh.url ?? ""}
                onChange={(e) =>
                  updateSocialHandle(index, "url", e.target.value)
                }
                placeholder="URL (optional)"
                className="flex-1"
              />
            </div>
          ))}

          {/* Custom handles */}
          {customHandles.map((sh, index) => (
            <div key={`custom-${index}`} className="flex items-center gap-3">
              <Input
                value={sh.platform}
                onChange={(e) =>
                  updateCustomHandle(index, "platform", e.target.value)
                }
                placeholder="Platform"
                className="w-24 flex-shrink-0"
              />
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
                placeholder="URL (optional)"
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
          Add Custom Platform
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

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCharity}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Charity
        </Button>
      </div>

      {/* Save */}
      <Button type="submit" disabled={updateProfile.isPending}>
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
