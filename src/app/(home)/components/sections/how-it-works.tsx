"use client"

import { Gamepad2, Coins, Trophy } from "lucide-react"

const steps = [
  {
    icon: Gamepad2,
    title: "Choose Your Bundle",
    description: "Browse our curated collection of premium game bundles and pick your favorite.",
    color: "from-primary/20 to-primary/10"
  },
  {
    icon: Coins,
    title: "Pay What You Want",
    description: "Set your own price and choose how to split it between developers and charities.",
    color: "from-secondary/20 to-secondary/10"
  },
  {
    icon: Trophy,
    title: "Play & Earn",
    description: "Get instant access to your games and start earning achievement badges.",
    color: "from-primary/20 to-primary/10"
  }
]

export function HowItWorks() {
  return (
    <section className="py-20 px-6 md:px-12">
      <div className="container relative px-4 mx-auto">
        <div className="relative rounded-3xl bg-card/80 px-6 py-12">
          <div className="absolute inset-0 bg-linear-to-br from-[#3982f5]/30 to-[#f97114]/30 rounded-3xl opacity-20" />
          <div className="relative mb-12 text-center">
            <span className="mb-2 inline-block text-sm font-medium text-primary">Quick Start Guide</span>
            <h2 className="font-orbitron mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Get started with NextLevel in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group flex flex-col gap-4 p-6 bg-background/40 rounded-2xl shadow-md hover:translate-y-[-2px] transition-all animate-fade-up will-change-transform"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/20 text-primary w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <h3 className="font-rajdhani text-xl font-semibold group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                </div>
                
                <div className="rounded-xl bg-primary/10 p-3 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                
                <div className="h-0.5 bg-linear-to-r from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity mt-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}