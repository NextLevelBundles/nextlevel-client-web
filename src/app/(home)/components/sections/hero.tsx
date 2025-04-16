"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import { Card } from "@/app/(shared)/components/ui/card";
import { TowerControl as GameController, Timer } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [timeLeft, setTimeLeft] = useState("00:00:00");

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

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=3265&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-10" />
      <div className="absolute inset-0 bg-linear-to-b from-background/80 to-background" />

      <div className="container relative mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="font-orbitron mb-6 text-4xl font-bold leading-tight tracking-tighter text-primary md:text-6xl lg:text-7xl">
                Indie Legends
                <span className="block bg-linear-to-r from-teal-500 to-violet-500 bg-clip-text text-transparent">
                  Bundle 2025
                </span>
              </h1>
              <p className="text-lg text-muted-foreground/90 md:text-xl font-medium">
                20+ award-winning indie games including &quot;Stellar
                Drift&quot;, &quot;Neon Abyss&quot;, and more. Pay what you want
                and support game developers worldwide.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-muted/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer className="h-5 w-5" />
                  <span className="text-secondary">Ends in</span>
                </div>
                <div className="font-mono text-2xl font-bold text-secondary">
                  {timeLeft}
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
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
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md shadow-sm hover:scale-105 hover:shadow-lg transition animate-glow"
              >
                Buy Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-6 py-3 hover:bg-secondary/10 hover:text-secondary hover:scale-105 transition"
              >
                View Bundle
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary/50 via-secondary/50 to-primary/50 blur-2xl opacity-30 animate-pulse-slow" />
            <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10 animate-pulse-slow" />
            <Card className="relative overflow-hidden rounded-xl border-0 bg-card/50 p-2 backdrop-blur-sm lg:mt-0 animate-float">
              <div className="aspect-16/9 overflow-hidden rounded-lg relative">
                <Image
                  fill={true}
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2940&auto=format&fit=crop"
                  alt="Featured Games Collection"
                  className="h-full w-full object-cover transition-all duration-700 hover:brightness-110"
                />
              </div>
              <div className="absolute inset-0 rounded-lg bg-linear-to-t from-background/80 via-background/20 to-transparent" />
            </Card>
            <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-primary/30 to-secondary/30 opacity-0 blur-sm transition-opacity animate-glow" />
          </div>
        </div>
      </div>
    </section>
  );
}
