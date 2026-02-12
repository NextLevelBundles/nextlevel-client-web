"use client";

import { Button } from "@/shared/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/shared/utils/tailwind";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import Link from "next/link";
import { UserProfile } from "@/home/components/user-profile";
import { CartDrawer } from "@/home/components/cart/cart-drawer";
import Logo from "@/app/(shared)/components/logo";
import { UserCredits } from "@/app/(shared)/components/user-credits";
import { useAuth } from "@/app/(shared)/providers/auth-provider";

export function CommunityNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();

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
              href="/collections"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/exchange"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Exchange
            </Link>
            <a
              href="https://sites.google.com/digiphile.co/help/construction"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-primary"
            >
              Blog
            </a>
            <a
              href="https://sites.google.com/digiphile.co/help"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-primary"
            >
              Support
            </a>
          </div>

          <div className="hidden md:flex md:items-center md:gap-2">
            {user && <UserCredits variant="compact" />}
            <ThemeToggle />
            {!isAuthLoading && <CartDrawer />}
            <UserProfile />
          </div>

          {/* Mobile Navigation Icons - Always Visible */}
          <div className="flex md:hidden items-center gap-2">
            {!isAuthLoading && <CartDrawer />}
            <UserProfile />
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className={cn(
              "absolute top-full left-0 right-0 z-50",
              "bg-white dark:bg-card border-t border-border",
              "shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
              "animate-in fade-in-0 slide-in-from-top-2 duration-200"
            )}
          >
            <div className="flex flex-col px-6 py-4">
              <div className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-primary/5"
                >
                  Home
                </Link>
                <Link
                  href="/collections"
                  className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-primary/5"
                >
                  Collections
                </Link>
                <Link
                  href="/exchange"
                  className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-primary/5"
                >
                  Exchange
                </Link>
                <a
                  href="https://sites.google.com/digiphile.co/help/construction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-primary/5"
                >
                  Blog
                </a>
                <a
                  href="https://sites.google.com/digiphile.co/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-primary/5"
                >
                  Support
                </a>
              </div>
              <div className="flex items-center justify-center pt-4 mt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
