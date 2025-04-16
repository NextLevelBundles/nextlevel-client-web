"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import { Gamepad2, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/app/(shared)/utils/tailwind";

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
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="font-orbitron text-xl font-bold">NextLevel</span>
          </div>

          <div className="hidden md:flex md:items-center md:gap-8">
            <a href="#" className="text-sm font-medium hover:text-primary">
              Home
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Bundles
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Blog
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Support
            </a>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            <Button variant="ghost" className="hover:text-primary">
              Login
            </Button>
            <Button className="bg-primary text-white hover:bg-primary/90">
              Sign Up
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-border/50 py-4 md:hidden bg-card/95 backdrop-blur-xs shadow-lg ring-1 ring-primary/30 rounded-b-lg">
            <div className="flex flex-col space-y-4">
              <a href="#" className="text-sm font-medium hover:text-primary">
                Home
              </a>
              <a href="#" className="text-sm font-medium hover:text-primary">
                Bundles
              </a>
              <a href="#" className="text-sm font-medium hover:text-primary">
                Blog
              </a>
              <a href="#" className="text-sm font-medium hover:text-primary">
                Support
              </a>
              <div className="flex gap-4 pt-4">
                <Button variant="ghost" className="flex-1 hover:text-primary">
                  Login
                </Button>
                <Button className="flex-1 bg-primary text-white hover:bg-primary/90 hover:shadow-[0_0_12px_rgba(57,130,245,0.4)] transition-shadow duration-200">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
