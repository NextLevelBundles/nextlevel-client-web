"use client";

import { GiftFilterType } from "@/lib/api/types/purchase";
import { cn } from "@/app/(shared)/utils/tailwind";
import { Gift, ShoppingBag, Send, Package } from "lucide-react";

interface GiftFilterProps {
  value: GiftFilterType;
  onChange: (value: GiftFilterType) => void;
  className?: string;
}

const filterOptions: {
  value: GiftFilterType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    value: "All",
    label: "All Purchases",
    icon: Package,
    description: "View all your purchases",
  },
  {
    value: "Owned",
    label: "Owned by me",
    icon: ShoppingBag,
    description: "Items bought for yourself",
  },
  {
    value: "Gifted",
    label: "Gifts Sent by Me",
    icon: Send,
    description: "Items you gifted to others",
  },
  {
    value: "ReceivedByMe",
    label: "Gifts Received",
    icon: Gift,
    description: "Items gifted to you",
  },
];

export function GiftFilter({ value, onChange, className }: GiftFilterProps) {
  return (
    <div className={cn("flex gap-1 p-1 bg-muted rounded-lg", className)}>
      {filterOptions.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer",
              "hover:bg-background/60",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
            title={option.description}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.label.split(" ")[0]}</span>
          </button>
        );
      })}
    </div>
  );
}
