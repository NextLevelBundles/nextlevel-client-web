import { useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { padded } from "@/app/(shared)/utils/numbers";

dayjs.extend(duration);

export function useCountdownTimer(endTime?: string) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    function updateCountdown() {
      if (!endTime) {
        setTimeLeft("00:00:00");
        return;
      }

      const future = dayjs(endTime);
      const now = dayjs();
      const diffMs = future.diff(now);

      const dur = dayjs.duration(diffMs);
      const days = dur.days();
      const hours = padded(dur.hours());
      const minutes = padded(dur.minutes());
      const seconds = padded(dur.seconds());

      const formatted =
        dur.days() > 0
          ? `${days}d ${hours}:${minutes}:${seconds}`
          : `${hours}:${minutes}:${seconds}s`;

      setTimeLeft(formatted);
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return timeLeft;
}
