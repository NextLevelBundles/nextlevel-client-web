"use client";

import { Coins, Loader2 } from "lucide-react";
import { useUserCredits } from "@/hooks/queries/use-user-credits";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/utils/tailwind";
import Link from "next/link";

interface UserCreditsProps {
  variant?: "default" | "compact";
  showTooltip?: boolean;
  className?: string;
}

export function UserCredits({
  variant = "default",
  showTooltip = true,
  className
}: UserCreditsProps) {
  const { data: credits, isLoading } = useUserCredits();

  const content = (
    <Link
      href="/exchange"
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors cursor-pointer",
        variant === "default"
          ? "bg-gray-50 hover:bg-gray-100 dark:bg-[#202430] dark:hover:bg-[#273043]"
          : "hover:bg-gray-100 dark:hover:bg-[#273043]",
        className
      )}
    >
      <Coins className="h-4 w-4 text-primary" />
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">Credits:</span>
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <span className="text-sm font-bold text-primary">{credits ?? 0}</span>
        )}
      </div>
    </Link>
  );

  if (!showTooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to visit the Exchange</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}