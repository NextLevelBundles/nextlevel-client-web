"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import {
  Gamepad2,
  Twitter,
  Github,
  Disc as Discord,
  ArrowUp,
} from "lucide-react";

const footerLinks = {
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Safety", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
  ],
  Developers: [
    { label: "Submit Games", href: "#" },
    { label: "Developer Portal", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "Analytics", href: "#" },
  ],
  Resources: [
    { label: "Steam Keys", href: "#" },
    { label: "Gift Cards", href: "#" },
    { label: "Rewards", href: "#" },
    { label: "Status", href: "#" },
  ],
};

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border/50 bg-linear-to-b from-background via-[#0e121b] to-[#090c12]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(57,130,245,0.08),transparent_60%)]" />
      <div className="container px-4 py-12">
        <div className="relative mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-rajdhani mb-4 text-lg font-semibold">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground/90 transition-all hover:text-foreground hover:brightness-125 hover:translate-x-0.5"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-border/50 pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="font-orbitron text-xl font-bold">NextLevel</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary">
              Terms
            </a>
            <span>•</span>
            <a href="#" className="hover:text-primary">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-primary">
              Cookies
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Discord className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 bg-primary/20 hover:bg-primary/30 backdrop-blur-xs ring-1 ring-white/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>

          <div className="text-sm text-muted-foreground/80">
            © 2024 NextLevel. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
