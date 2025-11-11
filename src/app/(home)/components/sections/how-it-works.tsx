"use client";

import { Shield, Clock, Gem, RefreshCcw, Heart, Sparkles } from "lucide-react";

const differences = [
  {
    icon: Shield,
    title: "Completely Independent",
    description:
      "We're former Humble Bundlers, self-funded, and only answer to our community, not to profit-driven shareholders.",
  },
  {
    icon: Clock,
    title: "No Overselling",
    description: "Keys are reserved the moment you checkout. No waiting.",
  },
  {
    icon: Sparkles,
    title: "Limited-Time Events",
    description:
      "One headline collection at a time, two weeks long or until we sell out, maximum two collections per month. No re-runs.",
  },
  {
    icon: Gem,
    title: "No Filler",
    description:
      "Our headline collections feature the best games of their kind from the past two or three years that haven't been bundled before.",
  },
  {
    icon: RefreshCcw,
    title: "Key Exchange",
    description:
      "Trade in keys you already own for credit to get another game on the Digiphile Exchange.",
  },
  {
    icon: Heart,
    title: "Donation Bonus + Unlocked Charity",
    description:
      "Donate to unlock bonus content, including exclusive artwork, and know that 100% of extra donations (minus processing fees) go directly to charity.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-20 px-6 md:px-12">
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-orange-50 dark:from-transparent dark:via-transparent dark:to-transparent" />
      <div className="container relative px-4 mx-auto">
        <div className="relative rounded-3xl bg-white/80 dark:bg-card/80 px-6 py-12 backdrop-blur-xs border border-border/40 dark:border-border">
          <div className="absolute inset-0 bg-linear-to-br from-[#3982f5]/80 to-[#f97114]/80 dark:from-[#3982f5]/30 dark:to-[#f97114]/30 rounded-3xl opacity-20" />
          <div className="relative mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl text-[#1c1c1e] dark:text-foreground">
              How We're Different
            </h2>
            <p className="text-muted-foreground">
              Built by gamers, for gamers—with integrity at our core
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differences.map((item, index) => (
              <div
                key={index}
                className="group relative flex flex-col gap-4 p-6 bg-[#f9f9fc] dark:bg-background/40 rounded-2xl shadow-xs dark:shadow-md hover:translate-y-[-2px] transition-all animate-fade-up will-change-transform border border-border/0 dark:border-border"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-[#1c1c1e] dark:text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="rounded-xl bg-white dark:bg-primary/10 p-3 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/[0.08] dark:group-hover:bg-primary/[0.15] transition-all duration-300 border border-border/40 dark:border-border">
                  <item.icon className="h-8 w-8 text-primary group-hover:animate-pulse" />
                </div>

                <p className="text-sm text-[#4b5563] dark:text-muted-foreground relative">
                  {item.description}
                </p>

                <div className="h-0.5 bg-linear-to-r from-primary/40 to-secondary/40 opacity-0 group-hover:opacity-100 transition-opacity mt-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
