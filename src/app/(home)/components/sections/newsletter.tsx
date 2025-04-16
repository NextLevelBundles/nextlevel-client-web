"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Shield, Mail } from "lucide-react";

export function Newsletter() {
  return (
    <section className="relative overflow-hidden py-24 mt-12 bg-[radial-gradient(ellipse_at_center,rgba(249,113,20,0.12),transparent_80%)]">
      <div className="container relative px-4">
        <div className="mx-auto max-w-2xl text-center relative">
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-xl" />
          <div className="relative bg-card/90 backdrop-blur-xs rounded-3xl p-8 shadow-2xl ring-1 ring-white/20 hover:shadow-[0_0_30px_rgba(57,130,245,0.2)] transition-shadow duration-300">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="font-orbitron mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Stay in the Game
            </h2>
            <p className="mb-8 text-muted-foreground">
              Subscribe to our newsletter for exclusive bundle alerts, gaming
              news, and special offers
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="h-12 border-0 bg-muted/40 pl-12 backdrop-blur-xs ring-1 ring-white/20 focus:ring-primary focus:ring-2 hover:ring-white/30 transition-all"
                />
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md shadow-lg hover:scale-105 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 animate-glow"
              >
                Subscribe
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Your email is safe with us. We hate spam too.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
