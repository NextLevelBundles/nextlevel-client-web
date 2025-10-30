"use server";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { TowerControl as GameController } from "lucide-react";
import { TimerCountdown } from "./timer-countdown";
import Link from "next/link";
import { HeroImage } from "./hero-image";
import { serverApiClient } from "@/lib/server-api";

export async function HeroSection() {
  let bundle = null;
  
  try {
    bundle = await serverApiClient.getFeaturedBundle();
  } catch (error) {
    console.error("Error fetching featured bundle:", error);
    // Return null to gracefully handle the error
    return null;
  }

  if (!bundle) {
    console.log("No featured bundle available");
    return null;
  }

  console.log("Hero Section Response:", bundle);

  return (
    <section className="relative overflow-hidden py-20 lg:py-32 bg-linear-to-b from-background via-background/95 to-background">
      <div className="absolute inset-0 bg-[url('/images/hero-background.jpg')] bg-cover bg-center bg-no-repeat opacity-10 scale-105 transition-all duration-1000 ease-out" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(57,130,245,0.15),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(249,113,20,0.1),transparent_50%)]" />

      <div className="container relative mx-auto px-4 transition-all duration-700 ease-out opacity-100 translate-y-0">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="font-orbitron mb-4 text-4xl font-bold leading-[1.1] tracking-tighter text-[#1a1a1a] dark:text-primary md:text-6xl lg:text-7xl bg-[linear-gradient(135deg,rgba(57,130,245,0.2),transparent_80%)] dark:bg-transparent bg-clip-text">
                <span className="block bg-linear-to-r from-teal-500 via-violet-500 to-orange-500 bg-clip-text text-transparent">
                  {bundle.title}
                </span>
              </h1>
              <p className="text-lg text-[#4b5563] dark:text-muted-foreground md:text-xl font-medium">
                {bundle.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <TimerCountdown endTime={bundle.endsAt} />
              <div className="rounded-lg bg-white/60 dark:bg-muted/50 p-4 backdrop-blur-xs ring-1 ring-black/5 dark:ring-white/10 shadow-xs before:absolute before:inset-[1px] before:rounded-lg before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none relative sm:bg-white/50 md:bg-white/60 lg:bg-white/70">
                <div className="flex items-center gap-2 text-[#64748b] dark:text-muted-foreground">
                  <GameController className="h-5 w-5" />
                  <span>Starting at</span>
                </div>
                <div className="font-mono text-2xl font-bold text-primary">
                  ${bundle.minPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href={`/bundles/${bundle.id}/buy`}
                className="cursor-pointer"
              >
                <Button
                  size={"lg"}
                  className="cursor-pointer bg-primary text-primary-foreground px-6 py-3 rounded-md shadow-lg hover:scale-105 hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all duration-300 animate-glow"
                >
                  Buy Now
                </Button>
              </Link>

              <Link className="cursor-pointer" href={`/bundles/${bundle.id}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer px-6 py-3 hover:bg-secondary/10 hover:text-secondary hover:scale-105 hover:shadow-lg hover:shadow-secondary/20 dark:hover:shadow-secondary/30 transition-all duration-300"
                >
                  View Bundle
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary/50 via-secondary/50 to-primary/50 blur-2xl opacity-40 dark:opacity-30 animate-pulse-slow" />
            <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(57,130,245,0.2),rgba(249,113,20,0.2))] animate-pulse-slow" />
            <Card className="group relative overflow-hidden rounded-xl border border-white/20 dark:border-border bg-white/80 dark:bg-card/50 p-2 backdrop-blur-xs lg:mt-0 animate-float shadow-xl dark:shadow-2xl hover:shadow-2xl hover:shadow-primary/20 dark:hover:shadow-primary/30 transition-all duration-300 before:absolute before:inset-[1px] before:rounded-xl before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none sm:bg-white/70 md:bg-white/75 lg:bg-white/80">
              <div className="relative aspect-16/9 overflow-hidden rounded-lg">
                <HeroImage images={bundle.imageMedia} title={bundle.title} />
              </div>
              <div className="hidden dark:block absolute inset-0 rounded-lg bg-linear-to-t from-background/80 via-background/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 rounded-lg bg-linear-to-br from-primary/[0.07] to-orange-500/[0.07] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Card>
            <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-br from-primary/40 via-secondary/40 to-orange-500/40 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        </div>
      </div>
    </section>
  );
}