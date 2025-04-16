"use client";

import { Card } from "@/home/components/ui/card";
import { Button } from "@/home/components/ui/button";
import { Heart, Users, Trophy, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

const stats = [
  {
    icon: Heart,
    value: "$12.5M+",
    label: "Raised for Charity",
    gradient: "from-primary/20 to-secondary/20",
  },
  {
    icon: Users,
    value: "850K+",
    label: "Active Gamers",
    gradient: "from-secondary/20 to-primary/20",
  },
  {
    icon: Trophy,
    value: "2.1M+",
    label: "Games Delivered",
    gradient: "from-primary/20 to-secondary/20",
  },
];

const charities = [
  "https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?q=80&w=2940&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2940&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2940&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608555855762-2b657eb1c348?q=80&w=2940&auto=format&fit=crop",
];

const recentActivities = [
  "Sarah D. just donated $25 to Save the Children",
  "John M. purchased Indie Legends Bundle",
  "Emma R. contributed $50 to UNICEF",
  "Alex K. bought RPG Masters Bundle",
];

export function CharityStats() {
  const [currentActivity, setCurrentActivity] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % recentActivities.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 mt-12 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,130,245,0.15),transparent_70%),radial-gradient(ellipse_at_bottom,rgba(249,113,20,0.15),transparent_70%)] opacity-40" />
      <div className="container px-4">
        <div className="relative rounded-3xl bg-card/60 backdrop-blur-xs px-6 py-16 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#3982f5]/10 to-[#f97114]/10 rounded-3xl" />
          <div className="relative">
            <div className="mb-12 text-center">
              <span className="mb-2 inline-block text-sm font-medium text-primary animate-pulse">
                Community Impact
              </span>
              <h2 className="font-orbitron mb-4 text-3xl font-bold tracking-tight md:text-4xl bg-linear-to-br from-primary to-secondary text-transparent bg-clip-text">
                Making a Difference
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Together with our amazing community, we&apos;re changing lives
                through gaming. Every bundle you purchase helps support both
                indie developers and global charities.
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {stats.map((stat, index) => (
                <div key={index} className="relative group">
                  <div
                    className={`absolute -inset-1 rounded-2xl bg-linear-to-r ${stat.gradient} blur-xl opacity-60 transition-opacity group-hover:opacity-100`}
                  />
                  <Card
                    className="relative overflow-hidden border-0 bg-card/70 p-8 backdrop-blur-xs animate-fade-up hover:translate-y-[-2px] transition-all hover:shadow-2xl ring-1 ring-white/20 hover:ring-primary/50"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary animate-pulse">
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="font-rajdhani text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <p className="text-base text-muted-foreground">
                      {stat.label}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-primary/50 via-secondary/50 to-primary/50 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                  </Card>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 backdrop-blur-xs text-sm text-muted-foreground animate-pulse">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping" />
                {recentActivities[currentActivity]}
              </div>
            </div>

            <div className="mt-12">
              <div className="mx-auto flex max-w-4xl items-center justify-center gap-6 flex-wrap">
                {charities.map((charity, index) => (
                  <div key={index} className="group relative">
                    <div className="absolute -inset-1 rounded-full bg-linear-to-r from-primary/20 to-secondary/20 blur-lg opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted/30 backdrop-blur-xs ring-1 ring-white/20 group-hover:ring-primary/50 transition-all">
                      <Image
                        src={charity}
                        alt={`Charity Partner ${index + 1}`}
                        fill={true}
                        className="h-full w-full object-cover opacity-75 transition-all group-hover:opacity-100 group-hover:scale-110"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  className="relative group hover:bg-primary/10"
                >
                  View All Partners
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
