"use client";

import Logo from "@/app/(shared)/components/logo";
import { Button } from "@/shared/components/ui/button";
import { Twitter, Github, Disc as Discord, ArrowUp } from "lucide-react";
import Link from "next/link";

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
    <footer className="relative border-t border-[#e5e5e5]/30 dark:border-border/50 bg-linear-to-b from-background via-white to-[#fafafa] dark:via-[#0e121b] dark:to-[#090c12] shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(57,130,245,0.05),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(57,130,245,0.08),transparent_60%)] pointer-events-none" />
      <div className="container px-4 py-12">
        {/* <div className="relative mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-lg font-semibold text-[#1a1a1a] dark:text-foreground">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#4b5563] dark:text-muted-foreground transition-all hover:text-[#1a1a1a] dark:hover:text-foreground hover:translate-x-0.5"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div> */}

        <div className="flex flex-col items-center justify-between gap-6 border-[#e5e5e5]/50 dark:border-border/50  sm:flex-row">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-3">
              <Logo width={120} height={0} />
            </Link>
          </div>

          <div className="flex items-center gap-4 text-sm text-[#4b5563] dark:text-muted-foreground">
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <span>•</span>
            <Link
              href="/privacy-policy"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <span>•</span>
            <Link
              href="/cookies"
              className="hover:text-primary transition-colors"
            >
              Cookies
            </Link>
          </div>

          {/* <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#3a3a3a] dark:text-foreground hover:text-primary dark:hover:text-primary transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#3a3a3a] dark:text-foreground hover:text-primary dark:hover:text-primary transition-colors"
            >
              <Discord className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#3a3a3a] dark:text-foreground hover:text-primary dark:hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5" />
            </Button>
          </div> */}

          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 backdrop-blur-xs ring-1 ring-black/5 dark:ring-white/20 hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 transition-all duration-300"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>

          <div className="text-sm text-[#3a3a3a] dark:text-muted-foreground/80">
            © {new Date().getFullYear()} Digiphile. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
