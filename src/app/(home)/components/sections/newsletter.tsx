"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Shield, Mail } from "lucide-react";

export function Newsletter() {
  return (
    <section className="relative overflow-hidden py-24 mt-12 mb-[-1px]">
      <div className="absolute inset-0 gradient-bg-light dark:gradient-bg-dark opacity-30 dark:opacity-40" />
      <div className="container relative px-4">
        <div className="mx-auto max-w-2xl text-center relative">
          <div className="absolute inset-0 bg-linear-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-3xl blur-xl opacity-40 dark:opacity-30 transition-opacity group-hover:opacity-50" />
          <div className="group relative bg-white/90 dark:bg-card/90 backdrop-blur-xs rounded-3xl p-8 shadow-xl dark:shadow-2xl border border-white/20 dark:border-border hover:shadow-[0_4px_40px_rgba(57,130,245,0.15)] dark:hover:shadow-[0_4px_30px_rgba(57,130,245,0.2)] transition-all duration-300 before:absolute before:inset-[1px] before:rounded-[23px] before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="font-orbitron mb-4 text-3xl font-bold tracking-tight md:text-4xl text-[#1c1c1e] dark:text-foreground">
              Stay in the Game
            </h2>
            <p className="mb-8 text-[#4b5563] dark:text-muted-foreground">
              Subscribe to our newsletter for exclusive bundle alerts, gaming
              news, and special offers
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="h-12 border-0 bg-white/50 dark:bg-muted/40 pl-12 backdrop-blur-xs ring-1 ring-border/40 dark:ring-white/20 focus:ring-primary focus:ring-2 hover:ring-primary/30 dark:hover:ring-white/30 transition-all group-hover:bg-white/60 dark:group-hover:bg-muted/50"
                />
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md shadow-lg hover:scale-105 hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all duration-300 animate-glow group-hover:shadow-primary/20"
              >
                Subscribe
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#64748b] dark:text-muted-foreground group-hover:text-[#4b5563] transition-colors">
              <Shield className="h-4 w-4" />
              <span>Your email is safe with us. We hate spam too.</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </section>
  );
}
