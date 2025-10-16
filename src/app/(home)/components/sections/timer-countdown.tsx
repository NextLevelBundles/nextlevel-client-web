"use client";

import { useCountdownTimer } from "@/app/(shared)/hooks/useCountdownTimer";
import { Timer } from "lucide-react";

export function TimerCountdown({ endTime }: { endTime: string }) {
  const { timeLeft, hasEnded } = useCountdownTimer(endTime);

  return (
    <div className="rounded-lg bg-white/60 dark:bg-muted/50 p-4 backdrop-blur-xs ring-1 ring-black/5 dark:ring-white/10 shadow-xs before:absolute before:inset-[1px] before:rounded-lg before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none relative sm:bg-white/50 md:bg-white/60 lg:bg-white/70">
      <div className="flex items-center gap-2 text-[#64748b] dark:text-muted-foreground">
        <Timer className="h-5 w-5" />
        <span className="text-secondary">{hasEnded ? "Ended" : "Ends in"}</span>
      </div>
      <div className="font-mono text-2xl font-bold text-secondary">
        {timeLeft}
      </div>
    </div>
  );
}
