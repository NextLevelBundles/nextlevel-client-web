"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/(shared)/components/ui/button";
import { Card } from "@/app/(shared)/components/ui/card";
import {
  AlertTriangle,
  WifiOff,
  ServerCrash,
  Shield,
  RefreshCw,
  Home,
  Gamepad2,
  ChevronRight,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/app/(shared)/utils/tailwind";

interface ErrorCard {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
}

const errorReasons: ErrorCard[] = [
  {
    icon: WifiOff,
    iconColor: "text-red-500",
    title: "Connection issue",
    description: "Check your internet connection and try refreshing the page",
  },
  {
    icon: ServerCrash,
    iconColor: "text-orange-500",
    title: "Server problem",
    description: "Our servers might be experiencing issues. Please try again later",
  },
  {
    icon: Shield,
    iconColor: "text-yellow-500",
    title: "Access denied",
    description: "You may not have permission to view this content",
  },
];

interface BundleErrorProps {
  error?: Error | null;
  retry?: () => void;
}

export function BundleError({ error, retry }: BundleErrorProps) {
  const [hoveredReason, setHoveredReason] = useState<number | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (retry) {
      setIsRetrying(true);
      try {
        await retry();
      } finally {
        setIsRetrying(false);
      }
    } else {
      // Fallback to page reload
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl w-full">
        {/* Error Icon with Animation */}
        <div className="relative mb-8">
          <div className="flex justify-center">
            <div className="relative">
              {/* Animated Background Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 rounded-full bg-destructive/10 animate-pulse" />
              </div>
              
              {/* Main Error Icon */}
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative bg-gradient-to-br from-destructive/10 to-orange-500/10 p-6 rounded-full">
                      <AlertTriangle className="h-16 w-16 md:h-20 md:w-20 text-destructive animate-pulse" />
                    </div>
                  </div>
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
              Something Went Wrong
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              We encountered an error while loading this bundle
            </p>
            {error?.message && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-destructive font-mono">
                  {error.message}
                </p>
              </div>
            )}
          </div>

          {/* Possible Reasons - Interactive Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {errorReasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <Card
                  key={index}
                  className={cn(
                    "relative p-6 cursor-pointer transition-all duration-300 border-2",
                    hoveredReason === index
                      ? "border-destructive/50 shadow-lg shadow-destructive/10 scale-105"
                      : "border-border/50 hover:border-border"
                  )}
                  onMouseEnter={() => setHoveredReason(index)}
                  onMouseLeave={() => setHoveredReason(null)}
                >
                  {/* Card Glow Effect */}
                  {hoveredReason === index && (
                    <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-orange-500/5 rounded-lg" />
                  )}
                  
                  <div className="relative space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors duration-300",
                        hoveredReason === index ? "bg-destructive/10" : "bg-muted"
                      )}>
                        <Icon className={cn("h-5 w-5", reason.iconColor)} />
                      </div>
                      {hoveredReason === index && (
                        <ChevronRight className="h-4 w-4 text-destructive animate-pulse" />
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
                onClick={handleRetry}
                disabled={isRetrying}
              >
                <RefreshCw className={cn(
                  "h-4 w-4",
                  isRetrying && "animate-spin"
                )} />
                {isRetrying ? "Retrying..." : "Try Again"}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="min-w-[200px] gap-2 group"
                asChild
              >
                <Link href="/bundles">
                  <Gamepad2 className="h-4 w-4" />
                  Browse Bundles
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

            {/* Help Link */}
            <div className="flex items-center gap-6 text-sm">
              <Link 
                href="/customer/support" 
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
              >
                <AlertCircle className="h-3 w-3" />
                <span>Contact Support</span>
                <ChevronRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </Link>
            </div>
          </div>

          {/* Bottom Decorative Element */}
          <div className="flex justify-center pt-8">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-destructive/30 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-destructive/50 animate-pulse delay-75" />
                <div className="h-2 w-2 rounded-full bg-destructive/30 animate-pulse delay-150" />
              </div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}