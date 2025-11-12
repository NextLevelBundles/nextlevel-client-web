"use client";

import { useState, useEffect } from "react";

interface BundleCountdownProps {
  startDate: Date;
}

export function BundleCountdown({ startDate }: BundleCountdownProps) {
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const start = startDate.getTime();
      const distance = start - now;

      if (distance < 0) {
        setCountdown(null);
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  if (!countdown) {
    return <span>This bundle has not started yet.</span>;
  }

  return (
    <span>
      Starts in {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
    </span>
  );
}
