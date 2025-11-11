"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/(shared)/components/ui/button";
import { Card } from "@/app/(shared)/components/ui/card";
import {
  Package,
  MapPin,
  Clock,
  Search,
  Home,
  Gamepad2,
  AlertCircle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/app/(shared)/utils/tailwind";

interface ReasonCard {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
}

const reasons: ReasonCard[] = [
  {
    icon: Search,
    iconColor: "text-purple-500",
    title: "Collection doesn't exist",
    description: "The collection ID may be incorrect or has been removed from our catalog",
  },
  {
    icon: Clock,
    iconColor: "text-amber-500",
    title: "Collection hasn't started yet",
    description: "This collection may not have been published or isn't available yet",
  },
  {
    icon: AlertCircle,
    iconColor: "text-red-500",
    title: "Collection revoked",
    description: "This collection has been revoked and is no longer available for purchase",
  },
];

export function BundleNotFound() {
  const [hoveredReason, setHoveredReason] = useState<number | null>(null);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl w-full">
        {/* 404 Error Code - Floating Animation */}
        <div className="relative mb-8">
          <div className="flex justify-center">
            <div className="relative">
              {/* Animated Background Numbers */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[150px] font-bold text-primary/5 select-none animate-pulse">
                  404
                </span>
              </div>
              
              {/* Main 404 Display */}
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-4">
                  <span className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent animate-gradient-x">
                    4
                  </span>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-full">
                      <Package className="h-12 w-12 md:h-16 md:w-16 text-primary animate-float" />
                    </div>
                  </div>
                  <span className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-secondary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient-x">
                    4
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold">
              Collection Not Found
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Oops! We couldn't locate the collection you're looking for
            </p>
          </div>

          {/* Reason Cards - Interactive Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <Card
                  key={index}
                  className={cn(
                    "relative p-6 cursor-pointer transition-all duration-300 border-2",
                    hoveredReason === index
                      ? "border-primary/50 shadow-lg shadow-primary/10 scale-105"
                      : "border-border/50 hover:border-border"
                  )}
                  onMouseEnter={() => setHoveredReason(index)}
                  onMouseLeave={() => setHoveredReason(null)}
                >
                  {/* Card Glow Effect */}
                  {hoveredReason === index && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg" />
                  )}
                  
                  <div className="relative space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors duration-300",
                        hoveredReason === index ? "bg-primary/10" : "bg-muted"
                      )}>
                        <Icon className={cn("h-5 w-5", reason.iconColor)} />
                      </div>
                      {hoveredReason === index && (
                        <ChevronRight className="h-4 w-4 text-primary animate-pulse" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm">{reason.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Action Section */}
          <div className="flex flex-col items-center space-y-6">
            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                className="group min-w-[200px] gap-2"
                asChild
              >
                <Link href="/collections">
                  <Gamepad2 className="h-4 w-4" />
                  Browse Collections
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="min-w-[200px] gap-2 group"
                asChild
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Help Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/customer/support"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
              >
                <AlertCircle className="h-3 w-3" />
                <span>Get Help</span>
                <ChevronRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </Link>
            </div>
          </div>

          {/* Bottom Decorative Element */}
          <div className="flex justify-center pt-8">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary/30 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse delay-75" />
                <div className="h-2 w-2 rounded-full bg-primary/30 animate-pulse delay-150" />
              </div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}