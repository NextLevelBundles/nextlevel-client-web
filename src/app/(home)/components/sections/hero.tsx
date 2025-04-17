"use client";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { TowerControl as GameController, Timer } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

export function HeroSection() {
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 48);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("ENDED");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-20 lg:py-32 bg-linear-to-b from-background via-background/95 to-background"
    >
      <div
        className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=3265&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-0 transition-all duration-1000 ease-out ${
          isVisible ? "opacity-10 scale-105" : "scale-110"
        }`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(57,130,245,0.15),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(249,113,20,0.1),transparent_50%)]" />

      <div
        className={`container relative mx-auto px-4 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="font-orbitron mb-4 text-4xl font-bold leading-[1.1] tracking-tighter text-[#1a1a1a] dark:text-primary md:text-6xl lg:text-7xl bg-[linear-gradient(135deg,rgba(57,130,245,0.2),transparent_80%)] dark:bg-transparent bg-clip-text">
                Indie Legends
                <span className="block bg-linear-to-r from-teal-500 via-violet-500 to-orange-500 bg-clip-text text-transparent">
                  Bundle 2025
                </span>
              </h1>
              <p className="text-lg text-[#4b5563] dark:text-muted-foreground md:text-xl font-medium">
                20+ award-winning indie games including &quot;Stellar
                Drift&quot;, &quot;Neon Abyss&quot;, and more. Pay what you want
                and support game developers worldwide.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-white/60 dark:bg-muted/50 p-4 backdrop-blur-xs ring-1 ring-black/5 dark:ring-white/10 shadow-xs before:absolute before:inset-[1px] before:rounded-lg before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none relative sm:bg-white/50 md:bg-white/60 lg:bg-white/70">
                <div className="flex items-center gap-2 text-[#64748b] dark:text-muted-foreground">
                  <Timer className="h-5 w-5" />
                  <span className="text-secondary">Ends in</span>
                </div>
                <div className="font-mono text-2xl font-bold text-secondary">
                  {timeLeft}
                </div>
              </div>

              <div className="rounded-lg bg-white/60 dark:bg-muted/50 p-4 backdrop-blur-xs ring-1 ring-black/5 dark:ring-white/10 shadow-xs before:absolute before:inset-[1px] before:rounded-lg before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none relative sm:bg-white/50 md:bg-white/60 lg:bg-white/70">
                <div className="flex items-center gap-2 text-[#64748b] dark:text-muted-foreground">
                  <GameController className="h-5 w-5" />
                  <span>Starting at</span>
                </div>
                <div className="font-mono text-2xl font-bold text-primary">
                  $9.99
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md shadow-lg hover:scale-105 hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/40 transition-all duration-300 animate-glow"
                onClick={() => (window.location.href = `/bundles/1`)}
              >
                Buy Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-6 py-3 hover:bg-secondary/10 hover:text-secondary hover:scale-105 hover:shadow-lg hover:shadow-secondary/20 dark:hover:shadow-secondary/30 transition-all duration-300"
                onClick={() => (window.location.href = `/bundles/1`)}
              >
                View Bundle
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary/50 via-secondary/50 to-primary/50 blur-2xl opacity-40 dark:opacity-30 animate-pulse-slow" />
            <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(57,130,245,0.2),rgba(249,113,20,0.2))] animate-pulse-slow" />
            <Card className="group relative overflow-hidden rounded-xl border border-white/20 dark:border-border bg-white/80 dark:bg-card/50 p-2 backdrop-blur-xs lg:mt-0 animate-float shadow-xl dark:shadow-2xl hover:shadow-2xl hover:shadow-primary/20 dark:hover:shadow-primary/30 transition-all duration-300 before:absolute before:inset-[1px] before:rounded-xl before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none sm:bg-white/70 md:bg-white/75 lg:bg-white/80">
              <div className="relative aspect-16/9 overflow-hidden rounded-lg">
                <Image
                  fill={true}
                  sizes="100vw"
                  quality={80}
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2940&auto=format&fit=crop"
                  alt="Featured Games Collection"
                  className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110 group-hover:saturate-[1.1]"
                />
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
