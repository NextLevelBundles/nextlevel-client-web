import {
  FaYoutube,
  FaInstagram,
  FaBluesky,
  FaXTwitter,
  FaReddit,
  FaSteam,
} from "react-icons/fa6";

export const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  YouTube: FaYoutube,
  Instagram: FaInstagram,
  Bluesky: FaBluesky,
  Twitter: FaXTwitter,
  Reddit: FaReddit,
  Steam: FaSteam,
};

export const PLATFORM_STYLES: Record<string, { bg: string; text: string; border: string }> = {
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

export const DEFAULT_PLATFORM_STYLE = {
  bg: "bg-muted",
  text: "text-muted-foreground",
  border: "border-border",
};

export const PLATFORM_URL_TEMPLATES: Record<string, (handle: string) => string> = {
  YouTube: (h) => `https://youtube.com/@${h}`,
  Instagram: (h) => `https://instagram.com/${h}`,
  Bluesky: (h) => `https://bsky.app/profile/${h}`,
  Twitter: (h) => `https://x.com/${h}`,
  Reddit: (h) => `https://reddit.com/u/${h}`,
  Steam: (h) => `https://steamcommunity.com/id/${h}`,
};

export const PREDEFINED_PLATFORMS = [
  { key: "YouTube", label: "YouTube" },
  { key: "Instagram", label: "Instagram" },
  { key: "Bluesky", label: "Bluesky" },
  { key: "Twitter", label: "Twitter" },
  { key: "Reddit", label: "Reddit" },
  { key: "Steam", label: "Steam" },
];
