"use client";

import { Button } from "@/shared/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/shared/utils/tailwind";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import Link from "next/link";
import { UserProfile } from "./user-profile";
import SignInButton from "./SignInButton";
import SignUpButton from "./SignUpButton";
import { CartDrawer } from "./cart/cart-drawer";
import Logo from "@/app/(shared)/components/logo";
import { UserCredits } from "@/app/(shared)/components/user-credits";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <Link href="/" className="p-3">
              <Logo width={140} height={0} />
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-8">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/bundles"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Bundles
            </Link>
            <Link
              href="/exchange"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Exchange
            </Link>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Blog
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Support
            </a>
          </div>

          <div className="hidden md:flex md:items-center md:gap-2">
            <UserCredits variant="compact" />
            <ThemeToggle />
            <CartDrawer />
            <UserProfile />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div
            className={cn(
              "absolute top-full left-0 right-0 mt-2 mx-4 rounded-xl z-50",
              "bg-white/80 dark:bg-card/80 backdrop-blur-xl backdrop-blur-fallback",
              "border border-black/10 dark:border-white/10",
              "shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
              "animate-in fade-in-0 slide-in-from-top-2 duration-200",
              "before:absolute before:inset-[1px] before:rounded-[11px] before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none"
            )}
          >
            <div className="flex flex-col px-6 py-4">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/bundles"
                  className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
                >
                  Bundles
                </Link>
                <Link
                  href="/exchange"
                  className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
                >
                  Exchange
                </Link>
                <a
                  href="#"
                  className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
                >
                  Blog
                </a>
                <a
                  href="#"
                  className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
                >
                  Support
                </a>
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
                <ThemeToggle />
                <CartDrawer />
                <div className="flex gap-2">
                  <SignInButton />
                  <SignUpButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
