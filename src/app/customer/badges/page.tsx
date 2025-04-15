"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { TrophyIcon, SparklesIcon, HeartIcon, LockIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock data - replace with API call
const userBadges = {
  totalBadges: 4,
  unlockedBadges: 3,
  badges: [
    {
      id: "early-adopter",
      name: "Early Adopter",
      icon: "🕹️",
      description: "You unlocked this by purchasing your very first bundle!",
      shortDescription: "Unlocked after purchasing your first bundle.",
      earned: true,
      earnedDate: "2024-03-15",
      color: "from-blue-500/20 to-blue-600/20",
      glowColor: "shadow-blue-500/50",
      justEarned: false,
    },
    {
      id: "backer",
      name: "Backer",
      icon: "🎮",
      description: "You unlocked this by purchasing 2 bundles.",
      shortDescription: "Unlocked after 2 bundles.",
      earned: true,
      earnedDate: "2024-03-18",
      color: "from-purple-500/20 to-purple-600/20",
      glowColor: "shadow-purple-500/50",
      justEarned: false,
    },
    {
      id: "founder",
      name: "Founder",
      icon: "🧙",
      description:
        "You unlocked this by purchasing 3 bundles. You're an early supporter!",
      shortDescription: "Unlocked after 3 bundles.",
      earned: true,
      earnedDate: "2024-03-20",
      color: "from-amber-500/20 to-amber-600/20",
      glowColor: "shadow-amber-500/50",
      justEarned: false,
    },
    {
      id: "believer",
      name: "Believer",
      icon: "💖",
      description: "You'll unlock this by contributing extra to a cause.",
      shortDescription: "Unlock by donating extra to a cause.",
      earned: false,
      color: "from-gray-500/10 to-gray-600/10",
      glowColor: "shadow-gray-500/30",
      justEarned: false,
    },
  ],
};

function BadgeCard({
  badge,
  index,
}: {
  badge: (typeof userBadges.badges)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden rounded-lg border border-gray-200 dark:border-[#2a2e3d] bg-linear-to-br ${badge.color} p-6 transition-all duration-700 ${
                badge.earned
                  ? `${badge.glowColor} shadow-lg hover:shadow-xl`
                  : "opacity-70"
              }`}
            >
              {/* Sparkle effect for earned badges */}
              {badge.earned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="absolute right-2 top-2"
                >
                  <SparklesIcon className="h-4 w-4 text-yellow-400" />
                </motion.div>
              )}

              <div className="flex flex-col items-center gap-4 text-center">
                <span className="text-4xl">{badge.icon}</span>
                <div>
                  <h3 className="mb-1 font-semibold">{badge.name}</h3>
                  {badge.earned && (
                    <p className="text-xs text-muted-foreground">
                      Earned on{" "}
                      {new Date(badge.earnedDate ?? "").toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Lock overlay for unearned badges */}
              {!badge.earned && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-[#0f111a]/40 backdrop-blur-[1px]">
                  <div className="rounded-full bg-white/90 dark:bg-[#202430]/80 p-2">
                    <LockIcon className="h-6 w-6 animate-subtle-pulse text-muted-foreground" />
                  </div>
                </div>
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className={`max-w-[200px] text-center ${!badge.earned ? "bg-white dark:bg-[#202430]/80" : ""}`}
          >
            <p>
              {badge.earned
                ? badge.description
                : `🔒 Locked — ${badge.shortDescription}`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}

export default function BadgesPage() {
  const progressPercentage =
    (userBadges.unlockedBadges / userBadges.totalBadges) * 100;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">🏆 Your Achievements</h1>
        <p className="text-muted-foreground">
          These badges recognize your support and generosity on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-primary" />
            Badge Collection Progress
          </CardTitle>
          <CardDescription>
            {userBadges.unlockedBadges === userBadges.totalBadges
              ? "You've unlocked all available badges!"
              : `${userBadges.totalBadges - userBadges.unlockedBadges} more ${
                  userBadges.totalBadges - userBadges.unlockedBadges === 1
                    ? "badge"
                    : "badges"
                } to unlock`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Progress
              value={progressPercentage}
              className="flex-1 transition-all duration-700"
            />
            <span className="text-sm text-muted-foreground">
              {userBadges.unlockedBadges} / {userBadges.totalBadges} Unlocked
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {userBadges.badges.map((badge, index) => (
          <BadgeCard key={badge.id} badge={badge} index={index} />
        ))}
      </div>

      <Card className="bg-linear-to-br from-primary/5 to-primary/0 dark:from-primary/20 dark:to-primary/10">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full bg-primary/10 dark:bg-primary/30 p-3">
            <HeartIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="mb-1 font-semibold">Want to earn more badges?</h3>
            <p className="text-sm text-muted-foreground">
              Support amazing causes through bundle purchases to unlock special
              achievements!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
