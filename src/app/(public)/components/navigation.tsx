"use client";

import { Button } from "@/shared/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/utils/tailwind";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import Link from "next/link";
import { UserProfile } from "@/home/components/user-profile";
import SignInButton from "@/home/components/SignInButton";
import SignUpButton from "@/home/components/SignUpButton";
import { CartDrawer } from "@/home/components/cart/cart-drawer";
import Logo from "@/app/(shared)/components/logo";

export function PublicNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo width={200} height={50} className="h-12 w-auto" />
          </Link>

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
            <a href="#" className="text-sm font-medium hover:text-primary">
              Blog
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Support
            </a>
          </div>

          <div className="hidden md:flex md:items-center md:gap-2">
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
                  href="/collections"
                  className="text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
                >
                  Collections
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
    </header>
  );
}
