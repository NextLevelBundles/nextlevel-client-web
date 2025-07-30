"use client";

import { useState, useEffect } from "react";
import { cn } from "@/shared/utils/tailwind";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import SignOutButton from "@/app/(home)/components/SignOutButton";
import Logo from "@/app/(shared)/components/logo";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60"
          : "bg-transparent"
      )}
    >
      <div className="container px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-3">
              <Logo width={140} height={0} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="cursor-pointer">
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
