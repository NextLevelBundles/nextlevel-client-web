"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/customer/components/ui/dialog";
import { Progress } from "@/customer/components/ui/progress";
import { Badge } from "@/customer/components/ui/badge";
import { TrophyIcon, SparklesIcon } from "lucide-react";

interface GameLevelProgressProps {
  currentLevel: {
    level: number;
    title: string;
    required: number;
    icon: string;
  };
  nextLevel?: {
    level: number;
    title: string;
    required: number;
    icon: string;
  };
  revealedKeys: number;
  totalKeys: number;
}

export function GameLevelProgress({
  currentLevel,
  nextLevel,
  revealedKeys,
  totalKeys,
}: GameLevelProgressProps) {
  const progressPercentage = nextLevel
    ? ((revealedKeys - currentLevel.required) /
        (nextLevel.required - currentLevel.required)) *
      100
    : 100;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          className="flex items-center gap-4 rounded-lg border bg-card/30 p-3 cursor-pointer hover:bg-card/50 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="rounded-full bg-primary/10 p-2">
            <TrophyIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{currentLevel.icon}</span>
              <span className="font-medium">{currentLevel.title}</span>
              {nextLevel && (
                <SparklesIcon className="h-4 w-4 text-yellow-500 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <Progress value={progressPercentage} className="h-2 w-24" />
              <span className="text-sm text-muted-foreground">
                {revealedKeys}/{nextLevel?.required || totalKeys} keys
              </span>
            </div>
          </div>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-primary" />
            Game Collector Progress
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            {[currentLevel, ...(nextLevel ? [nextLevel] : [])].map(
              (level, index) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-lg border p-4 ${
                    level === currentLevel
                      ? "bg-primary/5 border-primary/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{level.icon}</span>
                    <span className="font-medium">{level.title}</span>
                    {level === currentLevel && (
                      <Badge variant="default" className="ml-auto">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Unlock this badge by revealing {level.required} game keys
                  </p>
                  {level === currentLevel && nextLevel && (
                    <div className="mt-2">
                      <Progress value={progressPercentage} className="h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {nextLevel.required - revealedKeys} more keys until{" "}
                        {nextLevel.title}
                      </p>
                    </div>
                  )}
                </motion.div>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
