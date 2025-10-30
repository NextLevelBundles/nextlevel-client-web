"use client";

import { Card } from "@/app/(shared)/components/ui/card";
import { Markdown } from "@/app/(shared)/components/ui/markdown";
import { MessageSquare } from "lucide-react";
import { cn } from "@/app/(shared)/utils/tailwind";

interface CuratorCommentsProps {
  content: string;
  className?: string;
  compact?: boolean;
}

export function CuratorComments({ content, className, compact = false }: CuratorCommentsProps) {
  if (!content || content.trim() === "") {
    return null;
  }

  if (compact) {
    return (
      <Card className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-br from-card to-primary/5",
        "border border-primary/15",
        className
      )}>
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
        
        <div className="relative p-4">
          {/* Compact Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Curator's Note</h3>
          </div>
          
          {/* Content */}
          <div className="relative">
            <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 to-transparent rounded-full" />
            <div className="pl-3">
              <Markdown content={content} className="text-xs prose-sm" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden",
      "bg-gradient-to-br from-card via-card to-primary/5",
      "border-2 border-primary/20",
      "shadow-lg",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />
      
      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Curator's Note</h3>
            <p className="text-xs text-muted-foreground">
              From the NextLevel team
            </p>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative">
          <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 via-primary/30 to-transparent rounded-full" />
          <div className="pl-4">
            <Markdown content={content} className="text-sm md:text-base" />
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-75" />
            <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-150" />
          </div>
          <span className="text-xs text-muted-foreground italic">
            Handpicked for you
          </span>
        </div>
      </div>
    </Card>
  );
}