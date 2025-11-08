"use client";

import { Card } from "@/shared/components/ui/card";
import { Award, Flame, Star, Zap, Crown, Heart } from "lucide-react";

const badges = [
  {
    icon: Star,
    name: "🌟 Early Adopter",
    description: "Joined during our launch phase",
    color: "bg-primary/20 text-primary",
    criteria: "Join during our beta phase",
  },
  {
    icon: Crown,
    name: "👑 Founder",
    description: "Supported us from day one",
    color: "bg-secondary/20 text-secondary",
    criteria: "Be one of our first 1000 users",
  },
  {
    icon: Heart,
    name: "❤️ Charity Champion",
    description: "Top charity contributor",
    color: "bg-primary/20 text-primary",
    criteria: "Donate over $100 to charities",
  },
  {
    icon: Zap,
    name: "⚡ Power Buyer",
    description: "Purchased 10+ bundles",
    color: "bg-secondary/20 text-secondary",
    criteria: "Purchase 10 or more bundles",
  },
  {
    icon: Flame,
    name: "🔥 Trendsetter",
    description: "First to buy new bundles",
    color: "bg-primary/20 text-primary",
    criteria: "Be among first 100 buyers of any bundle",
  },
  {
    icon: Award,
    name: "🏆 Game Master",
    description: "Redeemed 100+ games",
    color: "bg-secondary/20 text-secondary",
    criteria: "Redeem 100 or more games",
  },
];

export function BadgesPreview() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,130,245,0.15),transparent_70%),radial-gradient(ellipse_at_bottom,rgba(249,113,20,0.1),transparent_70%)] opacity-30 dark:opacity-40" />
      <div className="container relative px-4 mx-auto">
        <div className="relative rounded-3xl bg-white/90 dark:bg-primary/10 px-6 py-12 border border-white/20 dark:border-border shadow-xl dark:shadow-2xl hover:shadow-[0_4px_40px_rgba(57,130,245,0.15)] dark:hover:shadow-[0_4px_30px_rgba(57,130,245,0.2)] transition-all duration-300">
          <div className="absolute inset-0 bg-linear-to-br rounded-3xl opacity-20 from-[#3982f5]/10 to-[#f97114]/10 dark:from-[#3982f5]/30 dark:to-[#f97114]/30" />
          <div className="relative mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl text-[#1c1c1e] dark:text-foreground">
              Unlock Achievements
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Earn exclusive badges as you support developers and charities
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden bg-white/80 dark:bg-muted/50 backdrop-blur-xs p-6 transition-all hover:translate-y-[-2px] hover:bg-white/95 dark:hover:bg-card hover:shadow-[0_4px_20px_rgba(57,130,245,0.2)] border border-white/20 dark:border-border hover:border-primary/50 dark:hover:ring-1 dark:hover:ring-primary/30 animate-fade-up cursor-pointer will-change-transform rounded-xl ring-1 ring-black/5 dark:ring-white/20 before:absolute before:inset-[1px] before:rounded-lg before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none"
                style={{ animationDelay: `${index * 100}ms` }}
                title={`How to earn: ${badge.criteria}`}
              >
                <div
                  className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl ${badge.color} backdrop-blur-xs transition-all duration-200 group-hover:scale-105 group-hover:brightness-110 will-change-transform ring-1 ring-primary/30 dark:ring-border shadow-inner`}
                >
                  <badge.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#1c1c1e] dark:text-foreground group-hover:text-primary transition-colors">
                  {badge.name}
                </h3>
                <p className="text-sm text-[#4b5563] dark:text-muted-foreground">
                  {badge.description}
                </p>
                <div className="mt-4 text-xs text-[#64748b] dark:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to learn more
                </div>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-xs" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
