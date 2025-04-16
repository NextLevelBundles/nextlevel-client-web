"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  GamepadIcon,
  ReceiptIcon,
  KeyIcon,
  HeartIcon,
  AwardIcon,
  HelpCircleIcon,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "dashboard", icon: GamepadIcon },
  { name: "Purchase History", href: "purchases", icon: ReceiptIcon },
  { name: "My Keys", href: "keys", icon: KeyIcon },
  { name: "Charity", href: "charity", icon: HeartIcon },
  { name: "Badges", href: "badges", icon: AwardIcon },
  { name: "Support", href: "support", icon: HelpCircleIcon },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/10 hover:text-foreground",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5 transition-colors" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
